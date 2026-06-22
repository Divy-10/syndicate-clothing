require('../backend/node_modules/dotenv').config({ path: '../backend/.env' });
const delhivery = require('../backend/services/delhivery');
const mongoose = require('mongoose');

console.log('--- DELHIvery API VERIFICATION SCRIPT ---');
console.log('API URL:', process.env.DELHIVERY_API_URL);
console.log('Warehouse:', process.env.DELHIVERY_WAREHOUSE_NAME);
console.log('API Token:', process.env.DELHIVERY_API_TOKEN ? 'Loaded (starts with ' + process.env.DELHIVERY_API_TOKEN.substring(0, 5) + '...)' : 'MISSING!');

if (!process.env.DELHIVERY_API_TOKEN) {
  console.error('Error: DELHIVERY_API_TOKEN not found in environment!');
  process.exit(1);
}

// 1. Mock Order Document for testing
const mockOrder = {
  _id: new mongoose.Types.ObjectId(),
  totalAmount: 1299,
  paymentMethod: 'COD',
  items: [
    {
      name: 'Syndicate Classic Tee',
      price: 1299,
      qty: 1,
      size: 'L'
    }
  ],
  shippingAddress: {
    fullName: 'Jane Doe',
    address: 'Flat 405, Gold Heritage, MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '9876543210',
    email: 'janedoe@example.com'
  }
};

async function runTests() {
  try {
    // Test A: Check pincode serviceability
    console.log('\n--- Test 1: Checking Serviceability for Pincode 400001 ---');
    const serviceability = await delhivery.checkServiceability('400001');
    console.log('Serviceability response:', JSON.stringify(serviceability).substring(0, 300) + '...');

    // Test B: Shipment creation with mock order
    console.log('\n--- Test 2: Creating Mock Shipment ---');
    const shipmentRes = await delhivery.createShipment(mockOrder);
    console.log('Shipment response:', JSON.stringify(shipmentRes));

    if (shipmentRes.packages && shipmentRes.packages.length > 0) {
      const pkg = shipmentRes.packages[0];
      console.log(`Successfully generated AWB: ${pkg.waybill}`);
      
      // Test C: Fetch tracking for generated AWB
      console.log('\n--- Test 3: Tracking Generated AWB ---');
      const tracking = await delhivery.getTrackingDetails(pkg.waybill);
      console.log('Tracking response:', JSON.stringify(tracking).substring(0, 500) + '...');
    } else {
      console.log('No package/AWB generated in mock test (expected on staging if credentials/warehouse are unverified, check response details above)');
    }

    console.log('\nDelhivery API testing completed successfully!');
  } catch (error) {
    console.error('Verification script failed:', error);
  }
}

runTests();
