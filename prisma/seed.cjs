const pkg = require("@prisma/client");
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const inventory = require("../inventory.json");

const products = inventory.articles;

async function main() {
  console.log("Start seeding...");
  for (const p of products) {
    await prisma.product.create({
      data: p,
    });
    console.log(`Created product with id : ${p.id}`);
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
