const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bmiService = require("../services/bmiService");

// Helper function to check database connection
const checkDBConnection = (res) => {
  if (User.db.readyState !== 1) {
    res.status(503).json({
      error: "Database not connected. Please check MongoDB connection.",
    });
    return false;
  }
  return true;
};

// User registration
router.post("/register", async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with onboardingStep: 0
    user = new User({
      email,
      password: hashedPassword,
      name,
      onboardingStep: 0
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Return the full user object (excluding password)
    const { password: _pw, ...userData } = user.toObject();
    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Return the full user object (excluding password)
    const { password: _pw, ...userData } = user.toObject();
    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update user profile
router.post("/profile", auth, async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    let user = await User.findById(req.user.userId);
    if (user) {
      // MIGRATION: Convert any string activity to an object
      if (req.body.activities && Array.isArray(req.body.activities)) {
        req.body.activities = req.body.activities.map(a =>
          typeof a === 'string'
            ? { activityName: a, date: new Date() }
            : a
        );
        req.body.activities = req.body.activities.filter(a => typeof a === 'object' && a !== null);
      }
      user = await User.findByIdAndUpdate(req.user.userId, req.body, {
        new: true,
      });
    } else {
      user = new User({
        email: req.user.email,
        ...req.body,
      });
      await user.save();
    }
    // MIGRATION: Filter out any non-object values from activities before returning
    if (user.activities && Array.isArray(user.activities)) {
      user.activities = user.activities.filter(a => typeof a === 'object' && a !== null);
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get("/profile", auth, async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user goals
router.put("/goals", auth, async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { goals: req.body },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add activity
router.post("/activities", auth, async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const user = await User.findById(req.user.userId);

    // FIX: Push the activity object directly
    user.activities.push(req.body);

    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error saving activity:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Add diet entry
router.post("/diet", auth, async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const user = await User.findById(req.user.userId);
    user.diet.push(req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add progress entry
router.post("/progress", auth, async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const user = await User.findById(req.user.userId);
    user.progress.push(req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user activities
router.get("/activities", auth, async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const user = await User.findById(req.user.userId);
    // Filter out nulls and malformed activities before returning
    const validActivities = (user.activities || []).filter(a => a && typeof a === 'object' && !Array.isArray(a) && !(typeof a.activityName === 'object'));
    res.json(validActivities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user diet entries
router.get("/diet", auth, async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const user = await User.findById(req.user.userId);
    res.json(user.diet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user progress
router.get("/progress", auth, async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const user = await User.findById(req.user.userId);
    res.json(user.progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BMI Analysis endpoint
router.post("/bmi-analysis", auth, async (req, res) => {
  try {
    const { height, weight, age, gender } = req.body;

    // Validate required fields
    if (!height || !weight) {
      return res.status(400).json({
        error: "Height and weight are required fields",
      });
    }

    // Perform BMI analysis
    const bmiAnalysis = await bmiService.analyzeBMI({
      height: parseFloat(height),
      weight: parseFloat(weight),
      age: age ? parseInt(age) : null,
      gender: gender || null,
    });

    // Save BMI analysis to user's progress
    const user = await User.findById(req.user.userId);
    if (user) {
      user.progress.push({
        type: "bmi_analysis",
        data: bmiAnalysis,
        date: new Date(),
      });
      await user.save();
    }

    res.json(bmiAnalysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get BMI history for user
router.get("/bmi-history", auth, async (req, res) => {
  if (!checkDBConnection(res)) return;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter progress entries for BMI analysis
    const bmiHistory = user.progress.filter(
      (entry) => entry.type === "bmi_analysis"
    );
    res.json(bmiHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate BMI without saving (for quick calculations)
router.post("/calculate-bmi", async (req, res) => {
  try {
    const { height, weight, age, gender } = req.body;

    // Validate required fields
    if (!height || !weight) {
      return res.status(400).json({
        error: "Height and weight are required fields",
      });
    }

    // Perform BMI analysis without saving
    const bmiAnalysis = await bmiService.analyzeBMI({
      height: parseFloat(height),
      weight: parseFloat(weight),
      age: age ? parseInt(age) : null,
      gender: gender || null,
    });

    res.json(bmiAnalysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
