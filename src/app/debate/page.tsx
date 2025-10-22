// app/debate/page.tsx
import Link from "next/link";
import { lusitana } from "@/app/components/ui/fonts";
import ArgumentCard, {Post} from "../components/ui/ArgumentCard";


export default function DebatePage() {
  const basePath = "/debate"; // change later to /debates/[id]

  // Debate question (header bar content)
  const question =
    "Should social media platforms be legally required to verify all users’ identities?";

  // Placeholder posts for each side (replace with real data)
  const affirmatives: Post[] = [
    {
      id: "a1",
      title: "Verification reduces coordinated harassment",
      summary:
        "Linking accounts to real identities raises accountability and can deter brigading and mass harassment campaigns.",
      author: "Alex",
      createdAt: "2025-09-10T10:00:00Z",
    },
    {
      id: "a2",
      title: "Traceability improves content moderation",
      summary:
        "With verified identities, abusive networks are easier to map and remove, reducing recidivism across platforms.",
      author: "Jordan",
      createdAt: "2025-09-13T14:20:00Z",
    },
  ];

  const opposing: Post[] = [
    {
      id: "o1",
      title: "Chilling effect on vulnerable speakers",
      summary:
        "Real-name constraints deter whistleblowers and at-risk groups from participating safely in public discourse.",
      author: "Taylor",
      createdAt: "2025-09-11T09:30:00Z",
    },
    {
      id: "o2",
      title: "Security & breach risks",
      summary:
        "Centralizing identity data increases the blast radius of leaks; verification can create new failure modes.",
      author: "Sam",
      createdAt: "2025-09-14T18:05:00Z",
    },
  ];

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-900 text-zinc-100">
      {/* Debate Question bar */}
      <section className="border-b border-white/10 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-5">
          <h1 className={`${lusitana.className} text-xl md:text-2xl text-white`}>
            {question}
          </h1>
        </div>
      </section>

      {/* Two-column layout */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 grid grid-cols-12 gap-6">
        {/* Affirmative (Left) */}
        <section className="col-span-12 md:col-span-6 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Affirmative</h2>
            <Link
              href={`${basePath}/affirmative`}
              className="text-sm text-violet-300 hover:underline"
            >
              View all
            </Link>
          </header>

          {affirmatives.map((p) => (
            <ArgumentCard
              key={p.id}
              post={p}
              openHref={`${basePath}/argument/${p.id}?side=affirmative`}
              evidenceHref={`${basePath}/evidence/${p.id}?side=affirmative`}
              rebuttalsHref={`${basePath}/rebuttals/${p.id}?side=affirmative`}
            />
          ))}
        </section>

        {/* Opposing (Right) */}
        <section className="col-span-12 md:col-span-6 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Opposing</h2>
            <Link
              href={`${basePath}/opposing`}
              className="text-sm text-violet-300 hover:underline"
            >
              View all
            </Link>
          </header>

          {opposing.map((p) => (
            <ArgumentCard
              key={p.id}
              post={p}
              openHref={`${basePath}/argument/${p.id}?side=opposing`}
              evidenceHref={`${basePath}/evidence/${p.id}?side=opposing`}
              rebuttalsHref={`${basePath}/rebuttals/${p.id}?side=opposing`}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
