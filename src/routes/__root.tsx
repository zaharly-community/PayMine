import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_CONFIG } from "@/config/app-config";
import { fontRegistry } from "@/lib/fonts/registry";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { ThemeBootScript } from "@/scripts/theme-boot";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";

import appCss from "../styles/styles.css?url";
import { NotFound } from "./-components/not-found";
import { RootError } from "./-components/root-error";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: APP_CONFIG.meta.title,
      },
      {
        name: "description",
        content: APP_CONFIG.meta.description,
      },
      {
        name: "application-name",
        content: APP_CONFIG.name,
      },
      {
        name: "apple-mobile-web-app-title",
        content: APP_CONFIG.name,
      },
      {
        name: "theme-color",
        content: "#ffffff",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "googlebot",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: APP_CONFIG.name,
      },
      {
        property: "og:title",
        content: APP_CONFIG.meta.title,
      },
      {
        property: "og:description",
        content: APP_CONFIG.meta.description,
      },
      {
        property: "og:image",
        content: "/logo512.png",
      },
      {
        name: "twitter:card",
        content: "summary",
      },
      {
        name: "twitter:title",
        content: APP_CONFIG.meta.title,
      },
      {
        name: "twitter:description",
        content: APP_CONFIG.meta.description,
      },
      {
        name: "twitter:image",
        content: "/logo512.png",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: fontRegistry[PREFERENCE_DEFAULTS.font].stylesheet,
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  errorComponent: RootError,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme_mode, theme_preset, content_layout, navbar_style, sidebar_variant, sidebar_collapsible, font } =
    PREFERENCE_DEFAULTS;

  return (
    <html
      lang="en"
      data-theme-mode={theme_mode}
      data-theme-preset={theme_preset}
      data-content-layout={content_layout}
      data-navbar-style={navbar_style}
      data-sidebar-variant={sidebar_variant}
      data-sidebar-collapsible={sidebar_collapsible}
      data-font={font}
      suppressHydrationWarning
    >
      <head>
        <ThemeBootScript />
        <HeadContent />
      </head>
      <body className="min-h-screen antialiased">
        <TooltipProvider>
          <PreferencesStoreProvider initialValues={PREFERENCE_DEFAULTS}>
            {children}
            <Toaster />
          </PreferencesStoreProvider>
        </TooltipProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
