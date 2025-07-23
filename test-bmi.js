const bmiService = require('./services/bmiService');

async function testBMIService() {
  console.log('🧪 Testing BMI Service...\n');

  // Test cases
  const testCases = [
    { height: 170, weight: 60, age: 25, gender: 'male', description: 'Normal weight male' },
    { height: 165, weight: 80, age: 30, gender: 'female', description: 'Overweight female' },
    { height: 180, weight: 100, age: 35, gender: 'male', description: 'Obese male' },
    { height: 160, weight: 45, age: 20, gender: 'female', description: 'Underweight female' }
  ];

  for (const testCase of testCases) {
    console.log(`📊 Testing: ${testCase.description}`);
    console.log(`   Height: ${testCase.height}cm, Weight: ${testCase.weight}kg`);
    
    try {
      const result = await bmiService.analyzeBMI(testCase);
      console.log(`   ✅ BMI: ${result.bmi}, Category: ${result.label}`);
      console.log(`   📝 Method: ${result.method}`);
      console.log(`   💡 Recommendation: ${result.recommendations.diet[0]}`);
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('🎉 BMI Service test completed!');
}

// Run the test
testBMIService().catch(console.error); 