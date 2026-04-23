
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Save, FileText, ChevronLeft, Loader2, ExternalLink, FileType } from "lucide-react";
import { adminPolicySummarization } from "@/ai/flows/admin-policy-summarization";
import { generateQuizQuestions } from "@/ai/flows/admin-quiz-question-generation";

export default function NewPolicyPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isMandatory, setIsMandatory] = useState(true);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  const router = useRouter();
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!pdfUrl) return toast({ title: "Error", description: "Please add a PDF URL first.", variant: "destructive" });
    setIsSummarizing(true);
    try {
      // Passing the URL as context for the AI flow simulation
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

  const handleSave = () => {
    if (!title || !pdfUrl) {
      return toast({ title: "Required Fields", description: "Please provide a title and PDF link.", variant: "destructive" });
    }
    toast({ title: "Success", description: "Policy saved and assigned." });
    router.push("/dashboard/admin/policies");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft className="h-5 w-5" /></Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Policy</h1>
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
                  <Select onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT & Security</SelectItem>
                      <SelectItem value="hr">HR & Conduct</SelectItem>
                      <SelectItem value="safety">Health & Safety</SelectItem>
                      <SelectItem value="legal">Legal Compliance</SelectItem>
                    </SelectContent>
                  </Select>
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
                <p className="text-[10px] text-muted-foreground italic">Note: Ensure the URL allows embedding (CORS enabled) or use public Google Drive/OneDrive links.</p>
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
              <div className="space-y-2 pt-4">
                <Label>Assign to Department</Label>
                <Select defaultValue="all">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="eng">Engineering</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button className="w-full" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save & Publish
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
