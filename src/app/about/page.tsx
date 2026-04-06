import { CheckCircle2, Scale, ShieldCheck, MessageSquare, FileText, Lightbulb } from "lucide-react";

export default function AboutPage() {
  const principles = [
    {
      icon: <MessageSquare className="h-5 w-5 text-violet-400" />,
      title: "Structured discussion",
      description:
        "Debates are organised around clear topics, explicit positions, and direct replies to specific arguments rather than chaotic comment chains.",
    },
    {
      icon: <FileText className="h-5 w-5 text-violet-400" />,
      title: "Evidence first",
      description:
        "Arguments should be supported with evidence such as sources, quotations, or references so that claims can be examined more critically.",
    },
    {
      icon: <Scale className="h-5 w-5 text-violet-400" />,
      title: "Thoughtful evaluation",
      description:
        "Arguments can be assessed in terms of soundness and factuality, helping stronger reasoning and better-supported claims stand out.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-violet-400" />,
      title: "Transparency",
      description:
        "Users should be able to see not just what people believe, but why they believe it and what evidence they rely on.",
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-violet-400" />,
      title: "Better discourse",
      description:
        "The goal is not just engagement, but a healthier form of online discussion that encourages reflection, clarity, and accountability.",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-violet-400" />,
      title: "Constructive disagreement",
      description:
        "Disagreement is expected, but the platform aims to make it more civil, reasoned, and useful for everyone involved.",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Hero */}
      <section className="border-b border-zinc-800 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
            About
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Building a space for more evidence-based online discourse
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            Online discussions increasingly shape public opinion, political attitudes, and
            everyday understanding of important issues. Yet many existing platforms are
            designed around attention, speed, and engagement rather than truth, clarity, or
            constructive debate.
          </p>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
            This project explores what a different kind of discussion platform could look
            like: one where users are encouraged to make clear arguments, support claims
            with evidence, and engage with one another in a more structured and transparent
            way.
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Why this project exists
            </h2>
            <div className="mt-6 space-y-4 text-zinc-300 leading-7">
              <p>
                Many online platforms make it easy to react, repost, and argue, but much
                harder to slow down, provide evidence, or properly evaluate competing claims.
                Discussions often become fragmented, emotionally charged, and driven by
                visibility rather than quality.
              </p>
              <p>
                As a result, misinformation, weak reasoning, and bad-faith participation can
                spread easily, while thoughtful contributions are often buried or ignored.
                This project was created in response to that problem.
              </p>
              <p>
                Instead of treating discussion as a stream of disconnected comments, the
                platform treats it as a structured debate in which arguments can be examined,
                challenged, and supported more clearly.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-800/60 p-8 shadow-xl shadow-black/10">
            <h3 className="text-xl font-semibold">Core aim</h3>
            <p className="mt-4 text-zinc-300 leading-7">
              The aim of the platform is to encourage reasoned, evidence-based discussion by
              combining debate structure, evidence attachment, and simple forms of argument
              evaluation in a single interface.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
                <p className="font-medium text-zinc-100">Clear debate structure</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Topics, positions, and reply chains help keep discussions organised.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
                <p className="font-medium text-zinc-100">Evidence attached to claims</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Arguments can be backed by sources, quotations, and references.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
                <p className="font-medium text-zinc-100">Evaluation of argument quality</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Users can assess arguments in terms of soundness and factuality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-zinc-800 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Design principles
            </h2>
            <p className="mt-4 text-zinc-300 leading-7">
              The platform is built around a few central principles intended to make online
              disagreement more useful, more transparent, and more grounded in evidence.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6"
              >
                <div className="mb-4 inline-flex rounded-lg bg-zinc-800 p-2">
                  {principle.icon}
                </div>
                <h3 className="text-lg font-semibold">{principle.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How the platform works
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6">
              <p className="text-sm font-medium text-violet-400">01</p>
              <h3 className="mt-3 text-lg font-semibold">Choose a debate</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Users join discussions centred on a specific debate topic rather than a loose,
                fast-moving feed.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6">
              <p className="text-sm font-medium text-violet-400">02</p>
              <h3 className="mt-3 text-lg font-semibold">Make an argument</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Each contribution takes the form of an argument with a clear stance, and can
                respond directly to another argument in the discussion.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6">
              <p className="text-sm font-medium text-violet-400">03</p>
              <h3 className="mt-3 text-lg font-semibold">Support and evaluate</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Users attach evidence to claims and can evaluate arguments based on how sound
                and how factual they appear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-zinc-800 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            A small step toward better online discussion
          </h2>
          <p className="mt-6 text-zinc-300 leading-7">
            This project does not assume that technology alone can solve misinformation,
            polarisation, or poor public discourse. However, platform design does influence
            how people interact, what kinds of contributions are rewarded, and how easy it is
            to participate thoughtfully.
          </p>
          <p className="mt-4 text-zinc-300 leading-7">
            By introducing more structure, more transparency, and a stronger emphasis on
            evidence, this platform aims to explore whether online debate can be made more
            useful than the systems many people currently rely on.
          </p>
        </div>
      </section>
    </main>
  );
}