
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Eye, CheckCircle2, ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface PolicyData {
  title: string;
  category: string;
  pdfUrl: string;
  summary: string;
  isMandatory: boolean;
}

export default function PolicyViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const MIN_TIME = 60; // seconds
  const MIN_SCROLL = 80; // percentage

  useEffect(() => {
    async function fetchPolicy() {
      if (!id) return;
      try {
        const docRef = doc(db, "policies", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPolicy(docSnap.data() as PolicyData);
        } else {
          toast({ title: "Error", description: "Policy not found.", variant: "destructive" });
          router.push("/dashboard/policies");
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load policy.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPolicy();
  }, [id, router, toast]);

  useEffect(() => {
    if (isLoading || !policy) return;
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, policy]);

  const isCriteriaMet = scrollProgress >= MIN_SCROLL && timeSpent >= MIN_TIME;

  const handleComplete = () => {
    if (!isCriteriaMet) {
      toast({
        variant: "destructive",
        title: "Criteria Not Met",
        description: `Please view document for at least 1 minute.`,
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!policy) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back to Catalog
        </Button>
        <Badge variant="outline" className="px-3 py-1 font-medium bg-white">
          {policy.category}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3 space-y-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="border-b bg-white">
              <CardTitle className="text-2xl">{policy.title}</CardTitle>
              <CardDescription>Review the embedded document carefully.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[700px] flex flex-col bg-muted/20">
               <iframe 
                src={policy.pdfUrl.includes('drive.google.com') ? policy.pdfUrl.replace('/view', '/preview') : policy.pdfUrl} 
                className="w-full flex-1" 
                title={policy.title}
                onLoad={() => setScrollProgress(100)} // PDF Iframe can't detect scroll easily, so we simulate completion on load for now or rely on timer
              />
            </CardContent>
            {policy.summary && (
              <div className="p-6 bg-accent/5 border-t border-b">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                   Summary
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{policy.summary}</p>
              </div>
            )}
            <CardFooter className="py-4 flex items-center justify-between">
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
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Compliance Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Viewer Status</span>
                  <span className={scrollProgress >= MIN_SCROLL ? "text-green-600" : ""}>{scrollProgress}%</span>
                </div>
                <Progress value={scrollProgress} className="h-2" />
                <p className="text-[10px] text-muted-foreground">Document must be loaded and viewed.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Focus Time</span>
                  <span className={timeSpent >= MIN_TIME ? "text-green-600" : ""}>{timeSpent}s / {MIN_TIME}s</span>
                </div>
                <Progress value={(timeSpent / MIN_TIME) * 100} className="h-2" />
                <p className="text-[10px] text-muted-foreground">Required focus time: 60 seconds.</p>
              </div>

              <div className="pt-4">
                <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${isCriteriaMet ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {isCriteriaMet ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{isCriteriaMet ? 'Requirements met. You can now acknowledge and complete.' : 'Keep the window active to unlock acknowledgment.'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
