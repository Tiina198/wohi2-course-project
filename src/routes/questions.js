const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

const authenticate = require("../middleware/auth");
const isOwner = require("../middleware/isOwner");

function formatQuestion(question) {
  return {
    id: question.id,
    question: question.question,
    answer: question.answer,
    keywords: question.keywords.map((k) => k.name),
  };
}

// Apply auth to all routes
router.use(authenticate);

// GET all
router.get("/", async (req, res) => {
  const { keyword } = req.query;

  const where = keyword
    ? { keywords: { some: { name: keyword } } }
    : {};

  const questions = await prisma.question.findMany({
    where,
    include: { keywords: true },
    orderBy: { id: "asc" },
  });

  res.json(questions.map(formatQuestion));
});

// GET one
router.get("/:questionId", async (req, res) => {
  const questionId = Number(req.params.questionId);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { keywords: true },
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  res.json(formatQuestion(question));
});

// POST
router.post("/", async (req, res) => {
  const { question, answer, keywords } = req.body;

  if (!question || !answer) {
    return res.status(400).json({
      msg: "question and answer are mandatory",
    });
  }

  const keywordsArray = Array.isArray(keywords) ? keywords : [];

  const newQuestion = await prisma.question.create({
    data: {
      question,
      answer,
      userId: req.user.userId,
      keywords: {
        connectOrCreate: keywordsArray.map((kw) => ({
          where: { name: kw },
          create: { name: kw },
        })),
      },
    },
    include: { keywords: true },
  });

  res.status(201).json(formatQuestion(newQuestion));
});

// PUT (ownership protected)
router.put("/:questionId", isOwner, async (req, res) => {
  const { question, answer, keywords } = req.body;
  const questionId = Number(req.params.questionId);

  const keywordsArray = Array.isArray(keywords) ? keywords : [];

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      question,
      answer,
      keywords: {
        set: [],
        connectOrCreate: keywordsArray.map((kw) => ({
          where: { name: kw },
          create: { name: kw },
        })),
      },
    },
    include: { keywords: true },
  });

  res.json(formatQuestion(updated));
});

// DELETE (ownership protected)
router.delete("/:questionId", isOwner, async (req, res) => {
  const questionId = Number(req.params.questionId);

  await prisma.question.delete({
    where: { id: questionId },
  });

  res.json({ message: "Question deleted successfully" });
});

module.exports = router;