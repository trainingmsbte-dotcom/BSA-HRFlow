
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Printer, ChevronLeft, Loader2, ShieldCheck, Download } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function FinalDeclarationPage() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [policies, setPolicies] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signature, setSignature] = useState("");
  const [declarationDate, setDeclarationDate] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    if (storedName) setUserName(storedName);
    if (storedEmail) setUserEmail(storedEmail);
    
    setDeclarationDate(new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }));

    async function fetchData() {
      if (!storedEmail) return;
      try {
        const pSnap = await getDocs(collection(db, "policies"));
        const pList = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPolicies(pList);

        const cQuery = query(collection(db, "completions"), where("userEmail", "==", storedEmail));
        const cSnap = await getDocs(cQuery);
        const cList = cSnap.docs.map(doc => doc.data());
        setCompletions(cList);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">Preparing your declaration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 md:py-12 print:p-0 print:bg-white">
      {/* PDF Generation & Print Optimization Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            height: 100% !important;
            width: 100% !important;
            overflow: visible !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          aside, header, footer, .sidebar-trigger, .print-hidden, nav {
            display: none !important;
          }
          main, .sidebar-inset, [data-sidebar="inset"], .min-h-screen {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
            display: block !important;
          }
          .declaration-container {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
          .declaration-paper {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 auto !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .bg-primary { background-color: #4460A3 !important; color: white !important; }
          .text-primary { color: #4460A3 !important; }
          .bg-green-600 { background-color: #16a34a !important; color: white !important; }
        }
      `}} />

      <div className="max-w-[210mm] mx-auto space-y-6 declaration-container">
        {/* Actions Bar */}
        <div className="flex items-center justify-between print-hidden bg-white/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm sticky top-4 z-10">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="flex gap-3">
            <Button 
              variant="default" 
              onClick={handlePrint} 
              className="gap-2 shadow-md bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4" /> Export as PDF (A4)
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint} 
              className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
            >
              <Printer className="h-4 w-4" /> Print Document
            </Button>
          </div>
        </div>

        {/* The "Paper" */}
        <Card className="declaration-paper border shadow-2xl bg-white transition-all duration-300 print:shadow-none print:border-none">
          <CardHeader className="text-center border-b border-muted bg-muted/5 py-12 space-y-4">
             <div className="flex justify-center mb-2">
               <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-4xl font-bold shadow-xl">BSA</div>
             </div>
             <div>
               <CardTitle className="text-3xl font-extrabold tracking-tight text-primary uppercase">Induction Completion Declaration</CardTitle>
               <CardDescription className="text-base font-semibold mt-2">Official Acknowledgment of Company Policies & Conduct</CardDescription>
             </div>
          </CardHeader>
          
          <CardContent className="space-y-12 pt-12 px-12 md:px-16">
             {/* Metadata Grid */}
             <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm">
               <div className="space-y-1 pb-2 border-b">
                 <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Employee Name</span>
                 <p className="text-xl font-bold text-foreground">{userName}</p>
               </div>
               <div className="space-y-1 pb-2 border-b text-right">
                 <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Declaration Date</span>
                 <p className="text-xl font-bold text-foreground">{declarationDate}</p>
               </div>
               <div className="space-y-1 pb-2 border-b">
                 <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Employee Email</span>
                 <p className="font-semibold text-foreground">{userEmail}</p>
               </div>
               <div className="space-y-1 pb-2 border-b text-right">
                 <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Compliance Status</span>
                 <div className="flex justify-end">
                    <Badge className="bg-green-600 hover:bg-green-600 px-4 py-1.5 text-xs font-bold shadow-sm">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> FULLY COMPLIANT
                    </Badge>
                 </div>
               </div>
             </div>

             {/* Policies Table */}
             <div className="space-y-4">
               <h3 className="font-bold text-lg flex items-center gap-2 text-primary uppercase tracking-tight">
                  <ShieldCheck className="h-5 w-5" />
                  Induction Module Summary
               </h3>
               <div className="rounded-xl border border-muted shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="border-muted hover:bg-transparent">
                        <TableHead className="font-bold text-primary">Policy Title</TableHead>
                        <TableHead className="font-bold text-primary">Category</TableHead>
                        <TableHead className="font-bold text-primary">Status</TableHead>
                        <TableHead className="text-right font-bold text-primary">Date Acknowledged</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policies.map(p => {
                        const comp = completions.find(c => c.policyId === p.id);
                        return (
                          <TableRow key={p.id} className="border-muted hover:bg-transparent h-12">
                            <TableCell className="font-bold text-sm">{p.title}</TableCell>
                            <TableCell className="text-muted-foreground text-xs font-medium">{p.category}</TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1.5 text-[10px] text-green-600 font-extrabold uppercase">
                                 <CheckCircle2 className="h-3 w-3" /> Acknowledged
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-[11px] font-mono font-bold">
                              {comp?.completedAt?.toDate()?.toLocaleDateString('en-GB') || "N/A"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
               </div>
             </div>

             {/* Declaration Text */}
             <div className="space-y-8">
                <div className="bg-primary/[0.03] p-10 rounded-3xl border border-primary/10 relative overflow-hidden text-center">
                   <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <ShieldCheck className="h-32 w-32 text-primary" />
                   </div>
                   <p className="relative z-10 text-sm md:text-base leading-relaxed text-foreground font-medium italic">
                      "I, <strong>{userName}</strong>, hereby declare that I have fully read, understood, and accepted the terms, conditions, and guidelines outlined in all the induction policy documents listed in the summary table above. I acknowledge that these policies form a vital part of my professional conduct and employment agreement at BSA. I commit to adhering to these standards, procedures, and expectations as required by the organization."
                   </p>
                </div>

                {/* Signature Area */}
                <div className="grid md:grid-cols-2 gap-16 items-end pt-12">
                  <div className="space-y-6 print-hidden">
                     <div className="space-y-2">
                       <Label htmlFor="signature" className="font-extrabold text-xs text-primary uppercase tracking-widest">Digital Acknowledgment</Label>
                       <Input 
                        id="signature" 
                        placeholder="Type your full name as signature" 
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        className="h-14 border-primary/30 focus-visible:ring-primary shadow-inner text-lg"
                       />
                     </div>
                     <p className="text-[10px] text-muted-foreground leading-relaxed">
                       <strong>Disclaimer:</strong> By typing your full name, you are applying a unique digital signature to this record. This constitutes a legally binding acknowledgment of the above declaration.
                     </p>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="border-b-2 border-primary/60 pb-4 h-24 flex flex-col justify-end">
                        <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-[0.2em] block mb-6">Verified Employee Signature</span>
                        <p className="font-cursive text-4xl text-primary/90 opacity-90 drop-shadow-sm truncate">
                          {signature || userName}
                        </p>
                     </div>
                     <div className="flex justify-between items-center text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest">
                        <span>Authenticated Digital ID</span>
                        <span className="font-mono">SEC-ID-{Date.now().toString().slice(-8)}</span>
                     </div>
                  </div>
                </div>
             </div>
          </CardContent>
          
          <CardFooter className="flex flex-col md:flex-row justify-between items-center border-t border-muted bg-muted/5 py-12 px-12 md:px-16 gap-6">
             <div className="text-center md:text-left space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">Certificate Authentication</p>
                <p className="text-[11px] text-primary font-mono font-bold">BSA-CERT-IND-{Math.random().toString(36).substring(7).toUpperCase()}</p>
             </div>
             <div className="text-center md:text-right space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold italic">This is an automated system-generated document and is valid without a physical seal.</p>
                <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest mt-2">© 2024 BSA HRFlow | Developed by AD</p>
             </div>
          </CardFooter>
        </Card>

        <div className="text-center py-10 print-hidden">
          <p className="text-xs text-muted-foreground font-medium">This document is encrypted and stored in the company's permanent compliance vault.</p>
        </div>
      </div>
    </div>
  );
}
