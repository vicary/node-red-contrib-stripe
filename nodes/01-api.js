// 01-api.js: Node for Stripe RESTful API requests.

module.exports = function StripeApi(RED) {
  return function StripeApiNode(config) {
    RED.nodes.createNode(this, config);

    let node = this;

    try {
      node.stripe = RED.nodes.getNode(config.configNode).getInstance();
    }
    catch (e) {
      return node.error(RED._('stripe.invalid-config'), e);
    }

    node.active = true;
    node.method = config.method;

    node.on('input', function(msg) {
      let method = (node.method || msg.topic).split('.');
      let args = [];

      method[0] = node.stripe[method[0]] || {};
      method[1] = method[0][method[1]];

      if ( !method[1] || typeof method[1] != 'function' ) {
        return node.error(RED._('stripe.invalid-method', { method: node.method || msg.method }));
      }

      if ( msg.payload !== null && typeof msg.payload != 'undefined' ) {
        args = msg.payload;

        if ( !Array.isArray(args) ) {
          args = [args];
        }
      }

      method[1].apply(method[0], args)
        .then(response=> {
          if (!node.active) return;

          msg.payload = response;
          node.send(msg);
        })
        .catch(err=> {
          msg.error = err;

          node.error(RED._('stripe.invalid-request'), msg);
        });
    });

    node.on('close', function() {
      node.active = false;
    });
  };
};
