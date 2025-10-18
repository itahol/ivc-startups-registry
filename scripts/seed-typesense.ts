import arg, { ArgError } from 'arg';
import { NotNull } from 'kysely';
import ora from 'ora';
import { setDefaultConfiguration } from 'typesense-ts';
import { QUERIES } from '../lib/server/db/queries';
import {
  ALL_SCHEMAS,
  boardMemberSchema,
  companiesSchema,
  executiveSchema,
  personSchema,
} from '../lib/server/typesense/schema';

const BATCH_SIZE = 200;
const CONCURRENCY = 10;

const spinner = ora().start();

setDefaultConfiguration({
  apiKey: 'xyz',
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
});

async function initTypesense() {
  for (const schmea of ALL_SCHEMAS) {
    await schmea.create();
  }
}

// await initTypesense();
type CompanyDoc = {
  id: string;
  companyID: string;
  companyName: string;
  shortName?: string;
  companyDescription?: string;
  technology?: string;
  sector: string;
  stage: string;
  establishedYear?: number;
  employees?: number;
  techVerticals: string[];
  executives: string[];
  boardMembers: string[];
  investors: string[];
};

type ExecutiveDoc = {
  id: string;
  companyID: string;
  personID: string;
  companyName?: string;
  personName?: string;
  title?: string;
  isCurrent?: boolean;
};

async function fetchAllIds(): Promise<string[]> {
  const idRows = await QUERIES.dbRead
    .selectFrom('Profiles')
    .select('Profiles.Company_ID as companyID')
    .where('Company_Type2', '=', 'HT')
    .where('Company_ID', 'is not', null)
    .where('Stage', 'is not', null)
    .where('Sector', 'is not', null)
    .$narrowType<{ companyID: NotNull }>()
    .execute();

  return idRows.map((r) => r.companyID);
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function dedupe(arr: (string | null)[]): string[] {
  return Array.from(new Set(arr.filter((s): s is string => s !== null && s.trim().length > 0).map((s) => s.trim())));
}

function clean(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function numOrUndefined(value: number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return value;
}

function stripEmpty(doc: CompanyDoc): CompanyDoc {
  const result: Partial<CompanyDoc> = {
    id: doc.id,
    companyID: doc.companyID,
    companyName: doc.companyName,
    sector: doc.sector,
    stage: doc.stage,
    techVerticals: doc.techVerticals,
    executives: doc.executives,
    boardMembers: doc.boardMembers,
    investors: doc.investors,
  };

  if (doc.shortName !== undefined) result.shortName = doc.shortName;
  if (doc.companyDescription !== undefined) result.companyDescription = doc.companyDescription;
  if (doc.technology !== undefined) result.technology = doc.technology;
  if (doc.establishedYear !== undefined) result.establishedYear = doc.establishedYear;
  if (doc.employees !== undefined) result.employees = doc.employees;

  return result as CompanyDoc;
}

function makeRelationId({ companyId, personId }: { companyId: string; personId: string }): string {
  const sanitize = (value: string) => value.trim().replace(/[^a-zA-Z0-9_-]+/g, '-');
  const parts = [sanitize(companyId), sanitize(personId)];
  return parts.join('_');
}

async function pLimitMap<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<(R | undefined)[]> {
  const results: (R | undefined)[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const promise = fn(item)
      .then((result) => {
        results[i] = result;
      })
      .catch(() => {
        results[i] = undefined;
      });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing.map((p) => p.then(() => executing.splice(executing.indexOf(p), 1))));
    }
  }

  await Promise.all(executing);
  return results;
}

async function validateCollectionExists(schema: (typeof ALL_SCHEMAS)[number]) {
  spinner.text = 'Checking collection';

  try {
    await schema.retrieve();
    spinner.succeed('Collection already exists');
  } catch (e: unknown) {
    spinner.info('Creating collection');
    await schema.create();
    spinner.succeed('Collection created');
  }
}

async function indexCollection<T extends (typeof ALL_SCHEMAS)[number]>(
  schema: T,
  documentsIterator: AsyncIterable<any[]>,
) {
  await validateCollectionExists(schema);
  let importedDocs = 0;
  let importedChunks = 0;

  spinner.info('Indexing collection');
  for await (const chunk of documentsIterator) {
    if (chunk.length === 0) break;
    importedChunks += 1;
    spinner.text = `Importing chunk ${importedChunks}, Imported ${importedDocs} documents so far...`;
    await schema.documents.import(chunk, { action: 'upsert', return_doc: false });
    importedDocs += chunk.length;
  }
  return { importedDocs, importedChunks };
}

