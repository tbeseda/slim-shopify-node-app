# Slim Shopify Node.js App

A trimmed down boilerplate for an embedded Shopify Application

## What?

Included features:

- A Koa.js server that uses Shopify's library for OAuth
- `koa-router`
- `ejs` to render a minimal HTML view
- An App Bridge connection

This project is more about what isn't included:

- React/Next.js or any client library
- Preprocessing like Babel
- project configuration like linting
- testing (be sure to add some!)

**Why ejs though?**
To pass the API key to App Bridge on the front end. Adding a client build process could replace ejs.

## Get Started

### Requirements

- Node.js
- Shopify Partner account
- Shopify CLI (be sure to login first)
- a (probably fresh) Shopify app
- a development shop

### Setup

Clone this repo to your local environment and a few Shopify CLI commands:

```bash
git clone git@github.com:tbeseda/slim-shopify-node-app.git my-new-app
cd my-new-app
npm i # or yarn
```

Make sure your Shopify CLI is logged in then connect this codebase to your app and store:

```bash
shopify whoami
shopify node connect
```

Start the server:

```bash
shopify node serve
```

Use the URL provided by the CLI to install your app.

Once authenticated you should be redirected to the main index showing a simple `<h1>` and a "Toast" confirming that App Bridge connected 👍

## Next Steps

Build your app!

1. pick a database (gotta save those access tokens)
1. use a client build process
1. add some of the tools offered by Shopify (like Polaris)
1. deploy to the cloud
1. get your app approved
