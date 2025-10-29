// app/debate/layout.tsx
import type { Metadata } from "next";
import TopicsComponent from "@/app/components/TopicsComponent"

export const metadata: Metadata = {
  title: "Debate | Discourse",
  description: "Structured debates with arguments, evidence, and rebuttals.",
};

export default function DebateLayout({ children }: { children: React.ReactNode }) {
  // If you want to fetch dynamic topics here, you can make this an async component
  // and load from DB. For now, a small static list:
  const topics = ["All Topics", "Tech & Society", "Education", "Health", "Policy"];

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-900 text-zinc-100">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 grid grid-cols-12 gap-6">
         <TopicsComponent topics={topics}/>

          <main className="col-span-12 md:col-span-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
