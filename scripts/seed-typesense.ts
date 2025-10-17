import { NotNull } from 'kysely';
import ora from 'ora';
import { setDefaultConfiguration } from 'typesense-ts';
import { QUERIES } from '../lib/server/db/queries';
import { ALL_SCHEMAS, companiesSchema, personSchema } from '../lib/server/typesense/schema';

const BATCH_SIZE = 200;
const CONCURRENCY = 10;

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
  const spinner = ora('Checking collection');

  try {
    await schema.retrieve();
    spinner.text = 'Collection already exists';
  } catch (e: unknown) {
    spinner.info('Creating collection');
    await schema.create();
  }
}

async function indexCollection<T extends (typeof ALL_SCHEMAS)[number]>(
  schema: T,
  documentsIterator: AsyncIterable<any[]>,
) {
  schema.infer;
  const spinner = ora();
  await validateCollectionExists(schema);
  let importedDocs = 0;
  let importedChunks = 0;

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
  const spinner = ora('Starting Typesense seeding for people...').start();
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

        const doc: CompanyDoc = {
          companyID: details.companyID,
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

if (require.main === module) {
  await seedPeople().catch((err) => {
    console.error('Seeding people failed:', err);
    process.exit(1);
  });
  // seedCompanies().catch((err) => {
  //   console.error('Seeding failed:', err);
  //   process.exit(1);
  // });
}
