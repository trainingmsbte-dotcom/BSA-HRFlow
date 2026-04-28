"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Printer, ChevronLeft, Loader2, ShieldCheck, Download, FileText } from "lucide-react";
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
    <div className="min-h-screen bg-muted/30 py-4 px-4 md:py-8 print:p-0 print:bg-white">
      {/* Black & White One-Page Print Optimization */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color: black !important;
            background: transparent !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          html, body {
            height: 100% !important;
            width: 100% !important;
            overflow: visible !important;
            background: white !important;
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
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .border {
            border: 1px solid black !important;
          }
          .border-b {
            border-bottom: 1px solid black !important;
          }
          .border-t {
            border-top: 1px solid black !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid black !important;
            padding: 4px 8px !important;
            font-size: 10px !important;
          }
          h1, h2, h3, p, span {
            color: black !important;
          }
          .badge-print {
            border: 1px solid black !important;
            padding: 2px 4px !important;
            font-size: 8px !important;
            border-radius: 2px !important;
          }
          .declaration-text {
            font-size: 11px !important;
            line-height: 1.4 !important;
            margin-top: 10px !important;
          }
          .signature-box {
            border-bottom: 1px solid black !important;
            min-height: 40px !important;
          }
        }
      `}} />

      <div className="max-w-[210mm] mx-auto space-y-4 declaration-container">
        {/* Actions Bar */}
        <div className="flex items-center justify-between print-hidden bg-white/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              onClick={handlePrint} 
              className="gap-2 bg-black text-white hover:bg-black/90"
            >
              <Download className="h-4 w-4" /> Export B&W PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint} 
              className="gap-2"
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </div>

        {/* B&W Simple Declaration Document */}
        <Card className="declaration-paper border border-black shadow-lg bg-white print:border-none print:shadow-none">
          <CardHeader className="text-center py-6 border-b border-black">
             <div className="flex justify-center mb-2">
               <div className="w-16 h-16 border-2 border-black flex items-center justify-center text-black text-2xl font-bold">BSA</div>
             </div>
             <div>
               <h1 className="text-2xl font-bold uppercase">Induction Completion Declaration</h1>
               <p className="text-sm font-semibold">Official HR Onboarding Record</p>
             </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6 px-8 md:px-12">
             {/* Info Table */}
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div className="space-y-1">
                 <span className="text-[10px] font-bold uppercase">Employee Name</span>
                 <p className="font-bold border-b border-black pb-1">{userName}</p>
               </div>
               <div className="space-y-1 text-right">
                 <span className="text-[10px] font-bold uppercase">Date</span>
                 <p className="font-bold border-b border-black pb-1">{declarationDate}</p>
               </div>
               <div className="space-y-1">
                 <span className="text-[10px] font-bold uppercase">Email</span>
                 <p className="border-b border-black pb-1">{userEmail}</p>
               </div>
               <div className="space-y-1 text-right">
                 <span className="text-[10px] font-bold uppercase">Status</span>
                 <p className="font-bold border-b border-black pb-1 uppercase">COMPLIANT</p>
               </div>
             </div>

             {/* Policies Table */}
             <div className="space-y-2">
               <h3 className="font-bold text-xs uppercase tracking-tight">Policies Acknowledged</h3>
               <div className="border border-black">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-b border-black bg-muted/10">
                        <TableHead className="font-bold text-black text-[10px]">Policy Title</TableHead>
                        <TableHead className="font-bold text-black text-[10px]">Category</TableHead>
                        <TableHead className="text-right font-bold text-black text-[10px]">Date Acknowledged</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policies.map(p => {
                        const comp = completions.find(c => c.policyId === p.id);
                        return (
                          <TableRow key={p.id} className="border-b border-black last:border-0 h-8">
                            <TableCell className="text-[10px]">{p.title}</TableCell>
                            <TableCell className="text-[10px]">{p.category}</TableCell>
                            <TableCell className="text-right text-[10px] font-mono">
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
             <div className="space-y-6">
                <div className="border border-black p-4 text-xs italic leading-relaxed declaration-text">
                   "I, <strong>{userName}</strong>, hereby declare that I have fully read, understood, and accepted the terms and guidelines outlined in all the induction policy documents listed above. I acknowledge that these policies form part of my professional conduct at BSA. I commit to adhering to these standards as required by the organization."
                </div>

                {/* Signature Area */}
                <div className="grid grid-cols-2 gap-10 items-end pt-4">
                  <div className="space-y-2 print-hidden">
                     <Label htmlFor="signature" className="font-bold text-[10px] uppercase">Digital Signature</Label>
                     <Input 
                      id="signature" 
                      placeholder="Type name here" 
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="border-black h-8 text-sm"
                     />
                  </div>
                  
                  <div className="space-y-4">
                     <div className="border-b border-black pb-2 h-12 flex items-end">
                        <p className="font-cursive text-2xl text-black">
                          {signature || userName}
                        </p>
                     </div>
                     <div className="flex justify-between items-center text-[8px] uppercase">
                        <span>Employee Signature</span>
                        <span className="font-mono">ID: {Date.now().toString().slice(-6)}</span>
                     </div>
                  </div>
                </div>
             </div>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center border-t border-black py-4 px-8 md:px-12 text-[8px] uppercase">
             <div>
                <p className="font-bold">BSA-CERT-IND-{Math.random().toString(36).substring(7).toUpperCase()}</p>
             </div>
             <div className="text-right">
                <p>© 2024 BSA HRFLOW | INTERNAL RECORD</p>
             </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
