import { notFound } from "next/navigation";
import { dbConnect } from "@/app/lib/mongoose";
import Debate from "@/app/models/debate";
import NewArgumentForm from "./NewArgumentForm";

export const dynamic = "force-dynamic";

export default async function NewArgumentPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = params;

  const sideParam =
    typeof searchParams?.side === "string"
      ? searchParams.side.toLowerCase()
      : "";

  await dbConnect();

  const d = await Debate.findOne({ slug })
    .select({ question: 1, slug: 1 })
    .lean<{ question: string; slug: string } | null>();

  if (!d) return notFound();

  const initialSide: "affirmative" | "opposing" =
    sideParam === "opposing" ? "opposing" : "affirmative";

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Add a new argument</h1>
      <p className="mb-6 text-zinc-300">Debate: {d.question}</p>

      {/* Pass only primitives to the client */}
      <NewArgumentForm slug={d.slug} initialSide={initialSide} />
    </main>
  );
}
