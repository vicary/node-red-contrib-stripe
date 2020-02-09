// stripe.js: Nodes for Stripe API.
import { Red } from "node-red";
import createConfigNode from "./nodes/00-config";
import createApiNode from "./nodes/01-api";

export default (RED: Red) => {
  RED.nodes.registerType("stripe-config", createConfigNode(RED), {
    credentials: { apiKey: { type: "text" } },
  });

  RED.nodes.registerType("stripe", createApiNode(RED));
};
