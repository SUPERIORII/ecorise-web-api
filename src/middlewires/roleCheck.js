export const isSuperAdmin = (req, res, next) => {
  if (req.user.role === "superadmin") {
    return next();
  }
  return res.status(401).json({ error: "This page can't be Unauthorized" });
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized to create content" });
  }

  next();
};

export const CreateContent = (req, res, next) => {
  const { role } = req.user.role;

  if (role === "superadmin" || role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Unauthorized to create content" });
};
