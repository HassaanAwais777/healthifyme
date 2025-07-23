const fetch = require('node-fetch');

async function testBMIEndpoints() {
  console.log('🧪 Testing BMI API Endpoints...\n');

  const baseURL = 'http://localhost:5000';
  
  // Test data
  const testData = {
    height: 170,
    weight: 70,
    age: 25,
    gender: 'male'
  };

  try {
    // Test 1: Quick BMI calculation (public endpoint)
    console.log('📊 Testing Quick BMI Calculation...');
    const response1 = await fetch(`${baseURL}/api/users/calculate-bmi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result1 = await response1.json();
    
    if (response1.ok) {
      console.log('✅ Quick BMI Calculation - SUCCESS');
      console.log(`   BMI: ${result1.bmi}`);
      console.log(`   Category: ${result1.label}`);
      console.log(`   Method: ${result1.method}`);
      if (result1.recommendations) {
        console.log(`   Diet Recommendation: ${result1.recommendations.diet[0]}`);
      }
    } else {
      console.log('❌ Quick BMI Calculation - FAILED');
      console.log(`   Error: ${result1.error}`);
    }

    console.log('');

    // Test 2: Health check endpoint
    console.log('🏥 Testing Health Check...');
    const response2 = await fetch(`${baseURL}/health`);
    const result2 = await response2.json();
    
    if (response2.ok) {
      console.log('✅ Health Check - SUCCESS');
      console.log(`   Status: ${result2.status}`);
      console.log(`   Database: ${result2.database}`);
    } else {
      console.log('❌ Health Check - FAILED');
    }

    console.log('');

    // Test 3: API base endpoint
    console.log('🔗 Testing API Base Endpoint...');
    const response3 = await fetch(`${baseURL}/api`);
    const result3 = await response3.json();
    
    if (response3.ok) {
      console.log('✅ API Base Endpoint - SUCCESS');
      console.log(`   Message: ${result3.message}`);
      if (result3.endpoints && result3.endpoints.bmi) {
        console.log('   BMI endpoints available:');
        console.log(`     - Analysis: ${result3.endpoints.bmi.analysis}`);
        console.log(`     - History: ${result3.endpoints.bmi.history}`);
        console.log(`     - Calculate: ${result3.endpoints.bmi.calculate}`);
      }
    } else {
      console.log('❌ API Base Endpoint - FAILED');
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('Make sure the server is running on port 5000');
  }

  console.log('\n🎉 API Endpoint Testing Completed!');
}

// Run the test
testBMIEndpoints().catch(console.error); 