const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
    },
    onboardingStep: {
      type: Number,
      default: 0,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    height: {
      type: Number, // in cm
    },
    weight: {
      type: Number, // in kg
    },
    goals: {
      weight: Number,
      targetCalories: Number,
      targetSteps: Number,
      goalType: {
        type: String,
        enum: [
          "lose_weight",
          "gain_weight",
          "maintain_weight",
          "build_muscle",
          "Lose Weight",
          "Gain Weight",
          "Maintain Weight",
          "Build Muscle"
        ],
      },
    },
    activities: [
      {
        activityName: String, // was 'type'
        date: {
          type: Date,
          default: Date.now,
        },
        duration: Number, // in minutes
        caloriesBurned: Number,
        activityType: {
          type: String,
          enum: ["cardio", "strength", "flexibility", "sports"],
        },
      },
    ],
    diet: [
      {
        foodName: String,
        date: {
          type: Date,
          default: Date.now,
        },
        calories: Number,
        meal: {
          type: String,
          enum: ["breakfast", "lunch", "dinner", "snack"],
        },
        protein: Number,
        carbs: Number,
        fat: Number,
      },
    ],
    progress: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        weight: Number,
        caloriesConsumed: Number,
        caloriesBurned: Number,
        steps: Number,
        bodyFat: Number,
        muscleMass: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
