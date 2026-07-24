import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybook from "eslint-plugin-storybook";
import unusedImports from "eslint-plugin-unused-imports";

const architectureSettings = {
  "import/resolver": {
    typescript: {
      project: "./tsconfig.json",
    },
  },
  "boundaries/root-path": ".",
  "boundaries/include": ["src/**/*.{js,jsx,ts,tsx,mjs,cts,mts}"],
  "boundaries/elements-single-type": true,
  "boundaries/dependency-nodes": [
    "import",
    "export",
    "dynamic-import",
    "require",
  ],
  "boundaries/files": [
    { category: "auth_entry", pattern: "src/auth.config.ts" },
    { category: "app_entry", pattern: "src/proxy.ts" },
  ],
  "boundaries/elements": [
    {
      type: "lib_application",
      pattern: "src/lib/application",
      partialMatch: false,
    },
    { type: "lib_client", pattern: "src/lib/client", partialMatch: false },
    { type: "lib_config", pattern: "src/lib/config", partialMatch: false },
    { type: "shared_client", pattern: "src/shared/client", partialMatch: false },
    { type: "app", pattern: "src/app", partialMatch: false },
    { type: "auth", pattern: "src/auth", partialMatch: false },
    { type: "components", pattern: "src/components", partialMatch: false },
    { type: "domain", pattern: "src/domain", partialMatch: false },
    { type: "feature", pattern: "src/feature", partialMatch: false },
    { type: "mocks", pattern: "src/mocks", partialMatch: false },
    { type: "server", pattern: "src/server", partialMatch: false },
    { type: "shared", pattern: "src/shared", partialMatch: false },
    { type: "stories", pattern: "src/stories", partialMatch: false },
    { type: "styles", pattern: "src/styles", partialMatch: false },
    { type: "types", pattern: "src/types", partialMatch: false },
  ],
};

