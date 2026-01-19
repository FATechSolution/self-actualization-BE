#!/usr/bin/env node

/**
 * Test script to verify the /api/goals/needs/:category endpoint
 * Tests both authenticated and unauthenticated access
 */

const API_URL = process.env.API_URL || 'http://localhost:5005';
const CATEGORY = 'Survival';

async function testEndpoint() {
    console.log('🧪 Testing /api/goals/needs/:category endpoint\n');
    console.log(`API URL: ${API_URL}`);
    console.log(`Category: ${CATEGORY}\n`);

    // Test 1: Without authentication
    console.log('Test 1: Request WITHOUT authentication token');
    console.log('━'.repeat(50));

    try {
        const response = await fetch(`${API_URL}/api/goals/needs/${CATEGORY}`);
        const data = await response.json();

        console.log(`Status: ${response.status}`);
        console.log(`Success: ${data.success}`);

        if (data.success) {
            console.log(`✅ Test 1 PASSED - Found ${data.total} needs`);
            console.log(`Sample data:`, data.data?.slice(0, 2));
        } else {
            console.log(`❌ Test 1 FAILED - Error: ${data.error}`);
        }
    } catch (error) {
        console.log(`❌ Test 1 FAILED - ${error.message}`);
    }

    console.log('\n');

    // Test 2: With user token (if provided)
    const USER_TOKEN = process.env.USER_TOKEN;

    if (USER_TOKEN) {
        console.log('Test 2: Request WITH user authentication token');
        console.log('━'.repeat(50));

        try {
            const response = await fetch(`${API_URL}/api/goals/needs/${CATEGORY}`, {
                headers: {
                    'Authorization': `Bearer ${USER_TOKEN}`
                }
            });
            const data = await response.json();

            console.log(`Status: ${response.status}`);
            console.log(`Success: ${data.success}`);

            if (data.success) {
                console.log(`✅ Test 2 PASSED - Found ${data.total} needs`);
                console.log(`Sample data:`, data.data?.slice(0, 2));
            } else {
                console.log(`❌ Test 2 FAILED - Error: ${data.error}`);
            }
        } catch (error) {
            console.log(`❌ Test 2 FAILED - ${error.message}`);
        }
    } else {
        console.log('⏭️  Test 2 SKIPPED - No USER_TOKEN provided');
        console.log('   Set USER_TOKEN environment variable to test with authentication');
    }

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Testing complete!');
}

// Run tests
testEndpoint().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
