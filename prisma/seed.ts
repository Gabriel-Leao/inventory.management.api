import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

type SeedModel = {
  deleteMany(args?: object): Promise<unknown>;
  create(args: { data: Record<string, unknown> }): Promise<unknown>;
};

function getModel(modelName: string): SeedModel {
  const models = {
    products: prisma.product,
    sales: prisma.sale,
    purchases: prisma.purchase,
    users: prisma.user,
    expenses: prisma.expense,
    salesSummary: prisma.saleSummary,
    purchaseSummary: prisma.purchaseSummary,
    expenseSummary: prisma.expenseSummary,
    expenseByCategory: prisma.expenseByCategory,
  };

  const model = models[modelName as keyof typeof models];

  if (!model) {
    throw new Error(`Model "${modelName}" not found`);
  }

  return model;
}

const orderedFileNames = [
  'products.json',
  'expenseSummary.json',
  'sales.json',
  'salesSummary.json',
  'purchases.json',
  'purchaseSummary.json',
  'users.json',
  'expenses.json',
  'expenseByCategory.json',
] as const;

async function deleteAllData(fileNames: readonly string[]) {
  const reversedFileNames = [...fileNames].reverse();

  for (const fileName of reversedFileNames) {
    const modelName = path.basename(fileName, path.extname(fileName));

    const model = getModel(modelName);

    await model.deleteMany({});

    console.log(`Cleared data from ${modelName}`);
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, 'seedData');

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);

    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<
      string,
      unknown
    >[];

    const modelName = path.basename(fileName, path.extname(fileName));

    const model = getModel(modelName);

    for (const data of jsonData) {
      await model.create({
        data,
      });
    }

    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
