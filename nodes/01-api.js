// 01-api.js: Node for Stripe RESTful API requests.

module.exports = function StripeApi(RED) {
  const NUMARGS_MAP = {
    "balance": {
      "retrieve": 1,
      "retrieveTransaction": 2,
      "listTransactions": 2
    },
    "charges": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "capture": 2,
      "list": 2
    },
    "customers": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "del": 2,
      "list": 2,
      "createSource": 3,
      "retrieveSource": 3,
      "updateSource": 4,
      "verifySource": 4,
      "deleteSource": 3,
      "listSources": 3,
      "createCard": 3,
      "retrieveCard": 3,
      "updateCard": 4,
      "deleteCard": 3,
      "listCards": 3,
      "deleteDiscount": 2
    },
    "disputes": {
      "retrieve": 2,
      "update": 3,
      "close": 2,
      "list": 2
    },
    "events": {
      "retrieve": 2,
      "list": 2
    },
    "fileUploads": {
      "create": 2,
      "retrieve": 2,
      "list": 2
    },
    "payouts": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "list": 2,
      "cancel": 2
    },
    "refunds": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "list": 2
    },
    "tokens": {
      "create": 2,
      "retrieve": 2
    },
    "sources": {
      "create": 2,
      "retrieve": 2,
      "update": 3
    },
    "subscriptions": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "del": 2,
      "list": 2,
      "deleteDiscount": 2
    },
    "subscriptionItems": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "del": 2,
      "list": 2
    },
    "coupons": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "del": 2,
      "list": 2
    },
    "invoices": {
      "create": 2,
      "retrieve": 2,
      "retrieveLines": 2,
      "retrieveUpcoming": 2,
      "update": 3,
      "pay": 2,
      "list": 2
    },
    "invoiceItems": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "del": 2,
      "list": 2
    },
    "plans": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "del": 2,
      "list": 2
    },
    "accounts": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "del": 2,
      "reject": 3,
      "list": 2,
      "createLoginLink": 2,
      "createExternalAccount": 3,
      "retrieveExternalAccount": 3,
      "updateExternalAccount": 4,
      "deleteExternalAccount": 3,
      "listExternalAccounts": 3
    },
    "applicationFees": {
      "retrieve": 2,
      "list": 2,
      "createRefund": 2,
      "retrieveRefund": 3,
      "updateRefund": 4,
      "listRefunds": 3
    },
    "countrySpecs": {
      "retrieve": 2,
      "list": 2
    },
    "recipients": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "del": 2,
      "list": 2
    },
    "transfers": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "list": 2,
      "createReversal": 3,
      "retrieveReversal": 3,
      "updateReversal": 4,
      "listReversals": 3
    },
    "orders": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "pay": 3,
      "list": 2,
      "returnOrder": 3
    },
    "products": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "del": 2,
      "list": 2
    },
    "orderReturns": {
      "retrieve": 2,
      "list": 2
    },
    "skus": {
      "create": 2,
      "retrieve": 2,
      "update": 3,
      "del": 2,
      "list": 2
    }
  };

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

      args.length = NUMARGS_MAP[method[0]][method[1]] || 1;

      // add idempotency key
      if ( msg._msgid ) {
        args.push(Object.assign({ idempotency_key: msg._msgid }, args.pop() || {}));
      }

      method[1].call(method[0], ...args)
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
