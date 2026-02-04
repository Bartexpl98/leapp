import TopicsComponent from "@/app/components/TopicsComponent"

export default function exploreLayout({ children }: { children: React.ReactNode }){
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-900 text-zinc-100">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 grid grid-cols-12 gap-6">
      
          <main className="col-span-12 md:col-span-10">
            {children}
          </main>
        </div>
      </div>
)

}