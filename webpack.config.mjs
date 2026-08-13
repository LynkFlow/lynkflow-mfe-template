// Plain-JS (not .ts) on purpose -- but NOT because of a tooling limitation.
// This repo is on TypeScript 6.x, where a `webpack.config.ts` does work
// (verified). It stays JS because a .ts config buys type-checking of this one
// file in exchange for a ts-node dependency and a transpile step on every
// webpack invocation, which isn't a trade worth making for build tooling.
// Type-checking of src/ is unaffected -- `npm run typecheck` (tsc --noEmit)
// covers it, and babel-loader only strips types at build time.
//
// One consequence: this file can't import from src/ (no transpile step), so
// the "ar -> rtl" check below is duplicated from src/i18n/index.ts's
// getDirection(). If a second RTL language is ever added, update both.
import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import dotenv from "dotenv";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { dependencies } = require("./package.json");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { ModuleFederationPlugin } = webpack.container;

// Everything that needs to be configured centrally for this MFE (its MF
// name, its dev-server port, its backend base URL) lives in `.env`, not
// scattered across this file. `.env.example` is the committed template;
// `.env` is gitignored per-machine/per-environment config. See README.md §1.
// `dotenv.config()` is a no-op (doesn't throw) when `.env` doesn't exist yet,
// so a fresh clone still builds -- it just falls back to the defaults below.
dotenv.config();

/**
 * RENAME ME: `example` is the placeholder domain name, read from `.env`'s
 * MFE_NAME. Change it there when you turn this template into a real MFE --
 * it must match the key the Shell uses in its own `remotes` map.
 */
const MFE_NAME = process.env.MFE_NAME ?? "example";

/** Dev-server port. Each MFE gets its own; agree it with the Shell. Set PORT in .env. */
const PORT = Number(process.env.PORT ?? 3001);

/**
 * Base URL of THIS domain's backend service. Point it at the real
 * `lynkflow-{domain}-svc` per environment via `.env`'s API_BASE_URL; the UI
 * never imports backend source (.claude/rules/architecture.md). Falls back to
 * `/api/{MFE_NAME}` when unset.
 */
const API_BASE_URL = process.env.API_BASE_URL ?? `/api/${MFE_NAME}`;

/**
 * Language the standalone dev harness (`bootstrap.tsx`, `npm run dev` only)
 * renders in -- set via `.env`'s DEV_LANGUAGE. Baked into both the static
 * `<html lang>/<dir>` (via HtmlWebpackPlugin's `templateParameters` below)
 * and the `__DEV_LANGUAGE__` JS global `bootstrap.tsx` passes to `./App`, so
 * both stay in sync with zero runtime detection. In production the Shell
 * decides this at runtime instead (.claude/rules/i18n.md) -- this constant
 * only ever affects the standalone dev entry.
 *
 * Can't import `getDirection` from `src/i18n/index.ts` here -- this file is
 * plain JS with no transpile step (see the file header), so the tiny
 * "ar -> rtl" check is duplicated rather than imported. If a second RTL
 * language is ever added, update both this line and `src/i18n/index.ts`'s
 * `RTL_LANGUAGES`.
 */
const DEV_LANGUAGE = process.env.DEV_LANGUAGE === "ar" ? "ar" : "en";
const DEV_DIR = DEV_LANGUAGE === "ar" ? "rtl" : "ltr";

