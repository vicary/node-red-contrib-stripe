// 00-config.ts: Config Node for Stirpe API credentials.
import { Node, Red, NodeProperties } from "node-red";

interface StripeConfigNodeProperties extends NodeProperties {
  name: string;
  maskedSecret: string;
}

export type StripeNodeCredentials = {
  apiKey: string;
};

/**
 * TypeScript has no way to infer the runtime instance required for
 * RED.nodes.createNode(), since the Node-RED team has no plan to port to
 * TypeScript we are stuck with this at the moment.
 */
export interface StripeConfigNode extends Node {
  maskedSecret?: string;
}

export default ({ nodes }: Red) => {
  return function(this: StripeConfigNode, props: StripeConfigNodeProperties) {
    // @ts-ignore
    nodes.createNode(this, props);

    this.name = props.name;
    this.maskedSecret = props.maskedSecret;
  };
};
