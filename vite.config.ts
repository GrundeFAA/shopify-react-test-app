import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
// Replace the HOST env var with SHOPIFY_APP_URL so that it doesn't break the Vite server.
// The CLI will eventually stop passing in HOST,
// so we can remove this workaround after the next major release.
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost").hostname;

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: parseInt(process.env.FRONTEND_PORT!) || 8002,
    clientPort: 443,
  };
}

export default defineConfig(({ mode }) => {
  if (mode === "storefront") {
    return {
      plugins: [tailwindcss(), tsconfigPaths()],
      build: {
        // Keep this bundle in the same static output folder as the client build.
        outDir: "build/client",
        emptyOutDir: false,
        assetsInlineLimit: 0,
        cssCodeSplit: false,
        lib: {
          entry: "app/storefront/entry.tsx",
          name: "RTB2BDashboard",
          formats: ["iife"],
          fileName: () => "storefront.js",
        },
        rollupOptions: {
          output: {
            assetFileNames: (assetInfo) =>
              assetInfo.name?.endsWith(".css")
                ? "storefront.css"
                : "assets/[name]-[hash][extname]",
          },
        },
      },
    } satisfies UserConfig;
  }

  return {
    server: {
      allowedHosts: [host],
      cors: {
        preflightContinue: true,
      },
      port: Number(process.env.PORT || 3000),
      hmr: hmrConfig,
      fs: {
        // See https://vitejs.dev/config/server-options.html#server-fs-allow for more information
        allow: ["app", "node_modules"],
      },
    },
    plugins: [
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
    ],
    build: {
      assetsInlineLimit: 0,
    },
    optimizeDeps: {
      include: ["@shopify/app-bridge-react"],
    },
  } satisfies UserConfig;
});
