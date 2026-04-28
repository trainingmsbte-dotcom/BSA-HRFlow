
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Printer, ChevronLeft, Loader2, Download, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function FinalDeclarationPage() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [policies, setPolicies] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [declarationDate, setDeclarationDate] = useState("");
  const [employeeUniqueId, setEmployeeUniqueId] = useState("");
  const [certificateId, setCertificateId] = useState("");
  
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
        // 1. Fetch stable user info to get the persistent Employee ID
        const userQuery = query(collection(db, "users"), where("email", "==", storedEmail));
        const userSnap = await getDocs(userQuery);
        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          setEmployeeUniqueId(userData.employeeId || "N/A");
        } else {
          setEmployeeUniqueId("NOT_FOUND");
        }

        // 2. Fetch all policies
        const pSnap = await getDocs(collection(db, "policies"));
        const pList = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPolicies(pList);

        // 3. Fetch completions for this user
        const cQuery = query(collection(db, "completions"), where("userEmail", "==", storedEmail));
        const cSnap = await getDocs(cQuery);
        const cList = cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompletions(cList);

        // 4. Generate a stable Certificate ID based on the first completion record or user doc ID
        if (!cSnap.empty) {
          const firstCompId = cSnap.docs[0].id;
          setCertificateId(`BSA-CERT-IND-${firstCompId.substring(0, 8).toUpperCase()}`);
        } else if (!userSnap.empty) {
          const userDocId = userSnap.docs[0].id;
          setCertificateId(`BSA-CERT-IND-${userDocId.substring(0, 8).toUpperCase()}`);
        } else {
          setCertificateId(`BSA-CERT-IND-TEMP`);
        }
      } catch (e) {
        console.error("Error fetching declaration data:", e);
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
        }
      `}} />

      <div className="max-w-[210mm] mx-auto space-y-4 declaration-container">
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

        <Card className="declaration-paper border border-black shadow-lg bg-white print:border-none print:shadow-none">
          <CardHeader className="text-center py-4 border-b border-black">
             <div className="flex justify-center mb-2">
               <img 
                 src="https://bsagroup.in/wp-content/uploads/2025/07/bsa-corp-new-logo-july.png" 
                 alt="BSA Logo" 
                 className="h-10 w-auto object-contain"
               />
             </div>
             <div>
               <h1 className="text-lg font-bold uppercase">Induction Completion Declaration</h1>
               <p className="text-[10px] font-semibold">Official HR Onboarding Record</p>
             </div>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-4 px-8 md:px-12">
             <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
               <div className="space-y-0.5">
                 <span className="text-[9px] font-bold uppercase text-muted-foreground">Employee Name</span>
                 <p className="font-bold border-b border-black pb-0.5">{userName}</p>
               </div>
               <div className="space-y-0.5 text-right">
                 <span className="text-[9px] font-bold uppercase text-muted-foreground">Date</span>
                 <p className="font-bold border-b border-black pb-0.5">{declarationDate}</p>
               </div>
               <div className="space-y-0.5">
                 <span className="text-[9px] font-bold uppercase text-muted-foreground">Email Address</span>
                 <p className="border-b border-black pb-0.5 text-[10px]">{userEmail}</p>
               </div>
               <div className="space-y-0.5 text-right">
                 <span className="text-[9px] font-bold uppercase text-muted-foreground">Status</span>
                 <p className="font-bold border-b border-black pb-0.5 uppercase text-[10px]">FULLY COMPLIANT</p>
               </div>
             </div>

             <div className="space-y-1.5">
               <h3 className="font-bold text-[10px] uppercase tracking-tight">Policies Acknowledged</h3>
               <div className="border border-black">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-b border-black bg-muted/10 h-7">
                        <TableHead className="font-bold text-black text-[9px]">Policy Title</TableHead>
                        <TableHead className="font-bold text-black text-[9px]">Category</TableHead>
                        <TableHead className="font-bold text-black text-[9px]">Status</TableHead>
                        <TableHead className="text-right font-bold text-black text-[9px]">Date Acknowledged</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policies.map(p => {
                        const comp = completions.find(c => c.policyId === p.id);
                        return (
                          <TableRow key={p.id} className="border-b border-black last:border-0 h-6">
                            <TableCell className="text-[9px] font-semibold py-1">{p.title}</TableCell>
                            <TableCell className="text-[9px] py-1">{p.category}</TableCell>
                            <TableCell className="text-[9px] font-bold py-1 text-green-700">✓ Accepted</TableCell>
                            <TableCell className="text-right text-[9px] font-mono py-1">
                              {comp?.completedAt?.toDate()?.toLocaleDateString('en-GB') || declarationDate}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
               </div>
             </div>

             <div className="space-y-4">
                <div className="border border-black p-3 text-[10px] italic leading-relaxed declaration-text bg-muted/5">
                   "I, <strong>{userName}</strong>, hereby declare that I have fully read, understood, and accepted the terms, conditions, and guidelines outlined in all the induction policy documents listed above. I acknowledge that these policies form an integral part of my professional conduct and employment agreement at BSA. I commit to adhering to these standards as required by the organization."
                </div>

                <div className="grid grid-cols-2 gap-20 items-end pt-4">
                  <div className="space-y-1">
                     <span className="text-[9px] font-bold uppercase">Authorized Representative</span>
                     <div className="border-b border-black h-8"></div>
                     <p className="text-[7px] uppercase mt-0.5">BSA HR Department</p>
                  </div>
                  
                  <div className="space-y-1">
                     <span className="text-[9px] font-bold uppercase">Employee Signature</span>
                     <div className="border-b border-black h-8 flex items-center justify-center">
                        <span className="text-[9px] text-muted-foreground/30 print:hidden italic">Sign here after printing</span>
                     </div>
                     <div className="flex justify-between items-center text-[7px] uppercase mt-0.5">
                        <span>{userName}</span>
                        <span className="font-mono bg-muted/10 px-1">ID: {employeeUniqueId}</span>
                     </div>
                  </div>
                </div>
             </div>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center border-t border-black py-1.5 px-8 md:px-12 text-[7px] uppercase">
             <div>
                <p className="font-bold tracking-widest">{certificateId}</p>
             </div>
             <div className="text-right">
                <p>© 2024 BSA HRFLOW | INTERNAL COMPLIANCE RECORD</p>
             </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

