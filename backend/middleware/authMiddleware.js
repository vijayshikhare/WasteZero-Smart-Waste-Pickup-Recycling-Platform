const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Not authorized - no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized - invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

const ngoOnly = (req, res, next) => {
  if (req.user.role !== "ngo") {
    return res.status(403).json({ message: "NGO access only" });
  }
  next();
};

module.exports = { protect, adminOnly, ngoOnly };