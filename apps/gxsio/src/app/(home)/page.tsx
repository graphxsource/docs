import {
  ArrowRight,
  BookOpen,
  Braces,
  KeyRound,
  WandSparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GraphxServer.io documentation",
  description:
    "API keys, API reference, and MCP tools for GraphxServer.io integrations.",
};

const sections = [
  {
    title: "API keys",
    description:
      "Create an organization API key, store its secret, and rotate or revoke it when needed.",
    href: "/docs/api-keys",
    linkLabel: "Manage API keys",
    icon: KeyRound,
  },
  {
    title: "API reference",
    description:
      "Explore product data, mockup requests, location aliases, and lifestyle image generation.",
    href: "/docs/api",
    linkLabel: "Browse API reference",
    icon: Braces,
  },
  {
    title: "MCP tools",
    description:
      "Connect an agent to GraphxServer.io to create mockups and retrieve product views.",
    href: "/docs/mcp/mcp",
    linkLabel: "Connect to MCP",
    icon: WandSparkles,
  },
];

const startingPoints = [
  {
    label: "Send your first API request",
    detail: "API-key authentication",
    href: "/docs/api-keys/use-an-api-key",
  },
  {
    label: "Work with products and mockups",
    detail: "V1 API reference",
    href: "/docs/api/v1/product-mockup-requests",
  },
  {
    label: "Create mockups with an agent",
    detail: "MCP tool inputs and responses",
    href: "/docs/mcp/tools",
  },
];

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b bg-fd-background">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-fd-card px-3 py-1.5 text-fd-muted-foreground text-sm">
              <BookOpen className="size-4" />
              GraphxServer.io documentation
            </div>
            <h1 className="text-balance font-semibold text-4xl tracking-tight sm:text-6xl">
              Build with GraphxServer.io.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-fd-muted-foreground text-lg leading-8">
              Create API keys, explore the API, and connect agents through MCP.
              Start with the guide that matches your integration.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-fd-primary px-5 font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
              >
                Browse all docs
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/docs/api-keys"
                className="inline-flex h-11 items-center gap-2 rounded-md border bg-fd-background px-5 font-medium transition-colors hover:bg-fd-accent"
              >
                <KeyRound className="size-4" />
                Create an API key
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="mb-8">
          <p className="font-medium text-fd-primary text-sm">Browse by area</p>
          <h2 className="mt-2 font-semibold text-2xl tracking-tight">
            Find the right starting point
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.title}
                href={section.href}
                className="group flex min-h-64 flex-col rounded-xl border bg-fd-card p-6 transition-colors hover:border-fd-primary/40 hover:bg-fd-accent/40"
              >
                <div className="flex size-10 items-center justify-center rounded-lg border bg-fd-background text-fd-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-6 font-semibold text-lg">{section.title}</h3>
                <p className="mt-2 text-fd-muted-foreground text-sm leading-6">
                  {section.description}
                </p>
                <span className="mt-auto flex items-center gap-2 pt-6 font-medium text-sm">
                  {section.linkLabel}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t bg-fd-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div>
            <h2 className="font-semibold text-xl">Common starting points</h2>
            <p className="mt-2 text-fd-muted-foreground text-sm leading-6">
              Start an API integration or connect an agent to the mockup tools.
            </p>
          </div>

          <div className="divide-y rounded-xl border bg-fd-card">
            {startingPoints.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-fd-accent/50"
              >
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="mt-1 text-fd-muted-foreground text-xs">
                    {item.detail}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col justify-between gap-5 rounded-xl border bg-fd-card px-6 py-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">Can't find what you need?</h2>
            <p className="mt-1 text-fd-muted-foreground text-sm">
              Open the documentation index to search every available guide.
            </p>
          </div>
          <Link
            href="/docs"
            className="inline-flex shrink-0 items-center gap-2 font-medium text-fd-primary text-sm"
          >
            Go to docs
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
