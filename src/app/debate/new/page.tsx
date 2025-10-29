import { dbConnect } from "@/app/lib/mongoose";
import Topic from "@/app/models/topic";
import NewDebateForm from "./NewDebateForm";

export default async function NewDebatePage() {

    await dbConnect();
    //const topics = await Topic.find({}).select({ name: 1, slug: 1 }).sort({ name: 1 }).lean<{ name: string; slug: string }[]>();
    const topics = ["Tech & Society", "Education", "Health", "Policy"];
    
    return (
        <main className="max-w-2xl mx-auto p-8">
          <h1 className="text-2xl font-semibold mb-6">Create a New Debate</h1>
          <NewDebateForm topics={topics} />
        </main>
  );
}
