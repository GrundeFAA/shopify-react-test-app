/**
 * Custom production server that mirrors @react-router/serve but adds
 * Access-Control-Allow-Origin headers to all responses.
 *
 * This is required for the Shopify App Proxy: the proxy serves HTML from
 * the Shopify storefront domain, but script/style assets are referenced
 * with absolute URLs to this app server. The browser blocks those cross-
 * origin asset requests unless the server sends CORS headers.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import url from "node:url";

import { createRequestHandler } from "@react-router/express";
import { createRequestListener } from "@mjackson/node-fetch-server";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";

process.env.NODE_ENV = process.env.NODE_ENV ?? "production";

sourceMapSupport.install({
  retrieveSourceMap(source) {
    if (source.startsWith("file://")) {
      const filePath = url.fileURLToPath(source);
      const sourceMapPath = `${filePath}.map`;
      if (fs.existsSync(sourceMapPath)) {
        return { url: source, map: fs.readFileSync(sourceMapPath, "utf8") };
      }
    }
    return null;
  },
});

const port = Number(process.env.PORT) || 3000;
const buildPathArg = process.argv[2];

if (!buildPathArg) {
  console.error(
    "\n  Usage: node server.mjs <server-build-path> - e.g. node server.mjs build/server/index.js",
  );
  process.exit(1);
}

const buildPath = path.resolve(buildPathArg);
const buildModule = await import(url.pathToFileURL(buildPath).href);

const isRSCBuild =
  typeof buildModule?.default?.fetch === "function";

let build;
if (isRSCBuild) {
  const config = {
    publicPath: "/",
    assetsBuildDirectory: "../client",
    ...buildModule.unstable_reactRouterServeConfig,
  };
  build = {
    fetch: buildModule.default.fetch,
    publicPath: config.publicPath,
    assetsBuildDirectory: path.resolve(
      path.dirname(buildPath),
      config.assetsBuildDirectory,
    ),
  };
} else {
  build = buildModule;
}

const app = express();
app.disable("x-powered-by");

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow the Shopify storefront (App Proxy) to load our JS/CSS assets
// cross-origin. Without this the browser blocks all script/style tags that
// reference this server from myshopify.com.
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
// ──────────────────────────────────────────────────────────────────────────────

if (!isRSCBuild) {
  app.use(compression());
}

app.use(
  path.posix.join(build.publicPath, "assets"),
  express.static(path.join(build.assetsBuildDirectory, "assets"), {
    immutable: true,
    maxAge: "1y",
  }),
);
app.use(build.publicPath, express.static(build.assetsBuildDirectory));
app.use(express.static("public", { maxAge: "1h" }));
app.use(morgan("tiny"));

if (build.fetch) {
  app.all("*", createRequestListener(build.fetch));
} else {
  app.all("*", createRequestHandler({ build: buildModule, mode: process.env.NODE_ENV }));
}

const onListen = () => {
  const address =
    process.env.HOST ||
    Object.values(os.networkInterfaces())
      .flat()
      .find((ip) => String(ip?.family).includes("4") && !ip?.internal)
      ?.address;

  if (!address) {
    console.log(`[server] http://localhost:${port}`);
  } else {
    console.log(`[server] http://localhost:${port} (http://${address}:${port})`);
  }
};

const server = process.env.HOST
  ? app.listen(port, process.env.HOST, onListen)
  : app.listen(port, onListen);

["SIGTERM", "SIGINT"].forEach((signal) => {
  process.once(signal, () => server?.close(console.error));
});
