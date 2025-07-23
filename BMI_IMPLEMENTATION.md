# BMI Classifier Implementation

## Overview
The BMI (Body Mass Index) classifier has been successfully integrated into the HealthifyMe backend. This implementation provides both AI-powered classification using a Python machine learning model and fallback standard BMI calculation.

## Features

### 🔧 Core Functionality
- **AI-Powered Classification**: Uses the `bmi_classifier.pkl` Python model for advanced BMI classification
- **Standard BMI Calculation**: Fallback to traditional BMI formula when AI model is unavailable
- **Health Recommendations**: Personalized diet, exercise, and lifestyle recommendations based on BMI category
- **User History**: Track and retrieve BMI analysis history for users
- **Real-time Calculation**: Quick BMI calculations without saving to database

### 📊 BMI Categories
- **Underweight**: BMI < 18.5
- **Normal Weight**: BMI 18.5 - 24.9
- **Overweight**: BMI 25.0 - 29.9
- **Obese**: BMI ≥ 30.0

## API Endpoints

### 1. BMI Analysis (Authenticated)
**POST** `/api/users/bmi-analysis`

**Request Body:**
```json
{
  "height": 170,
  "weight": 70,
  "age": 25,
  "gender": "male"
}
```

**Response:**
```json
{
  "bmi": 24.22,
  "category": "normal",
  "category_code": 1,
  "label": "Normal weight",
  "height_cm": 170,
  "weight_kg": 70,
  "age": 25,
  "gender": "male",
  "recommendations": {
    "diet": ["Maintain a balanced diet with all food groups", ...],
    "exercise": ["Aim for 150 minutes of moderate exercise per week", ...],
    "lifestyle": ["Maintain regular meal times", ...]
  },
  "method": "ai_classifier"
}
```

### 2. BMI History (Authenticated)
**GET** `/api/users/bmi-history`

**Response:**
```json
[
  {
    "type": "bmi_analysis",
    "data": { /* BMI analysis data */ },
    "date": "2024-01-15T10:30:00.000Z"
  }
]
```

### 3. Quick BMI Calculation (Public)
**POST** `/api/users/calculate-bmi`

**Request Body:**
```json
{
  "height": 170,
  "weight": 70,
  "age": 25,
  "gender": "male"
}
```

**Response:** Same as BMI Analysis but without saving to database

## Implementation Details

### File Structure
```
healthifyme-backend/
├── bmi_classifier.pkl          # Python AI model
├── bmi_classifier.py           # Python script for AI classification
├── services/
│   └── bmiService.js          # Node.js BMI service
├── routes/
│   └── users.js               # API routes (includes BMI endpoints)
├── requirements.txt           # Python dependencies
└── test-bmi.js               # Test script
```

### Service Architecture

#### 1. Python AI Classifier (`bmi_classifier.py`)
- Loads the trained model from `bmi_classifier.pkl`
- Processes input data (height, weight, age, gender)
- Returns AI-powered classification results
- Handles errors gracefully

#### 2. Node.js BMI Service (`services/bmiService.js`)
- **Primary Function**: `analyzeBMI(data)`
- **Features**:
  - Tries AI classifier first
  - Falls back to standard calculation
  - Provides comprehensive health recommendations
  - Handles input validation
  - Supports both authenticated and public endpoints

#### 3. API Integration (`routes/users.js`)
- **BMI Analysis**: Authenticated endpoint that saves results
- **BMI History**: Retrieves user's BMI analysis history
- **Quick Calculation**: Public endpoint for instant calculations

## Usage Examples

### Frontend Integration

#### React Native Example
```javascript
// Calculate BMI
const calculateBMI = async (height, weight, age, gender) => {
  try {
    const response = await fetch('http://localhost:5000/api/users/calculate-bmi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ height, weight, age, gender })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('BMI calculation error:', error);
  }
};

// Save BMI analysis (authenticated)
const saveBMIAnalysis = async (height, weight, age, gender, token) => {
  try {
    const response = await fetch('http://localhost:5000/api/users/bmi-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ height, weight, age, gender })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('BMI analysis error:', error);
  }
};
```

### Testing

#### Run BMI Service Test
```bash
cd healthifyme-backend
node test-bmi.js
```

#### Test API Endpoints
```bash
# Quick BMI calculation
curl -X POST http://localhost:5000/api/users/calculate-bmi \
  -H "Content-Type: application/json" \
  -d '{"height": 170, "weight": 70, "age": 25, "gender": "male"}'

# BMI analysis (requires authentication)
curl -X POST http://localhost:5000/api/users/bmi-analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"height": 170, "weight": 70, "age": 25, "gender": "male"}'
```

## Health Recommendations

The system provides personalized recommendations based on BMI category:

### 🥗 Diet Recommendations
- **Underweight**: High-calorie, nutrient-rich foods
- **Normal**: Balanced diet with portion control
- **Overweight**: Calorie deficit with protein focus
- **Obese**: Professional guidance with whole foods

### 🏃‍♂️ Exercise Recommendations
- **Underweight**: Strength training focus
- **Normal**: Balanced cardio and strength
- **Overweight**: Gradual intensity increase
- **Obese**: Low-impact activities with professional guidance

### 💪 Lifestyle Recommendations
- **Underweight**: Frequent meals, sleep focus
- **Normal**: Regular routines, stress management
- **Overweight**: Food tracking, realistic goals
- **Obese**: Medical monitoring, support systems

## Error Handling

The implementation includes comprehensive error handling:

- **Input Validation**: Ensures required fields and valid ranges
- **Model Loading**: Graceful fallback if AI model unavailable
- **Python Integration**: Handles Python script execution errors
- **Database Errors**: Proper error responses for database issues
- **Authentication**: Validates user tokens for protected endpoints

## Future Enhancements

### Potential Improvements
1. **Model Updates**: Regular retraining of AI model with new data
2. **Advanced Features**: Body composition analysis, trend tracking
3. **Integration**: Connect with fitness trackers and health apps
4. **Personalization**: User-specific recommendation algorithms
5. **Notifications**: BMI goal tracking and reminders

### Technical Enhancements
1. **Caching**: Cache AI model predictions for performance
2. **Batch Processing**: Handle multiple BMI calculations
3. **Analytics**: BMI trend analysis and insights
4. **Mobile Optimization**: Optimize for mobile app performance

## Dependencies

### Python Dependencies
```
numpy>=1.21.0
scikit-learn>=1.0.0
pandas>=1.3.0
```

### Node.js Dependencies
- All existing dependencies in `package.json`
- No additional dependencies required

## Security Considerations

- **Input Validation**: All inputs are validated and sanitized
- **Authentication**: Protected endpoints require valid JWT tokens
- **Error Messages**: Generic error messages to prevent information leakage
- **Rate Limiting**: Consider implementing rate limiting for public endpoints

## Performance

- **AI Model**: Loaded once at service startup
- **Caching**: Standard BMI calculations are fast and efficient
- **Database**: Minimal database operations for history tracking
- **Scalability**: Service can handle multiple concurrent requests

---

**Status**: ✅ **Fully Implemented and Tested**

The BMI classifier is now fully integrated and ready for use in your HealthifyMe application! 