const architectureRules = {
  "boundaries/dependencies": [
    "error",
    {
      default: "disallow",
      message:
        "Disallowed dependency: {{from.type}} cannot import {{to.type}} ({{to.filePath}}).",
      policies: [
        {
          from: { file: { categories: "auth_entry" } },
          allow: {
            to: {
              element: {
                types: {
                  anyOf: [
                    "auth",
                    "domain",
                    "lib_application",
                    "lib_config",
                    "mocks",
                    "server",
                    "shared",
                  ],
                },
              },
            },
          },
        },
        {
          from: { file: { categories: "app_entry" } },
          allow: {
            to: {
              element: {
                types: {
                  anyOf: [
                    "app",
                    "auth",
                    "components",
                    "domain",
                    "feature",
                    "lib_application",
                    "lib_client",
                    "lib_config",
                    "mocks",
                    "server",
                    "shared",
                    "shared_client",
                    "styles",
                  ],
                },
              },
            },
          },
        },
        {
          from: { element: { types: "app" } },
          allow: { to: { file: { categories: "auth_entry" } } },
        },
        {
          from: { element: { types: "app" } },
          allow: {
            to: {
              element: {
                types: {
                  anyOf: [
                    "app",
                    "auth",
                    "components",
                    "domain",
                    "feature",
                    "lib_application",
                    "lib_client",
                    "lib_config",
                    "mocks",
                    "server",
                    "shared",
                    "shared_client",
                    "styles",
                  ],
                },
              },
            },
          },
        },
        {
          from: { element: { types: "auth" } },
          allow: {
            to: {
              element: {
                types: {
                  anyOf: [
                    "auth",
                    "domain",
                    "lib_application",
                    "lib_config",
                    "mocks",
                    "server",
                    "shared",
                  ],
                },
              },
            },
          },
        },
        {
          from: { element: { types: "components" } },
          allow: {
            to: {
              element: {
                types: {
                  anyOf: [
                    "components",
                    "domain",
                    "feature",
                    "lib_application",
                    "lib_client",
                    "lib_config",
                    "shared",
                    "shared_client",
                    "styles",
                  ],
                },
              },
            },
          },
        },
        {
          from: { element: { types: "domain" } },
          allow: { to: { element: { types: { anyOf: ["domain", "shared"] } } } },
        },
        {
          from: { element: { types: "feature" } },
          allow: {
            to: {
              element: {
                types: {
                  anyOf: [
                    "components",
                    "domain",
                    "feature",
                    "lib_application",
                    "lib_client",
                    "lib_config",
                    "shared",
                    "shared_client",
                  ],
                },
              },
            },
          },
        },
        {
          from: { element: { types: "lib_application" } },
          allow: {
            to: {
              element: {
                types: { anyOf: ["domain", "lib_application", "shared"] },
              },
            },
          },
        },
        {
          from: { element: { types: "lib_client" } },
          allow: {
            to: {
              element: {
                types: {
                  anyOf: [
                    "domain",
                    "lib_application",
                    "lib_client",
                    "lib_config",
                    "shared",
                    "shared_client",
                  ],
                },
              },
            },
          },
        },
        {
          from: { element: { types: "lib_config" } },
          allow: {
            to: { element: { types: { anyOf: ["lib_config", "shared"] } } },
          },
        },
        {
          from: { element: { types: "mocks" } },
          allow: {
            to: {
              element: {
                types: {
                  anyOf: [
                    "components",
                    "domain",
                    "feature",
                    "lib_application",
                    "lib_config",
                    "mocks",
                    "shared",
                  ],
                },
              },
            },
          },
        },
        {
          from: { element: { types: "server" } },
          allow: {
            to: {
              element: {
                types: {
                  anyOf: [
                    "domain",
                    "lib_application",
                    "lib_config",
                    "server",
                    "shared",
                  ],
                },
              },
            },
          },
        },
        {
          from: { element: { types: "shared" } },
          allow: { to: { element: { types: "shared" } } },
        },
        {
          from: { element: { types: "shared_client" } },
          allow: {
            to: {
              element: { types: { anyOf: ["shared", "shared_client"] } },
            },
          },
        },
        {
          from: { element: { types: "stories" } },
          allow: {
            to: {
              element: {
                types: {
                  anyOf: [
                    "components",
                    "domain",
                    "feature",
                    "lib_application",
                    "lib_client",
                    "lib_config",
                    "shared",
                    "shared_client",
                    "stories",
                    "styles",
                  ],
                },
              },
            },
          },
        },
        {
          from: { element: { types: "styles" } },
          allow: { to: { element: { types: "styles" } } },
        },
        {
          from: { element: { types: "types" } },
          allow: {
            to: {
              element: {
                types: { anyOf: ["auth", "domain", "shared", "types"] },
              },
            },
          },
        },
      ],
    },
  ],
  "boundaries/no-unknown-files": "error",
  "boundaries/no-unknown-dependencies": ["error", { require: "any" }],
  "unused-imports/no-unused-imports": "error",
  "simple-import-sort/imports": "error",
  "simple-import-sort/exports": "error",
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
  "@typescript-eslint/no-explicit-any": "off",
  "@next/next/no-img-element": "off",
  // React Compiler is intentionally not enabled in this migration. These
  // compiler-oriented checks would otherwise require unrelated state/effect
  // rewrites across the existing application.
  "react-hooks/incompatible-library": "off",
  "react-hooks/preserve-manual-memoization": "off",
  "react-hooks/purity": "off",
  "react-hooks/refs": "off",
  "react-hooks/set-state-in-effect": "off",
};

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  ...storybook.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: {
      boundaries,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    settings: architectureSettings,
    rules: architectureRules,
  },
  globalIgnores([
    ".agents/**",
    ".next/**",
    "build/**",
    "coverage/**",
    "node_modules/**",
    "out/**",
    "storybook-static/**",
    "next-env.d.ts",
  ]),
]);
