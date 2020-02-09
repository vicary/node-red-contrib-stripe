// 01-api.ts: Node for Stripe RESTful API requests.
import { Node, NodeId, NodeProperties, Red } from "node-red";
import LRU from "lru-cache";
import Stripe from "stripe";
import { name, version, repository } from "../../package.json";
import { StripeNodeCredentials } from "./00-config";

// sane defaults, up for discussions.
const instanceCache = new LRU<string, Stripe>({
  max: 5, // who uses more than 5 keys at the same time srsly?
  maxAge: 60 * 60 * 1000, // one-hour ttl, useful for daily rolling keys
});

interface StripeApiNodeProperties extends NodeProperties {
  method: string;
  configNode: NodeId;
}

const getStripeInstance = (apiKey: string): Stripe => {
  if (!instanceCache.has(apiKey)) {
    const stripe = new Stripe(apiKey, {
      apiVersion: "2019-12-03",
      appInfo: {
        name,
        version,
        url: repository.url,
      },
    });

    instanceCache.set(apiKey, stripe);
  }

  return instanceCache.get(apiKey) as Stripe;
};

export default function StripeApi(RED: Red) {
  // @ts-ignore; @types/node-red doesn't have RED._(...)
  const _ = (msg: string, context?: any) => RED._(msg, context);

  return function StripeApiNode(this: Node, props: StripeApiNodeProperties) {
    RED.nodes.createNode(this, props);

    const { apiKey } = RED.nodes.getCredentials(props.configNode) as StripeNodeCredentials;
    let active = true;

    this.on("input", async msg => {
      this.status({});

      const stripe = getStripeInstance(msg.apiKey || apiKey);
      const methodString: string = props.method || msg.topic;

      const [that, method] = (() => {
        const that = methodString.split(".");
        const method = that.pop();

        return [that.length ? RED.util.getObjectProperty(stripe, that.join(".")) : stripe, method];
      })();

      if (typeof that[method] !== "function") {
        this.error(_("stripe.invalid-method", { method: `${methodString}` }));
        this.status({ fill: "red", shape: "dot", text: `Method ${methodString} doesn't exist.` });
        return;
      }

      const args: any[] = msg.payload ? (!Array.isArray(msg.payload) ? [msg.payload] : msg.payload) : [];

      // add idempotency key
      if (msg._msgid) {
        const lastArg = args[args.length - 1] || {};

        if (!lastArg.idempotencyKey) {
          args.push({ idempotencyKey: msg._msgid });
        }
      }

      const promise = that[method](...args) as Stripe.ApiListPromise<any>;

      try {
        const response = await promise;

        if (active) {
          msg.payload = response;
          this.send(msg);
        }
      } catch (e) {
        e.source = this;
        msg.error = e;
        this.error(_("stripe.invalid-request"), msg);
        this.status({ fill: "red", shape: "dot", text: _("stripe.invalid-request") });
      }
    });

    this.on("close", () => (active = false));
  };
}
