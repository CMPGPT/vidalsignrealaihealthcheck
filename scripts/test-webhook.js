// Import fetch correctly for Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function simulateWebhook() {
  try {
    // Create a mock Stripe event for checkout.session.completed
    const mockEvent = {
      id: 'evt_test_webhook',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_webhook',
          object: 'checkout.session',
          metadata: {
            partnerId: 'P-001',
            count: '100',
            packageName: 'Basic'
          }
        }
      }
    };

    console.log('Simulating webhook event...');
    
    // Send the mock event to the webhook endpoint
    const response = await fetch('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature' // This will bypass signature verification in test mode
      },
      body: JSON.stringify(mockEvent)
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('Webhook simulation successful!');
    } else {
      console.error('Webhook simulation failed:', data.error);
    }
  } catch (error) {
    console.error('Error simulating webhook:', error);
  }
}

simulateWebhook(); 