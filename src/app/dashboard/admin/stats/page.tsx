
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, FileCheck, Loader2, Hash, FileText, Eye } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export default function ComplianceStatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [policyStats, setPolicyStats] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState({
    avgProgress: 0,
    activeLearners: 0,
    totalCompletions: 0
  });

  useEffect(() => {
    const unsubPolicies = onSnapshot(collection(db, "policies"), (policySnap) => {
      const policies = policySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const unsubUsers = onSnapshot(collection(db, "users"), (userSnap) => {
        const users = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        
        const unsubCompletions = onSnapshot(query(collection(db, "completions"), orderBy("completedAt", "desc"), limit(20)), (compSnap) => {
          const completions = compSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          onSnapshot(collection(db, "completions"), (allCompSnap) => {
            const allComps = allCompSnap.docs.map(doc => doc.data());
            const statsByPolicy = policies.map((p: any) => {
              const completedCount = allComps.filter(c => c.policyId === p.id).length;
              const completedPercentage = users.length > 0 ? Math.round((completedCount / users.length) * 100) : 0;
              return { name: p.title, completed: completedPercentage };
            });
            setPolicyStats(statsByPolicy);

            const avgProgress = statsByPolicy.length > 0 ? Math.round(statsByPolicy.reduce((acc, curr) => acc + curr.completed, 0) / statsByPolicy.length) : 0;
            setOverallStats({
              avgProgress,
              activeLearners: users.length,
              totalCompletions: allComps.length
            });
          });

          const recentProgress = completions.map((comp: any) => {
            const user = users.find((u: any) => u.email === comp.userEmail);
            const certId = `BSA-CERT-IND-${comp.id.substring(0, 6).toUpperCase()}`;
            return {
              user: user?.name || comp.userEmail,
              userEmail: comp.userEmail,
              employeeId: user?.employeeId || "N/A",
              certId: certId,
              policy: comp.policyTitle || "Unknown Policy",
              timestamp: comp.completedAt?.toDate().toLocaleString() || "N/A"
            };
          });
          setUserProgress(recentProgress);
          setIsLoading(false);
        });
        return () => unsubCompletions();
      });
      return () => unsubUsers();
    });
    return () => unsubPolicies();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">ID & Certificate Tracker</h1>
          <p className="text-muted-foreground">Monitor unique employee identifiers and induction certificates.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm"><CardHeader><CardTitle className="text-sm">Avg. Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{overallStats.avgProgress}%</div></CardContent></Card>
        <Card className="border-none shadow-sm"><CardHeader><CardTitle className="text-sm">Total Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{overallStats.activeLearners}</div></CardContent></Card>
        <Card className="border-none shadow-sm"><CardHeader><CardTitle className="text-sm">Acknowledgements</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{overallStats.totalCompletions}</div></CardContent></Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle>Induction Declaration Log</CardTitle>
          <CardDescription>Track certificate IDs and view declarations.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow>
                <TableHead className="pl-6">Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userProgress.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="pl-6"><div className="font-semibold text-sm">{row.user}</div><div className="text-[10px] text-muted-foreground">{row.timestamp}</div></TableCell>
                  <TableCell><div className="font-mono text-xs flex items-center gap-1"><Hash className="h-3 w-3" />{row.employeeId}</div></TableCell>
                  <TableCell><div className="font-mono text-[10px] text-primary flex items-center gap-1"><FileText className="h-3 w-3" />{row.certId}</div></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.policy}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/employee/declaration?email=${row.userEmail}`}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
