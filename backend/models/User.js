const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["volunteer", "ngo", "admin"], 
    default: "volunteer" 
  },
  location: { type: String, default: "" },           // e.g. "Delhi, India" or lat/long later
  skills: { type: [String], default: [] },           // for volunteers
  bio: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);