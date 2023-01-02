# node-red-contrib-stripe

Node-Red wrapper for node.js Stripe plugin.

## Notice: Conditional Maintenance

Node-RED is not receiving the attention I anticipated in 2017, I will keep this
project up to date as long as there is one active sponsor at any given time.

If you want to see some features happening, just chip in and DM me.

## Install

Normally you run this from your project root.

```sh
npm install node-red-contrib-stripe
```

We don't have other installation options yet, you can only do it normally right
now.

In the future you may specify an earlier version in case we made breaking
changes.

```sh
npm install node-red-contrib-stripe@0.1.0
```

## Usage

1. Drag a Stripe node to a flow
2. Create Stripe config with your API keys
3. Choose an API method, or use `msg.topic` dynamically in run-time.

## Contributing

This is still a primitive wrapper, feel free to drop a message or two if you
have high-level integration ideas.

PRs regarding bugfixes and i18n is always welcomed.

## Copyright and license

&copy; Vicary Archangel, licenced [Apache 2.0](https://github.com/vicary/node-red-contrib-stripe/blob/master/LICENSE)
