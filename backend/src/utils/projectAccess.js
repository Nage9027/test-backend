const prisma = require("../config/prisma");

async function getMembership(userId, projectId) {
  return prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
  });
}

async function requireProjectMember(req, res, next) {
  const membership = await getMembership(req.user.id, req.params.projectId);
  if (!membership) return res.status(403).json({ message: "Project access denied" });
  req.membership = membership;
  return next();
}

async function requireProjectAdmin(req, res, next) {
  const membership = await getMembership(req.user.id, req.params.projectId);
  if (!membership || membership.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  req.membership = membership;
  return next();
}

module.exports = { getMembership, requireProjectMember, requireProjectAdmin };
