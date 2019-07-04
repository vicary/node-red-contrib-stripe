// stripe.js: Nodes for Stripe API.

const StripeConfig = require('./nodes/00-config');
const StripeApi = require('./nodes/01-api');

module.exports = function (RED) {
  RED.nodes.registerType('stripe-config', new StripeConfig(RED), {
    credentials: {
      secret: { type: 'text' }
    }
  });

  RED.nodes.registerType('stripe', new StripeApi(RED));
};
