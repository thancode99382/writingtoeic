import NextLink from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, Card, CardContent, CardFooter, CardHeader, Chip, Separator } from "@heroui/react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-24 pb-32 flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl px-6">
          <Chip className="mb-8 bg-secondary/20 text-secondary">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              TOEIC Writing Master
            </div>
          </Chip>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400">
              Elevate Your Score
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-default-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Practice TOEIC Writing with instant AI-powered grading. Get detailed feedback, error analysis, and master the exam.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <NextLink
              href={tests.length > 0 ? `/test/${tests[0].id}` : "#tests"}
              className="inline-flex items-center justify-center font-semibold px-8 py-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
            >
              Start Practicing
            </NextLink>
            <NextLink
              href="#tests"
              className="inline-flex items-center justify-center font-semibold px-8 py-3 rounded-xl border-2 border-white/20 bg-transparent text-white hover:bg-white/10 transition-all"
            >
              View All Tests
            </NextLink>
          </div>
        </div>
      </section>

      {/* Tests Section */}
      <section id="tests" className="max-w-7xl mx-auto w-full px-6 pb-24 z-10">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Available Mock Tests</h2>
            <p className="text-default-500">Select a test below to start your practice session.</p>
          </div>
          <div className="flex items-center gap-4">
            <Chip className="bg-primary/20 text-primary">
              {tests.length} {tests.length === 1 ? "Test" : "Tests"} Available
            </Chip>
            <NextLink
              href="/test/create"
              className="inline-flex items-center gap-2 justify-center text-sm font-semibold px-4 py-2 rounded-xl bg-secondary text-white hover:bg-secondary/80 transition-all shadow-lg shadow-secondary/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Test
            </NextLink>
          </div>
        </div>

        {tests.length === 0 ? (
          <Card className="w-full p-12 bg-default-50/50 backdrop-blur-md">
            <CardContent className="text-center flex flex-col items-center justify-center gap-4">
               <svg className="w-16 h-16 text-default-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
               </svg>
               <h3 className="text-xl font-semibold text-white">No Tests Found</h3>
               <p className="text-default-500 max-w-md mb-6">Tests haven't been added yet. You can create a new test to get started.</p>
               <NextLink
                 href="/test/create"
                 className="inline-flex items-center gap-2 justify-center text-sm font-semibold px-6 py-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 transition-all"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                 </svg>
                 Create First Test
               </NextLink>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <NextLink key={test.id} href={`/test/${test.id}`} className="block group">
                <Card className="bg-default-50/50 backdrop-blur-md border-1 border-white/10 group-hover:border-primary/50 transition-colors h-full">
                <CardHeader className="flex gap-3 px-6 pt-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start justify-center">
                    <h4 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{test.title}</h4>
                    <div className="flex items-center gap-1.5 text-sm text-default-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {test.duration} min
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 py-4">
                   <div className="flex flex-wrap gap-2 mb-2">
                     <Chip className="bg-secondary/20 text-secondary">Part 1: 5Q</Chip>
                     <Chip className="bg-success/20 text-success">Part 2: 2Q</Chip>
                     <Chip className="bg-warning/20 text-warning">Part 3: 1Q</Chip>
                   </div>
                </CardContent>
                <Separator className="bg-white/10" />
                <CardFooter className="px-6 py-4 flex justify-between items-center">
                  <span className="text-sm text-default-500">8 questions total</span>
                  <span className="inline-flex items-center justify-center text-sm font-medium px-3 py-1.5 rounded-lg bg-primary/20 text-primary">
                    Take Test
                  </span>
                </CardFooter>
              </Card>
              </NextLink>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-auto z-10 backdrop-blur-lg bg-background/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-default-500 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">TOEIC Writing Mock Test</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <Chip className="bg-primary/20 text-primary">Gemini AI</Chip>
          </div>
        </div>
      </footer>
    </div>
  );
}
