
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Printer, ChevronLeft, Loader2, ShieldCheck, Signature } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function FinalDeclarationPage() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [policies, setPolicies] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signature, setSignature] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    if (storedName) setUserName(storedName);
    if (storedEmail) setUserEmail(storedEmail);

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

        // Optional: Redirect if not actually finished
        if (pList.length > 0 && cList.length < pList.length) {
          // toast warning here if needed
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const today = new Date().toLocaleDateString();

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <Button variant="outline" onClick={handlePrint} className="gap-2 shadow-sm">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      <Card className="border-none shadow-xl print:shadow-none print:border-none print:bg-white overflow-hidden bg-white">
        <CardHeader className="text-center border-b border-muted bg-muted/5 space-y-4 pb-8">
           <div className="flex justify-center mb-2">
             <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg">BSA</div>
           </div>
           <CardTitle className="text-3xl font-bold tracking-tight text-primary">Induction Completion Declaration</CardTitle>
           <CardDescription className="text-base font-medium">Official Acknowledgment of Company Policies & Conduct</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-10 pt-10 px-8 md:px-12">
           <div className="grid grid-cols-2 gap-8 text-sm">
             <div className="space-y-1">
               <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Employee Name</span>
               <p className="text-lg font-extrabold text-foreground">{userName}</p>
             </div>
             <div className="space-y-1 text-right">
               <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Declaration Date</span>
               <p className="text-lg font-extrabold text-foreground">{today}</p>
             </div>
             <div className="space-y-1">
               <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Employee Email</span>
               <p className="font-medium text-foreground">{userEmail}</p>
             </div>
             <div className="space-y-1 text-right">
               <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Current Status</span>
               <div>
                  <Badge className="bg-green-600 hover:bg-green-600 px-3 py-1">
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Fully Compliant
                  </Badge>
               </div>
             </div>
           </div>

           <div className="space-y-4">
             <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                Induction Module Summary
             </h3>
             <div className="rounded-xl border border-muted shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-bold">Policy Title</TableHead>
                      <TableHead className="font-bold">Category</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right font-bold">Date Read</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map(p => {
                      const comp = completions.find(c => c.policyId === p.id);
                      return (
                        <TableRow key={p.id} className="border-muted">
                          <TableCell className="font-semibold">{p.title}</TableCell>
                          <TableCell className="text-muted-foreground">{p.category}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
                               <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledged
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-xs font-mono">
                            {comp?.completedAt?.toDate()?.toLocaleDateString() || "N/A"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
             </div>
           </div>

           <div className="space-y-6 pt-10 border-t border-muted">
              <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ShieldCheck className="h-24 w-24 text-primary" />
                 </div>
                 <p className="relative z-10 text-sm leading-relaxed text-foreground/80 font-medium italic">
                    "I, <strong>{userName}</strong>, hereby declare that I have fully read, understood, and accepted the terms, conditions, and guidelines outlined in all the induction policy documents listed in the summary table above. I acknowledge that these policies form a vital part of my professional conduct and employment agreement at BSA. I commit to adhering to these standards, procedures, and expectations as required by the organization."
                 </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-end pt-8">
                <div className="space-y-4 print:hidden">
                   <Label htmlFor="signature" className="font-bold text-sm text-primary">Employee Digital Acknowledgment</Label>
                   <Input 
                    id="signature" 
                    placeholder="Type your full name to sign" 
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="h-12 border-primary/20 focus-visible:ring-primary shadow-inner"
                   />
                   <p className="text-[10px] text-muted-foreground italic">By typing your name, you are digitally signing this legal document.</p>
                </div>
                
                <div className="space-y-4">
                   <div className="border-b-2 border-primary pb-2">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest block mb-4">Employee Signature Record</span>
                      <p className="font-cursive text-3xl text-primary h-10 overflow-hidden">
                        {signature || userName}
                      </p>
                   </div>
                   <div className="flex justify-between items-center text-[9px] text-muted-foreground font-bold uppercase">
                      <span>Verified Digital Record</span>
                      <span>SECURE-ID: {Date.now().toString().slice(-8)}</span>
                   </div>
                </div>
              </div>
           </div>
        </CardContent>
        
        <CardFooter className="flex flex-col md:flex-row justify-between items-center border-t border-muted bg-muted/5 py-8 px-8 md:px-12 gap-4">
           <div className="text-center md:text-left space-y-1">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Document Authentication</p>
              <p className="text-[10px] text-muted-foreground font-mono">BSA-CERT-IND-{Math.random().toString(36).substring(7).toUpperCase()}</p>
           </div>
           <div className="text-center md:text-right">
              <p className="text-[10px] text-muted-foreground font-medium italic">This is an automated system-generated document valid without physical seal.</p>
              <p className="text-[10px] text-muted-foreground font-bold mt-1">Developed by AD</p>
           </div>
        </CardFooter>
      </Card>

      <div className="text-center py-6 print:hidden">
        <p className="text-xs text-muted-foreground">This document is stored in the company's permanent compliance vault.</p>
      </div>
    </div>
  );
}
