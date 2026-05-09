const express = require("express");
const { z } = require("zod");
const prisma = require("../config/prisma");
const { requireProjectMember, requireProjectAdmin } = require("../utils/projectAccess");

const router = express.Router({ mergeParams: true });

router.get("/", requireProjectMember, async (req, res) => {
  // Project members can view every task in the project so the board is useful;
  // editing is still restricted to admins / assignees in PATCH below.
  const tasks = await prisma.task.findMany({
    where: { projectId: req.params.projectId },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(tasks);
});

router.post("/", requireProjectAdmin, async (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(2),
      description: z.string().optional(),
      dueDate: z.string().datetime().optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      assignedToId: z.string().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues });
  }

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      priority: parsed.data.priority || "MEDIUM",
      assignedToId: parsed.data.assignedToId || null,
      projectId: req.params.projectId,
      createdById: req.user.id,
    },
  });
  return res.status(201).json(task);
});

router.patch("/:taskId", requireProjectMember, async (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(2).optional(),
      description: z.string().optional(),
      dueDate: z.string().datetime().nullable().optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
      assignedToId: z.string().nullable().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues });
  }

  const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
  if (!task || task.projectId !== req.params.projectId) {
    return res.status(404).json({ message: "Task not found" });
  }

  const isAdmin = req.membership.role === "ADMIN";
  const isAssignee = task.assignedToId === req.user.id;
  if (!isAdmin && !isAssignee) {
    return res.status(403).json({ message: "Not allowed to update this task" });
  }

  const updated = await prisma.task.update({
    where: { id: req.params.taskId },
    data: {
      ...parsed.data,
      dueDate:
        parsed.data.dueDate === undefined
          ? undefined
          : parsed.data.dueDate === null
            ? null
            : new Date(parsed.data.dueDate),
    },
  });
  return res.json(updated);
});

router.delete("/:taskId", requireProjectAdmin, async (req, res) => {
  await prisma.task.deleteMany({
    where: { id: req.params.taskId, projectId: req.params.projectId },
  });
  return res.json({ message: "Task deleted" });
});

module.exports = router;
