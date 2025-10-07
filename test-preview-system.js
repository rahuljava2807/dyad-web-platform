/**
 * Test Script for Yavi Studio Preview System
 * Tests the new Dyad-inspired architecture
 */

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${details}`);
  }
}

async function testPreviewGeneration() {
  console.log('\n🧪 Testing Preview Generation...\n');

  // Test 1: Simple Form Generation
  try {
    const formFiles = [
      {
        path: 'src/App.tsx',
        content: `import React, { useState } from 'react';

const App = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign Up
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;`,
        language: 'typescript'
      }
    ];

    const response = await fetch('http://localhost:5001/api/preview/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: formFiles })
    });

    const result = await response.json();
    
    if (result.success && result.proxyUrl) {
      logTest('Simple Form Generation', true, `App started on port ${result.port}`);
      
      // Test if the proxy URL is accessible
      try {
        const previewResponse = await fetch(result.proxyUrl, { 
          method: 'HEAD',
          timeout: 10000 
        });
        logTest('Proxy Server Accessibility', previewResponse.ok, 
          previewResponse.ok ? 'Proxy server responding' : `HTTP ${previewResponse.status}`);
      } catch (error) {
        logTest('Proxy Server Accessibility', false, error.message);
      }
      
      return result;
    } else {
      logTest('Simple Form Generation', false, result.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    logTest('Simple Form Generation', false, error.message);
    return null;
  }
}

async function testPreviewStatus() {
  console.log('\n📊 Testing Preview Status...\n');

  try {
    const response = await fetch('http://localhost:5001/api/preview/status');
    const status = await response.json();
    
    logTest('Status Endpoint', response.ok, `Found ${status.runningApps?.length || 0} running apps`);
    
    if (status.runningApps && status.runningApps.length > 0) {
      const app = status.runningApps[0];
      logTest('Running App Info', true, `App ${app.appId} on port ${app.port}`);
    }
    
    return status;
  } catch (error) {
    logTest('Status Endpoint', false, error.message);
    return null;
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...\n');

  try {
    // Test with invalid files
    const invalidFiles = [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';

const App = () => {
  return (
    <div>
      <h1>Broken Component</h1>
      <UndefinedComponent />
    </div>
  );
};

export default App;`,
        language: 'typescript'
      }
    ];

    const response = await fetch('http://localhost:5001/api/preview/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: invalidFiles })
    });

    const result = await response.json();
    
    if (result.success) {
      logTest('Error Handling - Invalid Code', true, 'App started despite invalid code (expected)');
      
      // Test if we can stop the app
      try {
        const stopResponse = await fetch(`http://localhost:5001/api/preview/${result.sessionId}`, {
          method: 'DELETE'
        });
        logTest('App Cleanup', stopResponse.ok, 'App stopped successfully');
      } catch (error) {
        logTest('App Cleanup', false, error.message);
      }
    } else {
      logTest('Error Handling - Invalid Code', false, result.error || 'Unknown error');
    }
  } catch (error) {
    logTest('Error Handling - Invalid Code', false, error.message);
  }
}

async function runPerformanceTest() {
  console.log('\n⚡ Performance Testing...\n');

  const startTime = Date.now();
  
  try {
    const formFiles = [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Performance Test</h1>
        <p className="text-gray-600">This is a simple component for performance testing.</p>
      </div>
    </div>
  );
};

export default App;`,
        language: 'typescript'
      }
    ];

    const response = await fetch('http://localhost:5001/api/preview/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: formFiles })
    });

    const result = await response.json();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logTest('Performance - Generation Time', duration < 10000, 
      `Generation took ${duration}ms (target: <10s)`);
    
    if (result.success) {
      // Test preview load time
      const previewStartTime = Date.now();
      try {
        const previewResponse = await fetch(result.proxyUrl, { 
          method: 'HEAD',
          timeout: 15000 
        });
        const previewEndTime = Date.now();
        const previewDuration = previewEndTime - previewStartTime;
        
        logTest('Performance - Preview Load Time', previewDuration < 5000, 
          `Preview loaded in ${previewDuration}ms (target: <5s)`);
      } catch (error) {
        logTest('Performance - Preview Load Time', false, error.message);
      }
    }
    
    return result;
  } catch (error) {
    logTest('Performance Test', false, error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Yavi Studio Preview System Tests\n');
  console.log('=' .repeat(50));
  
  // Test 1: Preview Generation
  await testPreviewGeneration();
  
  // Test 2: Status Check
  await testPreviewStatus();
  
  // Test 3: Error Handling
  await testErrorHandling();
  
  // Test 4: Performance
  await runPerformanceTest();
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Test Summary');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
  
  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
  console.log(`🎯 Success Rate: ${successRate}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! The new preview system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
  
  return testResults;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults };
