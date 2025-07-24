const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  name: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Habit", habitSchema);
