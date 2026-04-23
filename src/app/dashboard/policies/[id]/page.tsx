
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Eye, CheckCircle2, ChevronLeft, AlertCircle } from "lucide-react";

export default function PolicyViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Mock policy data
  const policy = {
    title: "Remote Work & Digital Security",
    category: "IT Security",
    content: Array(10).fill(`
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    `).join("\n\n"),
    minTimeRequired: 60, // seconds
    minScrollRequired: 80, // percentage
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(Math.min(progress, 100));
  };

  const isCriteriaMet = scrollProgress >= policy.minScrollRequired && timeSpent >= policy.minTimeRequired;

  const handleComplete = () => {
    if (!isCriteriaMet) {
      toast({
        variant: "destructive",
        title: "Criteria Not Met",
        description: `Please read at least 80% and spend 1 minute on this page.`,
      });
      return;
    }
    if (!isAcknowledged) {
      toast({
        variant: "destructive",
        title: "Acknowledgment Required",
        description: "Please confirm you have read and understood the policy.",
      });
      return;
    }

    setIsComplete(true);
    toast({
      title: "Policy Completed",
      description: "Your compliance has been recorded successfully.",
    });
    router.push("/dashboard/employee");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back to List
        </Button>
        <Badge variant="outline" className="px-3 py-1 font-medium bg-white">
          {policy.category}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b bg-white rounded-t-lg sticky top-0 z-10">
              <CardTitle className="text-2xl">{policy.title}</CardTitle>
              <CardDescription>Read the guidelines below carefully to proceed.</CardDescription>
            </CardHeader>
            <CardContent 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="p-8 max-h-[600px] overflow-y-auto prose prose-slate max-w-none scroll-smooth"
            >
              <div className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {policy.content}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="ack" 
                  checked={isAcknowledged} 
                  onCheckedChange={(val) => setIsAcknowledged(!!val)} 
                  disabled={!isCriteriaMet}
                />
                <label htmlFor="ack" className="text-sm font-medium leading-none cursor-pointer">
                  I have read and understood this policy.
                </label>
              </div>
              <Button 
                onClick={handleComplete} 
                className="px-8 shadow-md"
                disabled={!isCriteriaMet || !isAcknowledged}
              >
                Complete Module
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Read Progress</span>
                  <span className={scrollProgress >= 80 ? "text-green-600" : ""}>{Math.round(scrollProgress)}%</span>
                </div>
                <Progress value={scrollProgress} className="h-2" />
                <p className="text-[10px] text-muted-foreground">Must reach 80% scroll depth.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Time Engaged</span>
                  <span className={timeSpent >= 60 ? "text-green-600" : ""}>{timeSpent}s</span>
                </div>
                <Progress value={(timeSpent / 60) * 100} className="h-2" />
                <p className="text-[10px] text-muted-foreground">Required focus time: 60 seconds.</p>
              </div>

              <div className="pt-4 space-y-3">
                <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${isCriteriaMet ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {isCriteriaMet ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{isCriteriaMet ? 'Requirements met. You can now acknowledge and complete the policy.' : 'Keep reading to unlock acknowledgment.'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
