require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const { default: shopifyAuth, verifyRequest } = require('@shopify/koa-shopify-auth');
const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(','),
  HOST_NAME: process.env.SHOP.replace(/^https:\/\//, ''),
  API_VERSION: ApiVersion.July21,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

const app = new Koa();
const router = new Router();
app.keys = [Shopify.Context.API_SECRET_KEY];

// Sets up shopify auth
app.use(
  shopifyAuth({
    async afterAuth(ctx) {
      const { shop, accessToken } = ctx.state.shopify;
      ACTIVE_SHOPIFY_SHOPS[shop] = true;

      // Redirect to app with shop parameter upon auth
      ctx.redirect(`/?shop=${shop}`);
    },
  })
);

router.get('/', async (ctx) => {
  const shop = ctx.query.shop;

  // If this shop hasn't been seen yet, go through OAuth to create a session
  if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
    ctx.redirect(`/auth?shop=${shop}`);
  } else {
    // Load app skeleton. Don't include sensitive information here!
    ctx.body = '🎉';
  }
});

router.post('/webhooks', async (ctx) => {
  try {
    await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
    console.log(`Webhook processed, returned status code 200`);
  } catch (error) {
    console.log(`Failed to process webhook: ${error}`);
  }
});

// Everything else must have sessions
router.get('(.*)', verifyRequest(), async (ctx) => {
  // Your application code goes here
});

app.use(router.allowedMethods());
app.use(router.routes());

const port = parseInt(process.env.PORT, 10) || 8081;

app.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);
});
