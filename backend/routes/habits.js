const express = require("express");
const router = express.Router();
const Habit = require("../models/habit");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware); // all routes require auth

// GET all habits for user
router.get("/", async (req, res) => {
  const habits = await Habit.find({ user: req.userId });
  res.json(habits);
});

// POST new habit for user
router.post("/", async (req, res) => {
  const newHabit = new Habit({ name: req.body.name, user: req.userId });
  const savedHabit = await newHabit.save();
  res.json(savedHabit);
});

// PUT toggle completion for user's habit
router.put("/:id", async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    habit.isCompleted = !habit.isCompleted;
    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update habit name
router.put('/:id/name', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    habit.name = req.body.name;
    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE habit for user
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ error: "Habit not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
