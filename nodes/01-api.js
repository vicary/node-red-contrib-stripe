// 01-api.js: Node for Stripe RESTful API requests.

module.exports = function StripeApi(RED) {
  return function StripeApiNode(config) {
    RED.nodes.createNode(this, config);

    const { method: nodeMethod, configNode } = config;
    const stripe = (() => {
      try {
        return RED.nodes.getNode(configNode).getInstance();
      }
      catch (e) {
        this.error(RED._('stripe.invalid-config'), e);
        this.status({ fill: 'red', shape: 'ring', text: 'Invalid Configuration' });
      }
    })();

    if (stripe) {
      let active = true;

      this.on('input', msg => {
        this.status({});

        const [that, method] = (() => {
          let that = (nodeMethod || msg.topic).split('.');
          const method = that.pop();

          that = that.join('.');

          return [
            that ? RED.util.getObjectProperty(stripe, that) : stripe,
            method,
          ];
        })();

        if (typeof that[method] !== 'function') {
          const method = nodeMethod || msg.topic;

          this.error(RED._('stripe.invalid-method', { method: `${method}` }));
          this.status({ fill: 'red', shape: 'dot', text: `Method ${method} doesn't exist.` });
          return;
        }

        const args = (() => {
          if (msg.payload !== null && typeof msg.payload !== 'undefined') {
            let args;
            if (!Array.isArray(msg.payload)) {
              args = [msg.payload];
            } else {
              args = msg.payload;
            }
            return args;
          }

          return [];
        })();

        // add idempotency key
        if (msg._msgid) {
          const [arg0 = {}] = args;

          arg0.idempotency_key = msg._msgid;
          args[0] = arg0;
        }

        that[method](...args)
          .then(response => {
            if (active) {
              msg.payload = response;
              this.send(msg);
            }
          }, error => {
            msg.error = error;
            this.error(RED._('stripe.invalid-request'), msg);
            this.status({ fill: 'red', shape: 'dot', text: RED._('stripe.invalid-request') });
          });
      });

      this.on('close', () => active = false);
    }
  }
};
