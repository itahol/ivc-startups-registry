import { WithoutSystemFields } from 'convex/server';
import { v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';
import { internalMutation } from './_generated/server';
import { createCompany } from './model/company';

// Mock data for tech verticals
const techVerticals = [
  'Artificial Intelligence',
  'Machine Learning',
  'Blockchain',
  'Cybersecurity',
  'Cloud Computing',
  'SaaS',
  'Fintech',
  'Healthtech',
  'Edtech',
  'E-commerce',
  'IoT',
  'Robotics',
  'Virtual Reality',
  'Augmented Reality',
  'Quantum Computing',
  'Biotechnology',
  'CleanTech',
  'AgTech',
  'Space Technology',
  'Gaming',
];

// Mock company data - 50 companies with tech focus
const mockCompanies: Omit<WithoutSystemFields<Doc<'companies'>>, 'entityId'>[] = [
  { name: 'TechNova AI', description: 'Advanced AI solutions for enterprise automation', yearEstablished: 2020 },
  { name: 'CloudScale Systems', description: 'Cloud infrastructure and DevOps platforms', yearEstablished: 2018 },
  { name: 'SecureNet Pro', description: 'Enterprise cybersecurity and threat detection', yearEstablished: 2019 },
  { name: 'DataFlow Analytics', description: 'Big data processing and business intelligence', yearEstablished: 2017 },
  { name: 'BlockChain Innovations', description: 'Distributed ledger technology solutions', yearEstablished: 2021 },
  { name: 'QuantumLeap Computing', description: 'Quantum computing research and development', yearEstablished: 2022 },
  { name: 'HealthTech Solutions', description: 'Digital health and medical device integration', yearEstablished: 2016 },
  { name: 'FinTech Dynamics', description: 'Financial technology and payment solutions', yearEstablished: 2019 },
  {
    name: 'EdTech Academy',
    description: 'Online learning and educational technology platforms',
    yearEstablished: 2020,
  },
  { name: 'IoT Connect', description: 'Internet of Things device management and connectivity', yearEstablished: 2018 },
  { name: 'RoboTech Industries', description: 'Industrial automation and robotics systems', yearEstablished: 2015 },
  { name: 'VR Worlds', description: 'Virtual reality content and platform development', yearEstablished: 2021 },
  { name: 'AR Innovations', description: 'Augmented reality applications for enterprise', yearEstablished: 2020 },
  { name: 'BioTech Labs', description: 'Biotechnology research and pharmaceutical development', yearEstablished: 2017 },
  { name: 'CleanTech Energy', description: 'Renewable energy and sustainability solutions', yearEstablished: 2016 },
  { name: 'AgriTech Pro', description: 'Precision agriculture and farming technology', yearEstablished: 2019 },
  {
    name: 'SpaceTech Ventures',
    description: 'Satellite technology and space exploration tools',
    yearEstablished: 2022,
  },
  { name: 'GameStudio Interactive', description: 'Video game development and publishing', yearEstablished: 2018 },
  { name: 'SaaS Platform Co', description: 'Software as a service business applications', yearEstablished: 2017 },
  { name: 'MobileFirst Apps', description: 'Mobile application development and design', yearEstablished: 2020 },
  { name: 'DevOps Tools Inc', description: 'Development operations and CI/CD solutions', yearEstablished: 2019 },
  { name: 'API Gateway Pro', description: 'API management and integration platforms', yearEstablished: 2018 },
  { name: 'Database Systems', description: 'Database management and optimization solutions', yearEstablished: 2016 },
  { name: 'Network Security Co', description: 'Network infrastructure and security solutions', yearEstablished: 2015 },
  { name: 'AI Vision Labs', description: 'Computer vision and image recognition technology', yearEstablished: 2021 },
  {
    name: 'VoiceTech Solutions',
    description: 'Voice recognition and natural language processing',
    yearEstablished: 2020,
  },
  { name: 'Edge Computing Co', description: 'Edge computing and distributed processing', yearEstablished: 2019 },
  { name: '5G Networks Pro', description: '5G network infrastructure and solutions', yearEstablished: 2022 },
  { name: 'Smart City Tech', description: 'Urban technology and smart city solutions', yearEstablished: 2018 },
  { name: 'Autonomous Systems', description: 'Self-driving vehicle and autonomous technology', yearEstablished: 2017 },
  { name: 'Wearable Tech Co', description: 'Wearable device technology and applications', yearEstablished: 2019 },
  {
    name: 'Digital Twin Systems',
    description: 'Digital twin modeling and simulation platforms',
    yearEstablished: 2020,
  },
  { name: 'Supply Chain Tech', description: 'Supply chain management and logistics technology', yearEstablished: 2016 },
  { name: 'RetailTech Solutions', description: 'Retail technology and e-commerce platforms', yearEstablished: 2018 },
  {
    name: 'PropTech Innovations',
    description: 'Real estate technology and property management',
    yearEstablished: 2021,
  },
  {
    name: 'LegalTech Platform',
    description: 'Legal technology and practice management software',
    yearEstablished: 2020,
  },
  { name: 'InsurTech Dynamics', description: 'Insurance technology and risk assessment tools', yearEstablished: 2019 },
  {
    name: 'MedTech Devices',
    description: 'Medical device technology and healthcare innovation',
    yearEstablished: 2017,
  },
  { name: 'NanoTech Research', description: 'Nanotechnology research and development', yearEstablished: 2018 },
  { name: 'GreenTech Solutions', description: 'Environmental technology and sustainability', yearEstablished: 2016 },
  { name: 'Crypto Exchange Pro', description: 'Cryptocurrency exchange and trading platforms', yearEstablished: 2021 },
  {
    name: 'NFT Marketplace Co',
    description: 'Non-fungible token marketplace and creation tools',
    yearEstablished: 2022,
  },
  { name: 'Metaverse Platforms', description: 'Virtual world and metaverse development', yearEstablished: 2021 },
  { name: 'DroneTech Systems', description: 'Drone technology and unmanned aerial systems', yearEstablished: 2019 },
  { name: '3D Printing Co', description: 'Additive manufacturing and 3D printing solutions', yearEstablished: 2018 },
  { name: 'Quantum Security', description: 'Quantum cryptography and security solutions', yearEstablished: 2022 },
  { name: 'Neural Networks Pro', description: 'Deep learning and neural network development', yearEstablished: 2020 },
  { name: 'Cloud Native Apps', description: 'Cloud-native application development', yearEstablished: 2019 },
  { name: 'Microservices Co', description: 'Microservices architecture and containerization', yearEstablished: 2018 },
  { name: 'Data Science Labs', description: 'Data science and predictive analytics platforms', yearEstablished: 2017 },
  { name: 'Cyber Defense Pro', description: 'Advanced cybersecurity and threat intelligence', yearEstablished: 2016 },
];

export default internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if companies already exist to make this idempotent
    const existingCompanies = await ctx.db.query('companies').take(1);
    if (existingCompanies.length > 0) {
      console.log('Database already seeded, skipping...');
      return null;
    }

    console.log('Seeding database with mock data...');

    // First, create tech verticals
    const techVerticalIds: Id<'techVerticals'>[] = [];
    for (const vertical of techVerticals) {
      const verticalId = await ctx.db.insert('techVerticals', { name: vertical });
      techVerticalIds.push(verticalId);
    }

    // Create companies with entities
    for (let i = 0; i < mockCompanies.length; i++) {
      const company = mockCompanies[i];

      // Create company
      const companyId = await createCompany({ ctx, args: { companyData: { ...company } } });
      // Assign 1-3 random tech verticals to each company
      const numVerticals = Math.floor(Math.random() * 3) + 1;
      const selectedVerticals = new Set<string>();

      for (let j = 0; j < numVerticals; j++) {
        let verticalId;
        do {
          verticalId = techVerticalIds[Math.floor(Math.random() * techVerticalIds.length)];
        } while (selectedVerticals.has(verticalId));

        selectedVerticals.add(verticalId);

        await ctx.db.insert('companyTechVerticals', {
          companyEntityId: companyId,
          techVerticalId: verticalId,
        });
      }
    }

    console.log(`Successfully seeded ${mockCompanies.length} companies with tech verticals`);
    return null;
  },
});