async function seedPeople() {
  spinner.text = 'Starting Typesense seeding for people...';
  async function* docs() {
    for await (const peopleBatch of QUERIES.paginatePeople(10_000)) {
      const docsBatch = peopleBatch.map((person) => ({
        ...person,
        id: person.contactID,
      }));
      yield docsBatch;
    }
  }
  const { importedChunks, importedDocs } = await indexCollection(personSchema, docs());
  spinner.succeed(`Seeding complete: imported ${importedDocs} people in ${importedChunks} chunks.`);
}

async function seedExecutives() {
  spinner.text = 'Starting Typesense seeding for executives...';
  async function* docs() {
    for await (const executivesBatch of QUERIES.paginateExecutives(10_000)) {
      const docsBatch = executivesBatch
        .map((executive) => {
          const companyId = clean(executive.companyID);
          const personId = clean(executive.contactID);
          if (!companyId || !personId) return undefined;

          const doc = {
            id: makeRelationId({ companyId, personId }),
            companyID: companyId,
            personID: personId,
            companyName: clean(executive.companyName),
            personName: clean(executive.contactName),
            title: clean(executive.positionTitle),
            isCurrent: executive.isCurrent,
          };

          return doc;
        })
        .filter((doc) => doc !== undefined);
      if (docsBatch.length > 0) {
        yield docsBatch;
      }
    }
  }
  const { importedChunks, importedDocs } = await indexCollection(executiveSchema, docs());
  spinner.succeed(`Seeding complete: imported ${importedDocs} executives in ${importedChunks} chunks.`);
}

async function seedBoardMembers() {
  spinner.text = 'Starting Typesense seeding for board members...';
  async function* docs() {
    for await (const membersBatch of QUERIES.paginateBoardMembers(10_000)) {
      const docsBatch = membersBatch
        .map((member) => {
          const companyId = clean(member.companyID);
          const personId = clean(member.contactID);
          if (!companyId || !personId) return undefined;

          return {
            id: makeRelationId({ companyId, personId }),
            companyID: companyId,
            personID: personId,
            companyName: clean(member.companyName),
            personName: clean(member.contactName),
            boardName: clean(member.boardName),
            boardPosition: clean(member.boardPosition),
            otherPositions: clean(member.otherPositions),
          };
        })
        .filter((doc) => doc !== undefined);

      if (docsBatch.length > 0) {
        yield docsBatch;
      }
    }
  }
  const { importedChunks, importedDocs } = await indexCollection(boardMemberSchema, docs());
  spinner.succeed(`Seeding complete: imported ${importedDocs} board members in ${importedChunks} chunks.`);
}

