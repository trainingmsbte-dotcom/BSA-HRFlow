
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
import { TrendingUp, Users, FileCheck, Clock, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

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
    const unsubUsers = onSnapshot(collection(db, "users"), (userSnap) => {
      const users = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      onSnapshot(collection(db, "policies"), (policySnap) => {
        const policies = policySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        onSnapshot(collection(db, "completions"), (compSnap) => {
          const completions = compSnap.docs.map(doc => doc.data());

          // 1. Completion by Policy (Bar Chart)
          const statsByPolicy = policies.map((p: any) => {
            const completedCount = completions.filter(c => c.policyId === p.id).length;
            const completedPercentage = users.length > 0 ? Math.round((completedCount / users.length) * 100) : 0;
            return {
              name: p.title.length > 15 ? p.title.substring(0, 15) + "..." : p.title,
              completed: completedPercentage,
              pending: 100 - completedPercentage
            };
          });
          setPolicyStats(statsByPolicy);

          // 2. Employee Progress Tracker (Table)
          // For each completion record, we show it as a "Recent Interaction"
          const recentProgress = completions.map((comp: any) => {
            const user = users.find((u: any) => u.email === comp.userEmail) as any;
            return {
              user: user?.name || comp.userEmail,
              policy: comp.policyTitle || "Unknown Policy",
              progress: 100,
              status: "Completed",
              timestamp: comp.completedAt?.toDate().toLocaleString() || "N/A"
            };
          }).slice(0, 10); // Last 10 completions
          setUserProgress(recentProgress);

          // 3. Overall Compliance (Pie Chart)
          let completedUsers = 0;
          let inProgressUsers = 0;
          let notStartedUsers = 0;

          users.forEach((user: any) => {
            const userComps = completions.filter(c => c.userEmail === user.email);
            if (userComps.length === policies.length && policies.length > 0) completedUsers++;
            else if (userComps.length > 0) inProgressUsers++;
            else notStartedUsers++;
          });

          setPieData([
            { name: 'Completed', value: completedUsers },
            { name: 'In Progress', value: inProgressUsers },
            { name: 'Not Started', value: notStartedUsers },
          ]);

          // 4. Summary Stats
          const avgProgress = statsByPolicy.length > 0 ? Math.round(statsByPolicy.reduce((acc, curr) => acc + curr.completed, 0) / statsByPolicy.length) : 0;
          
          setOverallStats({
            avgProgress,
            activeLearners: users.length,
            totalCompletions: completions.length
          });

          setIsLoading(false);
        });
      });
    });

    return () => unsubUsers();
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Compliance Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into policy read progress and team engagement.</p>
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
            <p className="text-xs text-muted-foreground font-medium">Across all modules</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.activeLearners}</div>
            <p className="text-xs text-muted-foreground">Employees in the system</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Acknowledgments</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalCompletions}</div>
            <p className="text-xs text-muted-foreground">Total records in Firestore</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
         <Card className="md:col-span-4 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Completion by Policy</CardTitle>
              <CardDescription>Percentage of employees who have acknowledged each module.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer config={{ 
                completed: { label: "Completed %", color: "hsl(var(--primary))" },
                pending: { label: "Pending %", color: "hsl(var(--accent))" }
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={policyStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
         </Card>

         <Card className="md:col-span-3 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Overall Compliance</CardTitle>
              <CardDescription>Company-wide induction status distribution.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex flex-col items-center justify-center">
               <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="grid grid-cols-3 gap-4 w-full mt-4 text-center">
                  {pieData.map((item, idx) => (
                    <div key={idx}>
                      <div className="text-sm font-bold" style={{ color: COLORS[idx] }}>{item.value}</div>
                      <div className="text-[10px] uppercase text-muted-foreground font-semibold">{item.name}</div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle>Recent Activity Tracker</CardTitle>
          <CardDescription>Live feed of latest policy acknowledgments and read confirmations.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow>
                <TableHead className="pl-6">Employee</TableHead>
                <TableHead>Target Policy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Date Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userProgress.length > 0 ? (
                userProgress.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="font-semibold pl-6">{row.user}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.policy}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-600">
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 text-sm font-mono text-muted-foreground">
                      {row.timestamp}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                    No recent activity recorded.
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
