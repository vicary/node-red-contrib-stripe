// 00-config.js: Config Node for Stirpe API credentials.

let Stripe = require('stripe');

module.exports = function StripeConfig(RED) {
  return function StripeConfigNode(config) {
    RED.nodes.createNode(this, config);

    this.version = config.version;

    this.getInstance = function() {
      stripe = new Stripe(this.credentials.secret);

      stripe.setAppInfo({
        name: "node-red-contrib-stripe",
        version: "0.1.0",
        url: "https://www.github.com/vicary/node-red-contrib-stripe"
      });

      stripe.setApiVersion(this.version);

      return stripe;
    };
  }
};
