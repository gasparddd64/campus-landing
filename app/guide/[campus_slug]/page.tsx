import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";

// Public guide — no auth required
const anonClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ campus_slug: string }>;
}): Promise<Metadata> {
  const { campus_slug } = await params;
  const { data: campus } = await anonClient
    .from("campuses")
    .select("name, city, state")
    .eq("slug", campus_slug)
    .maybeSingle();

  if (!campus) return { title: "Campus Guide" };

  return {
    title: `${campus.name} International Student Guide`,
    description: `Practical guide for international students arriving at ${campus.name} in ${campus.city}, ${campus.state}. Banking, SSN, phone plan, transport, housing, and common scams.`,
    openGraph: {
      title: `${campus.name} International Student Guide`,
      description: `Everything you need to know to get settled at ${campus.name}.`,
    },
  };
}

async function getGuideContent(slug: string): Promise<string | null> {
  const guidesDir = path.join(process.cwd(), "content", "guides");
  // Try specific campus guide first, then placeholder
  for (const name of [slug, "placeholder"]) {
    try {
      const content = await readFile(path.join(guidesDir, `${name}.md`), "utf-8");
      return content;
    } catch {
      // continue
    }
  }
  return null;
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mb-6">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-3 pt-6 border-t border-gray-100">$2</h2>'.replace('$2', '$1'))
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-gray-600">$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700 text-sm">• $1</li>')
    .replace(/^---$/gm, '<hr class="border-gray-100 my-2" />')
    .replace(/⚠️ (.+?)$/gm, '<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 my-3">⚠️ $1</div>')
    .replace(/\n\n/g, '</p><p class="text-sm text-gray-700 mb-3">')
    .replace(/^(?!<[h1-6]|<li|<hr|<div|<\/p>|<p )(.+)$/gm, '$1');
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ campus_slug: string }>;
}) {
  const { campus_slug } = await params;

  const { data: campus } = await anonClient
    .from("campuses")
    .select("name, city, state, slug")
    .eq("slug", campus_slug)
    .maybeSingle();

  if (!campus) notFound();

  const content = await getGuideContent(campus_slug);
  if (!content) notFound();

  const sections = [
    "Banking",
    "SSN",
    "Phone plan",
    "Transport",
    "Housing",
    "Common scams",
  ];

  // Parse sections for anchor links
  const anchorId = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/home" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back
          </Link>
          <div className="text-sm text-gray-400">
            {campus.name} · {campus.city}, {campus.state}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Section nav */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-8">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
            Jump to section
          </p>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s}
                href={`#${anchorId(s)}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Guide content */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-8">
          <article className="prose prose-sm max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {campus.name} International Student Guide
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Practical tips for international students arriving at {campus.name} in {campus.city}, {campus.state}.
            </p>

            {content.split(/^## /m).slice(1).map((section) => {
              const lines = section.split("\n");
              const title = lines[0].trim();
              const body = lines.slice(1).join("\n").trim();
              const id = anchorId(title);

              return (
                <section key={id} id={id} className="mb-8 pt-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                    {title}
                  </h2>
                  <div className="space-y-2">
                    {body.split("\n").map((line, i) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <p key={i} className="font-semibold text-gray-900 mt-3 text-sm">
                            {line.replace(/\*\*/g, "")}
                          </p>
                        );
                      }
                      if (line.startsWith("- ")) {
                        return (
                          <p key={i} className="text-sm text-gray-700 pl-4">
                            • {line.slice(2).replace(/\*\*(.+?)\*\*/g, "$1")}
                          </p>
                        );
                      }
                      if (line.startsWith("**⚠️") || line.startsWith("⚠️")) {
                        return (
                          <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 my-2">
                            {line.replace(/\*\*/g, "")}
                          </div>
                        );
                      }
                      if (line.startsWith("---")) {
                        return <hr key={i} className="border-gray-100 my-4" />;
                      }
                      if (line.startsWith("### ")) {
                        return (
                          <p key={i} className="font-medium text-gray-800 text-sm mt-3">
                            {line.slice(4).replace(/\*\*(.+?)\*\*/g, "$1")}
                          </p>
                        );
                      }
                      if (line.trim() === "") return <div key={i} className="h-2" />;
                      return (
                        <p key={i} className="text-sm text-gray-700"
                           dangerouslySetInnerHTML={{
                             __html: line
                               .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                               .replace(/\*(.+?)\*/g, '<em>$1</em>')
                           }}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </article>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>
            Have something to add?{" "}
            <Link href="/home" className="text-blue-600 hover:underline">
              Share it in your cohort feed.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
