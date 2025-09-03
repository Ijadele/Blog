const authorizeRole = (role) => {
  return (req, res, next) => {
    // Check if the user is authenticated
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the user's role matches the required role
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // If the user has the required role, proceed to the next middleware or route handler
    next();
  };
}

module.exports = authorizeRole;