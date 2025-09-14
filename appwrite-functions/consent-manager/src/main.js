const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Twilio integration for SMS/calls
async function sendConsentSMS(customer, workerName) {
  try {
    // In production, integrate with Twilio
    const consentLink = `${process.env.APP_URL}/consent/${customer.$id}`;

    const message = `Hi ${customer.name}, this is ${workerName} from AgentVaani. Please confirm you allow us to contact you about insurance products by clicking: ${consentLink}. Reply STOP to opt out.`;

    // Mock SMS sending - replace with actual Twilio integration
    console.warn(`SMS to ${customer.phone_e164}: ${message}`);

    // In production:
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await twilio.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: customer.phone_e164
    // });

    return { success: true, method: 'sms' };
  } catch (error) {
    throw new Error(`SMS sending failed: ${error.message}`);
  }
}

async function makeConsentCall(customer, workerName) {
  try {
    // In production, integrate with Twilio Voice API
    const script = `Hi ${customer.name}, this is ${workerName} from AgentVaani. We'd like to contact you about insurance products. Press 1 to consent or hang up to decline. This call is recorded.`;

    // Mock call - replace with actual Twilio integration
    console.warn(`Call to ${customer.phone_e164}: ${script}`);

    // In production:
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await twilio.calls.create({
    //   twiml: `<Response><Say>${script}</Say><Gather numDigits="1" action="${process.env.APP_URL}/api/consent-response"/></Response>`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: customer.phone_e164
    // });

    return { success: true, method: 'call' };
  } catch (error) {
    throw new Error(`Call failed: ${error.message}`);
  }
}

module.exports = async ({ req, res, log, error }) => {
  try {
    const { customerIds, method, userId, workerName } = JSON.parse(req.body || '{}');

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      throw new Error('Customer IDs are required');
    }

    if (!['sms', 'call'].includes(method)) {
      throw new Error('Invalid consent method');
    }

    let sentCount = 0;
    const errors = [];

    // Process each customer
    for (const customerId of customerIds) {
      try {
        // Get customer details
        const customer = await databases.getDocument(
          process.env.DATABASE_ID,
          process.env.CUSTOMERS_COLLECTION_ID,
          customerId,
        );

        if (customer.worker_id !== userId) {
          errors.push(`Customer ${customerId}: Access denied`);
          continue;
        }

        if (customer.opted_in) {
          errors.push(`Customer ${customer.name}: Already opted in`);
          continue;
        }

        // Send consent request based on method
        let result;
        if (method === 'sms') {
          result = await sendConsentSMS(customer, workerName);
        } else {
          result = await makeConsentCall(customer, workerName);
        }

        if (result.success) {
          // Update customer record to track consent request
          await databases.updateDocument(
            process.env.DATABASE_ID,
            process.env.CUSTOMERS_COLLECTION_ID,
            customerId,
            {
              consent_request_sent: true,
              consent_request_method: method,
              consent_request_timestamp: new Date().toISOString(),
            },
          );

          sentCount++;
          log(`Consent request sent to ${customer.name} via ${method}`);
        }
      } catch (err) {
        errors.push(`Customer ${customerId}: ${err.message}`);
        error(`Error processing customer ${customerId}:`, err);
      }
    }

    return res.json({
      success: true,
      sent: sentCount,
      errors,
      message: `Consent requests sent to ${sentCount} customers`,
    });
  } catch (err) {
    error('Consent manager function error:', err);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};
