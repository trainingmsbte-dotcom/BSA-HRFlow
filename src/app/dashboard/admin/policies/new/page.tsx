
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Save, FileText, ChevronLeft, Loader2, ExternalLink, FileType, Plus } from "lucide-react";
import { adminPolicySummarization } from "@/ai/flows/admin-policy-summarization";
import { generateQuizQuestions } from "@/ai/flows/admin-quiz-question-generation";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

function PolicyEditor() {
  const searchParams = useSearchParams();
  const policyId = searchParams.get("id");
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isMandatory, setIsMandatory] = useState(true);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (policyId) {
      loadPolicy(policyId);
    }
  }, [policyId]);

  const loadPolicy = async (id: string) => {
    setIsLoading(true);
    try {
      const docRef = doc(db, "policies", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title || "");
        setCategory(data.category || "");
        setPdfUrl(data.pdfUrl || "");
        setIsMandatory(data.isMandatory ?? true);
        setSummary(data.summary || "");
        setQuizQuestions(data.quizQuestions || []);
      } else {
        toast({ title: "Not Found", description: "Policy document not found.", variant: "destructive" });
        router.push("/dashboard/admin/policies");
      }
    } catch (error: any) {
      toast({ title: "Load Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!pdfUrl) return toast({ title: "Error", description: "Please add a PDF URL first.", variant: "destructive" });
    setIsSummarizing(true);
    try {
      const result = await adminPolicySummarization({ policyContent: `Analyzing PDF at: ${pdfUrl}` });
      setSummary(result.summary);
      toast({ title: "Summary Generated", description: "AI has successfully summarized the linked PDF." });
    } catch (error) {
      toast({ title: "AI Error", description: "Failed to generate summary.", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!pdfUrl) return toast({ title: "Error", description: "Please add a PDF URL first.", variant: "destructive" });
    setIsGeneratingQuiz(true);
    try {
      const result = await generateQuizQuestions({ policyContent: `Generating quiz for PDF at: ${pdfUrl}`, numberOfQuestions: 3 });
      setQuizQuestions(result.questions);
      toast({ title: "Quiz Generated", description: "3 AI-powered questions added to policy." });
    } catch (error) {
      toast({ title: "AI Error", description: "Failed to generate quiz questions.", variant: "destructive" });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSave = async () => {
    const finalCategory = isCustomCategory ? customCategory : category;
    
    if (!title || !pdfUrl || !finalCategory) {
      return toast({ title: "Required Fields", description: "Please provide a title, category and PDF link.", variant: "destructive" });
    }

    setIsSaving(true);
    try {
      const policyData = {
        title,
        category: finalCategory,
        pdfUrl,
        isMandatory,
        summary,
        quizQuestions,
        lastUpdated: serverTimestamp(),
        description: summary || `Compliance document for ${finalCategory}`,
        version: "1.0.0"
      };

      if (policyId) {
        await updateDoc(doc(db, "policies", policyId), policyData);
        toast({ title: "Policy Updated", description: "Changes saved and published." });
      } else {
        await addDoc(collection(db, "policies"), {
          ...policyData,
          completionRate: 0,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Success", description: "Policy saved and published to Firestore." });
      }

      router.push("/dashboard/admin/policies");
    } catch (error: any) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const onCategoryChange = (value: string) => {
    if (value === "custom") {
      setIsCustomCategory(true);
      setCategory("");
    } else {
      setIsCustomCategory(false);
      setCategory(value);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft className="h-5 w-5" /></Button>
        <h1 className="text-3xl font-bold tracking-tight">{policyId ? "Edit Policy" : "Create New Policy"}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Policy Source</CardTitle>
              <CardDescription>Link an external PDF document to be used for this induction module.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Policy Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Remote Work Guidelines" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <div className="space-y-2">
                    <Select value={isCustomCategory ? "custom" : category} onValueChange={onCategoryChange}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT Security">IT & Security</SelectItem>
                        <SelectItem value="HR">HR & Conduct</SelectItem>
                        <SelectItem value="Safety">Health & Safety</SelectItem>
                        <SelectItem value="Legal">Legal Compliance</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="custom" className="text-primary font-medium">
                          <Plus className="mr-2 h-4 w-4 inline-block" /> Add Custom Category...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {isCustomCategory && (
                      <Input 
                        placeholder="Enter custom category name" 
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="animate-in slide-in-from-top-1 duration-200"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfUrl">PDF Document URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FileType className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="pdfUrl" 
                      className="pl-10"
                      value={pdfUrl} 
                      onChange={(e) => setPdfUrl(e.target.value)} 
                      placeholder="https://example.com/policy-document.pdf"
                    />
                  </div>
                  {pdfUrl && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {pdfUrl && (
                <div className="mt-4 rounded-lg overflow-hidden border bg-muted/10 h-[600px] flex flex-col">
                  <div className="bg-white p-2 border-b flex justify-between items-center px-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Preview</span>
                    <Badge variant="secondary" className="text-[10px]">PDF Viewer</Badge>
                  </div>
                  <iframe 
                    src={pdfUrl.includes('drive.google.com') ? pdfUrl.replace('/view', '/preview') : pdfUrl} 
                    className="w-full flex-1" 
                    title="Policy Document Preview"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {summary && (
            <Card className="border-none shadow-sm bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" /> AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{summary}</p>
              </CardContent>
            </Card>
          )}

          {quizQuestions.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Generated Quiz Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quizQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/30">
                    <p className="font-semibold text-sm mb-2">{idx + 1}. {q.question}</p>
                    <ul className="space-y-1">
                      {q.options.map((opt: string, i: number) => (
                        <li key={i} className={`text-xs ${i === q.correctAnswerIndex ? 'text-green-600 font-bold' : ''}`}>
                          • {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="mandatory">Mandatory Policy</Label>
                <Switch id="mandatory" checked={isMandatory} onCheckedChange={setIsMandatory} />
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input value="1.0.0" disabled className="bg-muted" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>AI Tools</CardTitle>
              <CardDescription>Enhance policy accessibility with AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleSummarize} 
                disabled={isSummarizing || !pdfUrl}
              >
                {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-accent" />}
                Generate AI Summary
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz || !pdfUrl}
              >
                {isGeneratingQuiz ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4 text-accent" />}
                Generate Quiz Questions
              </Button>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {policyId ? "Save Changes" : "Save & Publish"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewPolicyPage() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <PolicyEditor />
    </Suspense>
  );
}
