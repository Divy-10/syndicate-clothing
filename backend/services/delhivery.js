const axios = require('axios');

const API_TOKEN = process.env.DELHIVERY_API_TOKEN;
const API_URL = process.env.DELHIVERY_API_URL || 'https://staging-express.delhivery.com';
const WAREHOUSE_NAME = process.env.DELHIVERY_WAREHOUSE_NAME || 'el bro syndicate';

/**
 * Common headers for Delhivery Express API
 */
const getHeaders = () => {
  return {
    'Authorization': `Token ${API_TOKEN}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  };
};

/**
 * Check pin code serviceability
 * @param {string} pincode 
 */
const checkServiceability = async (pincode) => {
  try {
    const url = `${API_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Token ${API_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Delhivery Serviceability Check Error:', error.response?.data || error.message);
    throw new Error('Failed to verify serviceability with Delhivery');
  }
};

/**
 * Book a shipment/order with Delhivery
 * @param {Object} order - Mongoose Order document
 */
const createShipment = async (order) => {
  try {
    const isCOD = order.paymentMethod === 'COD';
    const codAmount = isCOD ? order.totalAmount : 0;
    const paymentMode = isCOD ? 'COD' : 'Prepaid';

    const capitalize = (str) => {
      if (!str) return '';
      return str.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    // Build the package descriptions from items
    const desc = order.items.map(item => `${item.name} (${item.size || 'N/A'}) x ${item.qty}`).join(', ');

    // Structure required by Delhivery: format=json&data={...}
    const payload = {
      shipments: [
        {
          name: order.shippingAddress.fullName || 'Customer',
          add: order.shippingAddress.address || '',
          city: capitalize(order.shippingAddress.city),
          state: capitalize(order.shippingAddress.state),
          pin: order.shippingAddress.pincode || '',
          phone: order.shippingAddress.phone || '',
          email: order.shippingAddress.email || '',
          country: 'India',
          seller_name: "El Bro Syndicate",
          waybill: "",
          order: order._id.toString(),
          payment_mode: paymentMode,
          cod_amount: codAmount,
          total_amount: order.totalAmount,
          pickup_location: WAREHOUSE_NAME,
          products_desc: desc.substring(0, 240), // truncate if too long
          quantity: order.items.reduce((sum, item) => sum + item.qty, 0),
          // Dimensions and weight configuration (default package size/weight)
          weight: "0.5",
          shipment_width: "15",
          shipment_height: "5",
          shipment_length: "20",
          shipping_mode: "Surface",
          address_type: "home",
          order_date: new Date().toISOString()
        }
      ],
      pickup_location: {
        name: WAREHOUSE_NAME
      }
    };

    console.log("Delhivery Shipment Payload:", JSON.stringify(payload, null, 2));

    const requestBody = new URLSearchParams();
    requestBody.append('format', 'json');
    requestBody.append('data', JSON.stringify(payload));

    const url = `${API_URL}/api/cmu/create.json`;
    console.log(`Sending shipment creation request to Delhivery: ${url}`);
    
    const response = await axios.post(url, requestBody.toString(), {
      headers: getHeaders()
    });

    console.log('Delhivery API Response:', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Delhivery Shipment Creation Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Track shipment using AWB/Waybill
 * @param {string} awb - Waybill number
 */
const getTrackingDetails = async (awb) => {
  try {
    const url = `${API_URL}/api/v1/packages/json/?waybill=${awb}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Token ${API_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Delhivery Tracking Error for AWB ${awb}:`, error.response?.data || error.message);
    throw new Error('Failed to fetch tracking details from Delhivery');
  }
};

/**
 * Get print URL for AWB packing slip
 * @param {string} awb - Waybill number
 */
const getPackingSlipUrl = (awb) => {
  // Return the direct web view url that admins can click to load the packing slip/label
  return `${API_URL}/api/p/packing_slip?wbns=${awb}&token=${API_TOKEN}`;
};

/**
 * Book a return/reverse pickup shipment with Delhivery
 * @param {Object} returnReq - Return request details containing customer pickup address
 */
const createReverseShipment = async (returnReq) => {
  try {
    const capitalize = (str) => {
      if (!str) return '';
      return str.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    // Structure required by Delhivery: format=json&data={...}
    const payload = {
      shipments: [
        {
          name: returnReq.customerName || 'Customer',
          add: returnReq.pickupAddress || '',
          city: capitalize(returnReq.city),
          state: capitalize(returnReq.state),
          pin: returnReq.pincode || '',
          phone: returnReq.phone || '',
          email: returnReq.email || '',
          country: 'India',
          seller_name: "El Bro Syndicate",
          waybill: "",
          order: returnReq.orderId || `RET-${Date.now()}`,
          payment_mode: "Pickup", // "Pickup" indicates reverse pickup/return shipment
          cod_amount: 0,
          total_amount: 0, 
          pickup_location: WAREHOUSE_NAME, // Return destination (the registered warehouse)
          products_desc: `Return: ${returnReq.productName || 'Items'}`.substring(0, 240),
          quantity: 1,
          weight: "0.5",
          shipment_width: "15",
          shipment_height: "5",
          shipment_length: "20",
          shipping_mode: "Surface",
          address_type: "home",
          order_date: new Date().toISOString()
        }
      ],
      pickup_location: {
        name: WAREHOUSE_NAME
      }
    };

    console.log("Delhivery Reverse Shipment Payload:", JSON.stringify(payload, null, 2));

    const requestBody = new URLSearchParams();
    requestBody.append('format', 'json');
    requestBody.append('data', JSON.stringify(payload));

    const url = `${API_URL}/api/cmu/create.json`;
    console.log(`Sending reverse shipment creation request to Delhivery: ${url}`);
    
    const response = await axios.post(url, requestBody.toString(), {
      headers: getHeaders()
    });

    console.log('Delhivery Reverse API Response:', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Delhivery Reverse Shipment Creation Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

module.exports = {
  checkServiceability,
  createShipment,
  createReverseShipment,
  getTrackingDetails,
  getPackingSlipUrl
};
