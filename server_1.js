// Import Koa / Dotenv / Fetch modules
require("isomorphic-fetch");
const Koa = require("koa");
const koaStatic = require("koa-static");
const mount = require("koa-mount");
const bodyParser = require('koa-bodyparser');
const json = require('koa-json');
const session = require("koa-session");
const cors = require('@koa/cors');
const dotenv = require("dotenv");
const { updateClientOnShopify } = require('./server/apiCalls.js');
const { router } = require('./server/routes.js');

//Parametro establecido para evitar verificacion de certificados de seguridad TLS HTTPS por NODE.JS
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// Import Shopify/Koa modules to assist with authentication
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');

// Env Configuration
dotenv.config();
Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET_KEY,
  SCOPES: process.env.SHOPIFY_API_SCOPES.split(","),
  HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});
const port = parseInt(process.env.PORT, 10) || 3000;
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

// Create server using Koa
const server = new Koa();
server.use(session(server));
server.keys = [Shopify.Context.API_SECRET_KEY];

// Enable CORS (required to let Shopify access this API)
server.use(cors());
server.use(json());
// Use module 'koa-bodyparser'
server.use(bodyParser());
// Import and use server-side routes
server.use(router.routes());
server.use(router.allowedMethods());

// Authenticate app with Shopify
server.use(
    createShopifyAuth({
        apiKey: SHOPIFY_API_KEY,
        secret: SHOPIFY_API_SECRET_KEY,
        scopes: ["read_products", "write_products"],
        afterAuth(ctx) {
            const { shop, accessToken } = ctx.session;
            ctx.cookies.set("accessToken", accessToken, { httpOnly: false });
            ctx.cookies.set("shopOrigin", shop, { httpOnly: false });
            ctx.redirect("/");
        }
    })
);
server.use(verifyRequest());

// Mount app on root path using compiled Vue app in the dist folder
server.use(mount("/", koaStatic(__dirname + "/public")));

// Start-up the server
server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    /*setInterval(async function(){
      const a = await updateClientOnShopify();
      console.log(a);
    },10000);*/
});
