const express = require("express");
const prisma = require("../config/prisma");

const router = express.Router();

router.get("/", async (req, res) => {
  const memberProjects = await prisma.projectMember.findMany({
    where: { userId: req.user.id },
    select: { projectId: true },
  });
  const projectIds = memberProjects.map((m) => m.projectId);

  const tasks = await prisma.task.findMany({
    where: { projectId: { in: projectIds } },
    select: { status: true, dueDate: true, assignedToId: true },
  });

  const totalTasks = tasks.length;
  const byStatus = {
    TODO: tasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
  };

  const tasksPerUser = tasks.reduce((acc, task) => {
    const key = task.assignedToId || "unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const now = new Date();
  const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== "DONE").length;

  return res.json({ totalTasks, byStatus, tasksPerUser, overdueTasks });
});

module.exports = router;
