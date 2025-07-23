const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class BMIService {
  constructor() {
    this.bmiCategories = {
      underweight: { min: 0, max: 18.5, label: 'Underweight' },
      normal: { min: 18.5, max: 24.9, label: 'Normal weight' },
      overweight: { min: 25.0, max: 29.9, label: 'Overweight' },
      obese: { min: 30.0, max: Infinity, label: 'Obese' }
    };
  }

  /**
   * Calculate BMI using standard formula
   * @param {number} height - Height in cm
   * @param {number} weight - Weight in kg
   * @returns {number} BMI value
   */
  calculateBMI(height, weight) {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Classify BMI into categories
   * @param {number} bmi - BMI value
   * @returns {object} Classification result
   */
  classifyBMI(bmi) {
    for (const [category, range] of Object.entries(this.bmiCategories)) {
      if (bmi >= range.min && bmi <= range.max) {
        return {
          category: category,
          label: range.label,
          bmi: bmi
        };
      }
    }
    return {
      category: 'unknown',
      label: 'Unknown',
      bmi: bmi
    };
  }

  /**
   * Get health recommendations based on BMI category
   * @param {string} category - BMI category
   * @returns {object} Health recommendations
   */
  getHealthRecommendations(category) {
    const recommendations = {
      underweight: {
        diet: [
          "Increase caloric intake with nutrient-rich foods",
          "Include protein-rich foods like lean meats, eggs, and legumes",
          "Add healthy fats from nuts, avocados, and olive oil",
          "Consider protein shakes or smoothies"
        ],
        exercise: [
          "Focus on strength training to build muscle mass",
          "Include resistance exercises 2-3 times per week",
          "Avoid excessive cardio that burns too many calories",
          "Work with a trainer to develop a balanced program"
        ],
        lifestyle: [
          "Eat smaller, more frequent meals throughout the day",
          "Track your food intake to ensure adequate calories",
          "Get adequate sleep for muscle recovery",
          "Consider consulting a nutritionist"
        ]
      },
      normal: {
        diet: [
          "Maintain a balanced diet with all food groups",
          "Focus on whole foods and limit processed foods",
          "Stay hydrated with plenty of water",
          "Practice portion control"
        ],
        exercise: [
          "Aim for 150 minutes of moderate exercise per week",
          "Include both cardio and strength training",
          "Find activities you enjoy to stay motivated",
          "Gradually increase intensity and duration"
        ],
        lifestyle: [
          "Maintain regular meal times",
          "Get 7-9 hours of quality sleep",
          "Manage stress through relaxation techniques",
          "Regular health check-ups"
        ]
      },
      overweight: {
        diet: [
          "Create a moderate calorie deficit",
          "Increase protein intake to preserve muscle",
          "Focus on fiber-rich foods for satiety",
          "Limit added sugars and refined carbohydrates"
        ],
        exercise: [
          "Start with low-impact cardio like walking or swimming",
          "Gradually increase exercise duration and intensity",
          "Include strength training to build muscle",
          "Aim for 200-300 minutes of exercise per week"
        ],
        lifestyle: [
          "Keep a food diary to track eating patterns",
          "Set realistic weight loss goals (1-2 lbs per week)",
          "Get adequate sleep to support metabolism",
          "Consider working with a health coach"
        ]
      },
      obese: {
        diet: [
          "Consult with a healthcare provider for personalized plan",
          "Focus on whole, unprocessed foods",
          "Practice mindful eating and portion control",
          "Consider working with a registered dietitian"
        ],
        exercise: [
          "Start with low-impact activities like walking",
          "Work with a fitness professional for safe progression",
          "Include both cardio and strength training",
          "Set realistic, achievable fitness goals"
        ],
        lifestyle: [
          "Address underlying health conditions",
          "Consider behavioral therapy for sustainable changes",
          "Build a support system for accountability",
          "Regular medical monitoring"
        ]
      }
    };

    return recommendations[category] || recommendations.normal;
  }

  /**
   * Try to use Python BMI classifier if available
   * @param {object} data - Input data (height, weight, age, gender)
   * @returns {Promise<object>} Classification result
   */
  async usePythonClassifier(data) {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '..', 'bmi_classifier.py');
      
      // Check if Python script exists
      if (!fs.existsSync(pythonScript)) {
        resolve(null);
        return;
      }

      const pythonProcess = spawn('python', [pythonScript, JSON.stringify(data)]);
      
      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const parsedResult = JSON.parse(result);
            resolve(parsedResult);
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });

      pythonProcess.on('error', () => {
        resolve(null);
      });
    });
  }

  /**
   * Main BMI analysis function
   * @param {object} data - Input data
   * @returns {Promise<object>} Complete BMI analysis
   */
  async analyzeBMI(data) {
    const { height, weight, age, gender } = data;

    // Validate input
    if (!height || !weight || height <= 0 || weight <= 0) {
      throw new Error('Invalid height or weight values');
    }

    // Try Python classifier first
    let pythonResult = await this.usePythonClassifier(data);
    
    if (pythonResult && !pythonResult.error) {
      // Python classifier worked, add recommendations
      const recommendations = this.getHealthRecommendations(pythonResult.category);
      return {
        ...pythonResult,
        recommendations,
        method: 'ai_classifier'
      };
    }

    // Fallback to standard BMI calculation
    const bmi = this.calculateBMI(height, weight);
    const classification = this.classifyBMI(bmi);
    const recommendations = this.getHealthRecommendations(classification.category);

    return {
      bmi: bmi,
      category: classification.category,
      category_code: Object.keys(this.bmiCategories).indexOf(classification.category),
      label: classification.label,
      height_cm: height,
      weight_kg: weight,
      age: age || null,
      gender: gender || null,
      recommendations,
      method: 'standard_calculation'
    };
  }
}

module.exports = new BMIService(); 