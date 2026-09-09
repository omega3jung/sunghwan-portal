import "../src/styles/globals.css";

import type { Preview } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { createElement } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "../src/lib/client/i18n/runtime";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      enabled: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        ThemeProvider,
        { attribute: "class", defaultTheme: "light", enableSystem: true },
        createElement(
          SessionProvider,
          { session: null, refetchOnWindowFocus: false },
          createElement(
            QueryClientProvider,
            { client: queryClient },
            createElement(
              I18nextProvider,
              { i18n },
              createElement(
                "div",
                {
                  className:
                    "min-h-screen bg-background p-6 text-foreground",
                },
                createElement(Story),
              ),
            ),
          ),
        ),
      ),
  ],
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
