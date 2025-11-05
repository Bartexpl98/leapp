import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import mongoose from "mongoose";
import Topic from "../models/topic";
const { dbConnect } = await import("../lib/mongoose");



async function seedTopics() {
    await dbConnect();    
    const topics = [
        { name: "Technology", slug: "technology" },
        { name: "Science", slug: "science" },
        { name: "Politics", slug: "politics" },
        { name: "Environment", slug: "environment" },
        { name: "Education", slug: "education" },
        { name: "Health", slug: "health" },
        { name: "Ethics", slug: "ethics" },
        { name: "Economy", slug: "economy" },
        { name: "Media", slug: "media" },
    ];  
    for (const t of topics) {
        const existing = await Topic.findOne({ slug: t.slug });
        if (!existing) {
            await Topic.create(t);
            console.log(`Added topic: ${t.name}`);
        } else {
            console.log(`Skipped existing topic: ${t.name}`);
        }
    }   
    await mongoose.disconnect();
    console.log("Topic seeding complete!");
}

seedTopics().catch((err) => {
    console.error("Seeding failed:", err);
    mongoose.disconnect();
});