export async function seedCompanies() {
  console.log('Starting Typesense seeding...');

  const ids = await fetchAllIds();
  console.log(`Found ${ids.length} companies to process`);

  const batches = chunk(ids, BATCH_SIZE);
  let imported = 0;
  const failed: string[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batchIds = batches[i];
    const docs: CompanyDoc[] = [];

    console.log(`Processing batch ${i + 1}/${batches.length} with ${batchIds.length} companies`);
    await pLimitMap(batchIds, CONCURRENCY, async (companyId) => {
      try {
        const [details, management, board, techVerticals] = await Promise.all([
          QUERIES.getCompanyDetails({ companyId }),
          QUERIES.getCompanyManagement({ companyId }),
          QUERIES.getCompanyBoard({ companyId }),
          QUERIES.getCompanyTechVerticals({ companyId }),
          // QUERIES.getCompanyDeals({ companyId }),
        ]);

        if (!details) {
          console.warn(`Company ${companyId} has no details, skipping`);
          return;
        }

        if (!details.companyID || !details.companyName || !details.sector || !details.stage) {
          console.warn(`Company ${companyId} missing required fields, skipping`);
          return;
        }

        const companyKey = details.companyID.trim();

        const doc: CompanyDoc = {
          id: companyKey,
          companyID: companyKey,
          companyName: details.companyName,
          shortName: clean(details.shortName),
          companyDescription: clean(details.companyDescription),
          technology: clean(details.technology),
          sector: details.sector,
          stage: details.stage,
          establishedYear: numOrUndefined(details.establishedYear),
          employees: numOrUndefined(details.employees),
          techVerticals: techVerticals.map((t) => t.tagName!),
          executives: management.map(({ contactName }) => contactName).filter((name) => name !== null),
          boardMembers: dedupe(board.map((b) => b.boardName)),
          investors: [],
        };

        docs.push(stripEmpty(doc));
      } catch (err) {
        console.warn(`Company fetch failed for ${companyId}:`, err);
      }
    });

    if (docs.length > 0) {
      try {
        await companiesSchema.documents.import(docs, { return_doc: false });
        imported += docs.length;
      } catch (e) {
        console.error(`Batch ${i + 1} import error:`, e);
        failed.push(...docs.map((d) => d.companyID));
      }
    }

    console.log(
      `Batch ${i + 1}/${batches.length}: attempted ${docs.length}, imported ${imported}, failed ${failed.length}`,
    );
  }

  console.log('\n=== Seeding Complete ===');
  console.log(`Total companies: ${ids.length}`);
  console.log(`Imported: ${imported}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.error('\nFailed company IDs (first 50):');
    console.error(failed.slice(0, 50));
    process.exitCode = 1;
  }
}

const COLLECTION_SEEDERS = {
  people: seedPeople,
  executives: seedExecutives,
  boardMembers: seedBoardMembers,
  companies: seedCompanies,
} as const;

type CollectionName = keyof typeof COLLECTION_SEEDERS;

function resolveCollection(input: string): CollectionName | undefined {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-');
  switch (normalized) {
    case 'people':
      return 'people';
    case 'executives':
      return 'executives';
    case 'board-members':
    case 'boardmembers':
    case 'board_members':
      return 'boardMembers';
    case 'companies':
    case 'company':
      return 'companies';
    default:
      return undefined;
  }
}

function printUsage(): void {
  console.log('Usage: pnpm tsx scripts/seed-typesense.ts --all | --collection <names>');
  console.log('  --all                 Seed all available collections.');
  console.log('  --collection <names>  Comma-delimited list. Options: people, executives, board-members, companies.');
  console.log('  --help, -h            Show this help message.');
}

function parseCliArgs(argv: string[]): CollectionName[] {
  try {
    const args = arg(
      {
        '--help': Boolean,
        '-h': '--help',
        '--all': Boolean,
        '--collection': [String],
      },
      { argv },
    );

    if (args['--help']) {
      printUsage();
      process.exit(0);
    }

    if (args['--all']) {
      return Object.keys(COLLECTION_SEEDERS) as CollectionName[];
    }

    const collectionInputs = args['--collection'] ?? [];

    if (collectionInputs.length === 0) {
      throw new Error('Missing --all or --collection option.');
    }

    const rawNames = collectionInputs
      .flatMap((value) => value.split(','))
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (rawNames.length === 0) {
      throw new Error('No valid collections provided.');
    }

    const invalid: string[] = [];
    const resolved = rawNames
      .map((name) => {
        const value = resolveCollection(name);
        if (!value) {
          invalid.push(name);
        }
        return value;
      })
      .filter((value): value is CollectionName => value !== undefined);

    if (invalid.length > 0) {
      throw new Error(`Unknown collections: ${invalid.join(', ')}`);
    }

    if (resolved.length === 0) {
      throw new Error('No valid collections provided.');
    }

    return Array.from(new Set(resolved));
  } catch (err) {
    if (err instanceof ArgError) {
      throw new Error(err.message);
    }
    throw err;
  }
}

async function main() {
  try {
    const collections = parseCliArgs(process.argv.slice(2));
    let hasErrors = false;

    for (const collection of collections) {
      const seeder = COLLECTION_SEEDERS[collection];
      try {
        await seeder();
      } catch (err) {
        console.error(`Seeding ${collection} failed:`, err);
        hasErrors = true;
      }
    }

    if (hasErrors) {
      process.exitCode = 1;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    printUsage();
    process.exitCode = 1;
  }
}

if (require.main === module) {
  await main();
  process.exit();
}
