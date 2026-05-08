const express = require("express");
const { z } = require("zod");
const prisma = require("../config/prisma");
const { requireProjectAdmin } = require("../utils/projectAccess");

const router = express.Router();

router.get("/", async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: req.user.id } } },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(projects);
});

router.post("/", async (req, res) => {
  const parsed = z
    .object({ name: z.string().min(2), description: z.string().optional() })
    .safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues });
  }

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      members: { create: { userId: req.user.id, role: "ADMIN" } },
    },
    include: { members: true },
  });
  return res.status(201).json(project);
});

router.post("/:projectId/members", requireProjectAdmin, async (req, res) => {
  const parsed = z
    .object({ email: z.email(), role: z.enum(["ADMIN", "MEMBER"]).optional() })
    .safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const member = await prisma.projectMember.upsert({
    where: { userId_projectId: { userId: user.id, projectId: req.params.projectId } },
    create: {
      userId: user.id,
      projectId: req.params.projectId,
      role: parsed.data.role || "MEMBER",
    },
    update: { role: parsed.data.role || "MEMBER" },
  });

  return res.json(member);
});

router.delete("/:projectId/members/:userId", requireProjectAdmin, async (req, res) => {
  if (req.params.userId === req.user.id) {
    return res.status(400).json({ message: "Admin cannot remove themselves" });
  }
  await prisma.projectMember.deleteMany({
    where: { projectId: req.params.projectId, userId: req.params.userId },
  });
  return res.json({ message: "Member removed" });
});

module.exports = router;
