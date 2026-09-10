import "../src/styles/globals.css";

import type { Preview } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type ComponentType, createElement, useEffect } from "react";
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

type StoryEnvironmentProps = {
  Story: ComponentType;
  locale: string;
  theme: string;
};

function StoryEnvironment({ Story, locale, theme }: StoryEnvironmentProps) {
  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);

  return createElement(
    ThemeProvider,
    {
      attribute: "class",
      defaultTheme: "light",
      enableSystem: false,
      forcedTheme: theme,
    },
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
              className: "min-h-screen bg-background p-6 text-foreground",
            },
            createElement(Story),
          ),
        ),
      ),
    ),
  );
}

const preview: Preview = {
  globalTypes: {
    locale: {
      description: "Application locale",
      toolbar: {
        dynamicTitle: true,
        icon: "globe",
        items: [
          { title: "English", value: "en" },
          { title: "한국어", value: "ko" },
          { title: "Français", value: "fr" },
          { title: "Español", value: "es" },
        ],
      },
    },
    theme: {
      description: "Application color theme",
      toolbar: {
        dynamicTitle: true,
        icon: "paintbrush",
        items: [
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" },
        ],
      },
    },
  },
  initialGlobals: {
    locale: "en",
    theme: "light",
  },
  decorators: [
    (Story, context) =>
      createElement(StoryEnvironment, {
        Story,
        locale: String(context.globals.locale ?? "en"),
        theme: String(context.globals.theme ?? "light"),
      }),
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
