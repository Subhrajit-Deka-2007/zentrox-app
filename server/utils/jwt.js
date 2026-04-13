const jwt = require("jsonwebtoken");

// ✅ validate env variables at startup
if (!process.env.JWT_SECRET)
  throw new Error("JWT_SECRET is not defined in .env");
if (!process.env.JWT_EXPIRES_IN)
  throw new Error("JWT_EXPIRES_IN is not defined in .env");

exports.createToken = (id, role) => {
  // ✅ validate inputs
  if (!id) throw new Error("User id is required to create token");
  if (!role) throw new Error("User role is required to create token");

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.verifyToken = (token) => {
  // ✅ validate input
  if (!token) throw new Error("Token is required");
  return jwt.verify(token, process.env.JWT_SECRET);
};
