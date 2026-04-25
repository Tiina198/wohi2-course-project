const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const seedQuestions = [
  {
    question: "What is the capital of Finland?",
    answer: "Helsinki",
    keywords: ["what", "capital"],
  },
  {
    question: "What is the capital of Sweden?",
    answer: "Stockholm",
    keywords: ["what", "capital"],
  },
  {
    question: "What is the capital of Iceland?",
    answer: "Reykjavík",
    keywords: ["what", "capital"],
  },
  {
    question: "What is the capital of Denmark?",
    answer: "Copenhagen",
    keywords: ["what", "capital"],
  },
];

async function main() {
  await prisma.question.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.user.deleteMany();

  // create user
  const hashedPassword = await bcrypt.hash("1234", 10);

  const user = await prisma.user.create({
    data: {
      email: "example@example.org",
      password: hashedPassword,
      name: "Example user",
    },
  });

  console.log("Created user:", user.email);

  // questions
  for (const q of seedQuestions) {
    await prisma.question.create({
      data: {
        question: q.question,
        answer: q.answer,
        userId: user.id,
        keywords: {
          connectOrCreate: q.keywords.map((kw) => ({
            where: { name: kw },
            create: { name: kw },
          })),
        },
      },
    });
  }

  console.log("Seeded questions successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());