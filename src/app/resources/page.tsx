import {
  BookOpen,
  FileText,
  GraduationCap,
  ShieldCheck,
  Scale,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const resourceSections = [
  {
    title: "Using the platform",
    description:
      "Learn how debates, arguments, evidence, and evaluation work within the platform.",
    icon: <BookOpen className="h-5 w-5 text-violet-400" />,
    resources: [
      {
        title: "How to write a strong argument",
        description:
          "A short guide to making clear claims, giving reasons, and responding directly to opposing points.",
        href: "/resources/how-to-write-a-strong-argument",
      },
      {
        title: "How evidence works",
        description:
          "Understand how to attach sources, quotations, and references to support your claims.",
        href: "/resources/how-evidence-works",
      },
      {
        title: "How argument evaluation works",
        description:
          "Learn what soundness and factuality mean and how they are used to assess arguments.",
        href: "/resources/how-argument-evaluation-works",
      },
    ],
  },
  {
    title: "Critical thinking",
    description:
      "Resources to help users think more carefully about claims, reasoning, and debate quality.",
    icon: <Scale className="h-5 w-5 text-violet-400" />,
    resources: [
      {
        title: "Common reasoning mistakes",
        description:
          "An overview of weak reasoning patterns, unsupported assertions, and common logical errors.",
        href: "/resources/common-reasoning-mistakes",
      },
      {
        title: "How to disagree constructively",
        description:
          "Tips for engaging in disagreement without losing clarity, respect, or focus.",
        href: "/resources/how-to-disagree-constructively",
      },
      {
        title: "How to compare competing claims",
        description:
          "A guide to weighing evidence, identifying assumptions, and comparing arguments fairly.",
        href: "/resources/how-to-compare-competing-claims",
      },
    ],
  },
  {
    title: "Source evaluation",
    description:
      "Learn how to judge whether a source is credible, relevant, and worth relying on.",
    icon: <ShieldCheck className="h-5 w-5 text-violet-400" />,
    resources: [
      {
        title: "How to evaluate a source",
        description:
          "Questions to ask about authorship, evidence, bias, expertise, and reliability.",
        href: "/resources/how-to-evaluate-a-source",
      },
      {
        title: "Primary vs secondary sources",
        description:
          "A simple explanation of different source types and when each may be appropriate.",
        href: "/resources/primary-vs-secondary-sources",
      },
      {
        title: "Spotting misleading or weak evidence",
        description:
          "Examples of cherry-picking, decontextualised quotations, and other misleading practices.",
        href: "/resources/spotting-misleading-or-weak-evidence",
      },
    ],
  },
];

const quickLinks = [
  {
    title: "Evidence guidelines",
    description: "What counts as acceptable supporting evidence on the platform.",
    href: "/guidelines/evidence",
    icon: <FileText className="h-5 w-5 text-violet-400" />,
  },
  {
    title: "Debate guidelines",
    description: "Rules and expectations for participating in structured discussions.",
    href: "/guidelines/debate",
    icon: <GraduationCap className="h-5 w-5 text-violet-400" />,
  },
  {
    title: "Source checking checklist",
    description: "A quick checklist for assessing whether a source is trustworthy.",
    href: "/resources/source-checking-checklist",
    icon: <Search className="h-5 w-5 text-violet-400" />,
  },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Hero */}
      <section className="border-b border-zinc-800 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
            Resources
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Tools for better evidence-based discussion
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            This page brings together guides and reference material to help users
            participate in more thoughtful, structured, and evidence-based debates.
          </p>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
            Whether you are learning how to support a claim, evaluate a source, or
            respond to disagreement more constructively, these resources are meant to
            make discussion clearer and more useful.
          </p>
        </div>
      </section>

      {/* Quick links */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Quick links
            </h2>
            <p className="mt-4 text-zinc-300 leading-7">
              Start here for platform-specific guidance and essential reference material.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="group rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6 transition hover:border-violet-500/40 hover:bg-zinc-800"
              >
                <div className="mb-4 inline-flex rounded-lg bg-zinc-900 p-2">
                  {link.icon}
                </div>
                <h3 className="text-lg font-semibold group-hover:text-violet-300">
                  {link.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main sections */}
      <section className="bg-zinc-800 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          {resourceSections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-zinc-700 bg-zinc-900/60 p-8"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-zinc-800 p-3">{section.icon}</div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {section.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-zinc-300 leading-7">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {section.resources.map((resource) => (
                  <Link
                    key={resource.title}
                    href={resource.href}
                    className="group rounded-2xl border border-zinc-800 bg-zinc-800/60 p-6 transition hover:border-violet-500/40 hover:bg-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold group-hover:text-violet-300">
                        {resource.title}
                      </h3>
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 group-hover:text-violet-300" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {resource.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-zinc-800 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Why these resources matter
          </h2>
          <p className="mt-6 text-zinc-300 leading-7">
            Better online discourse is not just about giving people a place to speak.
            It is also about helping them reason more clearly, evaluate claims more
            carefully, and engage with evidence more seriously.
          </p>
          <p className="mt-4 text-zinc-300 leading-7">
            These resources are intended to support that goal by giving users practical
            tools for participating in discussions that are more informed, transparent,
            and constructive.
          </p>
        </div>
      </section>
    </main>
  );
}