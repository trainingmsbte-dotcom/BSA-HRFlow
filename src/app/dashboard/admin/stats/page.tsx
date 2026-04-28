
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, Users, FileCheck, Clock, Loader2, Hash, FileText } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const COLORS = ['#4460A3', '#50C0D8', '#cbd5e1'];

export default function ComplianceStatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [policyStats, setPolicyStats] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
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
        
        const unsubCompletions = onSnapshot(query(collection(db, "completions"), orderBy("completedAt", "desc"), limit(15)), (compSnap) => {
          const completions = compSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // 1. Completion by Policy (Bar Chart)
          onSnapshot(collection(db, "completions"), (allCompSnap) => {
            const allComps = allCompSnap.docs.map(doc => doc.data());
            const statsByPolicy = policies.map((p: any) => {
              const completedCount = allComps.filter(c => c.policyId === p.id).length;
              const completedPercentage = users.length > 0 ? Math.round((completedCount / users.length) * 100) : 0;
              return {
                name: p.title.length > 15 ? p.title.substring(0, 15) + "..." : p.title,
                completed: completedPercentage > 100 ? 100 : completedPercentage
              };
            });
            setPolicyStats(statsByPolicy);

            const avgProgress = statsByPolicy.length > 0 ? Math.round(statsByPolicy.reduce((acc, curr) => acc + curr.completed, 0) / statsByPolicy.length) : 0;
            setOverallStats({
              avgProgress,
              activeLearners: users.length,
              totalCompletions: allComps.length
            });
          });

          // 2. Recent Interaction Feed (Table) - Now includes Tracking IDs
          const recentProgress = completions.map((comp: any) => {
            const user = users.find((u: any) => u.email === comp.userEmail);
            // Mocking a Certificate ID based on the completion doc ID for demo tracking
            const certId = `BSA-CERT-IND-${comp.id.substring(0, 6).toUpperCase()}`;
            return {
              user: user?.name || comp.userEmail,
              employeeId: user?.employeeId || "N/A",
              certId: certId,
              policy: comp.policyTitle || "Unknown Policy",
              status: "Acknowledged",
              timestamp: comp.completedAt?.toDate().toLocaleString() || "N/A"
            };
          });
          setUserProgress(recentProgress);

          // 3. Overall Compliance (Pie Chart)
          let completedUsers = 0;
          let inProgressUsers = 0;
          let notStartedUsers = 0;

          users.forEach((user: any) => {
            const userCompsCount = (user.completedPolicies || []).length;
            if (userCompsCount === policies.length && policies.length > 0) completedUsers++;
            else if (userCompsCount > 0) inProgressUsers++;
            else notStartedUsers++;
          });

          setPieData([
            { name: 'Completed All', value: completedUsers },
            { name: 'In Progress', value: inProgressUsers },
            { name: 'Not Started', value: notStartedUsers },
          ]);

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
          <p className="text-muted-foreground">Track unique employee identifiers and induction completion certificates.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Read Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.avgProgress}%</div>
            <p className="text-xs text-muted-foreground font-medium">Company average</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.activeLearners}</div>
            <p className="text-xs text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Acknowledgments</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalCompletions}</div>
            <p className="text-xs text-muted-foreground">Document read events</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle>Induction Declaration Log</CardTitle>
          <CardDescription>Monitor unique IDs and certificates for official candidate declaration tracking.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow>
                <TableHead className="pl-6">Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Policy Module</TableHead>
                <TableHead className="text-right pr-6">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userProgress.length > 0 ? (
                userProgress.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="font-semibold pl-6">{row.user}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded w-fit">
                          <Hash className="h-3 w-3" />
                          {row.employeeId}
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 w-fit">
                          <FileText className="h-3 w-3" />
                          {row.certId}
                       </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.policy}</TableCell>
                    <TableCell className="text-right pr-6 text-[10px] font-mono text-muted-foreground">
                      {row.timestamp}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                    Waiting for activity...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
