const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const isDummy = !accountSid || !authToken || !fromNumber || accountSid.includes('your_twilio');

let client = null;
if (!isDummy) {
  try {
    client = twilio(accountSid, authToken);
  } catch (err) {
    console.error('Failed to initialize Twilio client:', err.message);
  }
}

/**
 * Sends an SMS message containing the OTP
 * @param {string} phone - Target phone number in E.164 format (e.g., +919999999999)
 * @param {string} otp - The 6-digit OTP code
 */
const sendOTP = async (phone, otp) => {
  const messageBody = `Your El Bro Syndicate verification code is: ${otp}. Valid for 5 minutes.`;

  if (isDummy || !client) {
    console.log('\n===============================================');
    console.log(`[MOCK SMS] Sending OTP to: ${phone}`);
    console.log(`[MOCK SMS] Message: "${messageBody}"`);
    console.log('===============================================\n');
    return { success: true, mock: true };
  }

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: phone
    });
    console.log(`✅ SMS successfully sent to ${phone}. SID: ${message.sid}`);
    return { success: true, messageSid: message.sid };
  } catch (err) {
    console.error(`❌ Twilio SMS Error sending to ${phone}:`, err.message);
    throw new Error(`Failed to send SMS: ${err.message}`);
  }
};

module.exports = { sendOTP };