export default (_env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.ts",
    mode: argv.mode ?? "development",
    devtool: isProduction ? "source-map" : "eval-source-map",
    // Persistent filesystem cache: webpack's default in dev mode is an
    // in-memory cache, which is thrown away the moment the process exits --
    // so every single `npm run dev` was doing a full cold rebuild of the
    // whole dependency graph (react-dom, react-router-dom, etc.), every
    // time. Caching to disk means only what actually changed since the last
    // run gets recompiled -- the first start after a fresh `npm install` is
    // still a full build (nothing to cache yet), but every start after that
    // should be dramatically faster. `buildDependencies.config` tells
    // webpack to invalidate the whole cache if this file itself changes, so
    // a config edit can't silently serve a stale cached build.
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
    },
    output: {
      // publicPath "auto" lets the remote be served from any host/path without
      // rebuilding -- required for Module Federation to resolve its own chunks.
      publicPath: "auto",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          // This MFE's OWN Tailwind source (utilities-only src/styles.css).
          // Needs postcss-loader to expand Tailwind directives into real CSS.
          test: /\.css$/,
          exclude: /node_modules/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          // Already-compiled CSS shipped by a dependency (e.g.
          // @lynkflow/ui-kit/styles.css) -- must NOT go through
          // postcss-loader. Running @tailwindcss/postcss on output that's
          // already fully compiled, plain CSS (no @tailwind/@import
          // "tailwindcss"/@config directives) isn't a harmless no-op: v4's
          // postcss plugin treats every file it processes as a
          // candidate-scanning source, so feeding it an ALREADY-COMPILED
          // selector like `.bg-primary-500{...}` re-extracts "bg-primary-500"
          // as a literal class-name candidate and pollutes its shared scan
          // cache for the rest of THIS build -- which is how this app's own
          // compiled stylesheet ended up with a random, incomplete subset of
          // the ui-kit's classes (some leaked in by accident, most didn't).
          // Plain css-loader + style-loader is correct and sufficient for
          // CSS that's already fully compiled.
          test: /\.css$/,
          include: /node_modules/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: MFE_NAME,
        filename: "remoteEntry.js",
        exposes: {
          // The two entry points every LynkFlow MFE exposes.
          // See .claude/rules/routing-loading-errors.md at the workspace root.
          "./App": "./src/App.tsx",
          "./Routes": "./src/Routes.tsx",
        },
        shared: {
          // Singletons: duplicated copies of these break context across the
          // Shell/MFE boundary (hooks, Router context, query cache).
          react: { singleton: true, requiredVersion: dependencies.react },
          "react-dom": {
            singleton: true,
            requiredVersion: dependencies["react-dom"],
          },
          "react-router-dom": {
            singleton: true,
            requiredVersion: dependencies["react-router-dom"],
          },
          "@tanstack/react-query": {
            singleton: true,
            requiredVersion: dependencies["@tanstack/react-query"],
          },
        },
      }),
      new webpack.DefinePlugin({
        __API_BASE_URL__: JSON.stringify(API_BASE_URL),
        __DEV_LANGUAGE__: JSON.stringify(DEV_LANGUAGE),
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        templateParameters: { lang: DEV_LANGUAGE, dir: DEV_DIR },
      }),
    ],
    devServer: {
      port: PORT,
      historyApiFallback: true,
      // Plain live-reload (full page refresh on every detected save),
      // not HMR. HMR + Module Federation's container runtime + CSS modules
      // (style-loader) have a known bad interaction -- a hot update that
      // touches a CSS-importing module can throw
      // "Cannot set properties of undefined" inside the MF container's own
      // HMR handler, corrupting the dev session's module state until a full
      // restart. A full-page reload on save is a smaller trade than
      // periodic crashes: you still get automatic recompile + refresh on
      // every save, just without preserving component state across it.
      hot: false,
      liveReload: true,
      // Required so the Shell (a different origin in dev) can load remoteEntry.js
      headers: { "Access-Control-Allow-Origin": "*" },
    },
    watchOptions: {
      // Native OS file-change notifications don't reliably fire on some
      // drives/setups (network drives, some external or cloud-synced
      // folders) -- when that happens, webpack never notices a save at all,
      // no matter what's changed. Polling checks for changes on an interval
      // instead of waiting for an OS event, trading a small constant CPU
      // cost for actually detecting saves reliably.
      poll: 1000,
    },
    optimization: {
      // Module Federation requires a single runtime chunk per build.
      runtimeChunk: false,
    },
  };
};
