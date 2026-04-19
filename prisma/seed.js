const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const seedQuestions = [
  {
    id: 1,
    question:"What is the capital of Finland?",
    answer: "Helsinki",
  keywords: ["what", "capital"],
  },
  {
   id: 2,
    question: "What is the capital of Sweden?",
    answer: "Stockholm",
  keywords: ["what", "capital"] 
  },
  {
   id: 3,
    question: "What is the capital of Iceland?",
    answer: "Reykjavík",
  keywords: ["what", "capital"] 
  },
  {
  id: 4,
    question: "What is the capital of Denmark?",
    answer: "Copenhagen",
  keywords: ["what", "capital"]   
  },
];

async function main() {
  await prisma.question.deleteMany();
  await prisma.keyword.deleteMany();

  for (const q of seedQuestions) {
    await prisma.question.create({
      data: {
        question: q.question,
        answer: q.answer,
        keywords: {
          connectOrCreate: q.keywords.map((kw) => ({
            where: { name: kw },
            create: { name: kw },
          })),
        },
      },
    });
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

