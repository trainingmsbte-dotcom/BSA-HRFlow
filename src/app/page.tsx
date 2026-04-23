import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">BSA</div>
          <span className="font-bold text-xl tracking-tighter text-primary">BSA HRFlow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Smart Employee Induction for <span className="text-primary">Modern Teams</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Automate policy acknowledgments, track engagement, and ensure compliance with our AI-powered HR portal.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="px-8">
                  <Link href="/login">Access Portal <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Policy Tracking</h3>
                <p className="text-muted-foreground">Detailed engagement metrics with scroll tracking and read-time verification.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-3 rounded-full bg-accent/10">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">AI Summarization</h3>
                <p className="text-muted-foreground">Instantly generate summaries and quiz questions from complex policy documents.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-3 rounded-full bg-secondary">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Team Oversight</h3>
                <p className="text-muted-foreground">Comprehensive dashboards for admins to monitor compliance across departments.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 BSA HRFlow Inc. All rights reserved.</p>
        <nav className="sm:flex-1 flex justify-center gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">Terms of Service</Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">Privacy</Link>
        </nav>
        <div className="text-xs font-medium text-muted-foreground/80">
          Developed by AD
        </div>
      </footer>
    </div>
  );
}
