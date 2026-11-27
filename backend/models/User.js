const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
