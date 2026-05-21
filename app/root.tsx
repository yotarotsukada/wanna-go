import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { HeroUIProvider } from "@heroui/react";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&family=DM+Serif+Display&family=Noto+Serif+JP:wght@500;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <NuqsAdapter>
      <HeroUIProvider locale="ja-JP">
        <div className="min-h-screen relative isolate">
          <Outlet />
        </div>
      </HeroUIProvider>
    </NuqsAdapter>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "ページが見つかりません";
  let details = "申し訳ありません、お探しのページは見つかりませんでした。";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "エラー";
    details =
      error.status === 404
        ? "リクエストされたページは存在しないようです。"
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-xl mx-auto paper-card p-8 text-center">
        <h1 className="font-display text-5xl mb-4 text-deep-sea dark:text-parchment">
          {message}
        </h1>
        <p className="text-deep-sea-ink/80 dark:text-parchment/80">{details}</p>
        {stack && (
          <pre className="w-full mt-6 p-4 overflow-x-auto text-left text-xs bg-parchment dark:bg-night-sea-2 rounded">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}
