require('dotenv').config();

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SCOPES, HOST, PORT } = process.env;

const Koa = require('koa');
const Router = require('koa-router');
const ejs = require('ejs');
const { default: shopifyAuth, verifyRequest } = require('@shopify/koa-shopify-auth');
const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');

Shopify.Context.initialize({
  API_KEY: SHOPIFY_API_KEY,
  API_SECRET_KEY: SHOPIFY_API_SECRET,
  SCOPES: SCOPES.split(','),
  HOST_NAME: HOST.replace(/^https:\/\//, ''),
  API_VERSION: ApiVersion.July21,
  IS_EMBEDDED_APP: true,
});

// in-memory storage
// TODO: replace with actual database
const INSTALLED_SHOPS = {};

const app = new Koa();
const router = new Router();
app.keys = [Shopify.Context.API_SECRET_KEY];

app.use(
  shopifyAuth({
    async afterAuth(ctx) {
      const { shop, accessToken } = ctx.state.shopify;
      INSTALLED_SHOPS[shop] = accessToken;

      ctx.redirect(`/?shop=${shop}`);
    },
  })
);

app.use(async (ctx, next) => {
  const shop = ctx.query.shop;
  if (shop) ctx.set('Content-Security-Policy', `frame-ancestors 'self' https://${shop};`);
  await next();
});

router.get('/', async (ctx) => {
  const shop = ctx.query.shop;

  if (INSTALLED_SHOPS[shop]) {
    ctx.body = await ejs.renderFile('./views/index.ejs', { apiKey: SHOPIFY_API_KEY });
  } else {
    ctx.redirect(`/auth?shop=${shop}`);
  }
});

router.get('(.*)', verifyRequest(), async (ctx) => {
  // catch all other routes
  ctx.body = '🔓';
});

app.use(router.allowedMethods());
app.use(router.routes());

const port = parseInt(PORT, 10) || 8081;

app.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);
});
