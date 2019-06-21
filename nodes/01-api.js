// 01-api.js: Node for Stripe RESTful API requests.

module.exports = function StripeApi(RED) {
  return function StripeApiNode({ method: nodeMethod, configNode, ...config }) {
    RED.nodes.createNode(this, { method: nodeMethod, configNode, ...config });

    let active = true;
    let stripe;

    try {
      stripe = RED.nodes.getNode(configNode).getInstance();
    }
    catch (e) {
      this.error(RED._('stripe.invalid-config'), e);
      this.status({ fill: 'red', shape: 'ring', text: 'Invalid Configuration' });
      return;
    }

    this.on('input', async msg => {
      this.status({});

      const [that, method] = (() => {
        let that = (nodeMethod || msg.topic).split('.');
        const method = that.pop();

        that = that.join('.');

        return [
          RED.util.getObjectProperty(that),
          RED.util.getObjectProperty(that + '.' + method),
        ];
      })();

      if (typeof method !== 'function') {
        this.error(RED._('stripe.invalid-method', { method: `${method.join('.')}` }));
        this.status({ fill: 'red', shape: 'dot', text: `Method ${method.join('.')} doesn't exist.` });
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

      try {
        const response = await that[method](...args);

        if (active) {
          msg.payload = response;
          this.send(msg);
        }
      } catch (err) {
        msg.error = err;
        this.error(RED._('stripe.invalid-request'), msg);
        this.status({ fill: 'red', shape: 'dot', text: `[${err.type}] ${err.message}` });
      }
    });

    this.on('close', () => active = false);
  };
};
