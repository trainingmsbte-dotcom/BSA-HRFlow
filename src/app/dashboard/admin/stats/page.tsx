
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
        
        const unsubCompletions = onSnapshot(query(collection(db, "completions"), orderBy("completedAt", "desc"), limit(10)), (compSnap) => {
          const completions = compSnap.docs.map(doc => doc.data());

          // 1. Completion by Policy (Bar Chart)
          // We still use the completions collection for this specific granularity
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

            // 2. Summary Stats
            const avgProgress = statsByPolicy.length > 0 ? Math.round(statsByPolicy.reduce((acc, curr) => acc + curr.completed, 0) / statsByPolicy.length) : 0;
            setOverallStats({
              avgProgress,
              activeLearners: users.length,
              totalCompletions: allComps.length
            });
          });

          // 2. Recent Interaction Feed (Table)
          const recentProgress = completions.map((comp: any) => {
            const user = users.find((u: any) => u.email === comp.userEmail);
            return {
              user: user?.name || comp.userEmail,
              policy: comp.policyTitle || "Unknown Policy",
              status: "Acknowledged",
              timestamp: comp.completedAt?.toDate().toLocaleString() || "N/A"
            };
          });
          setUserProgress(recentProgress);

          // 3. Overall Compliance (Pie Chart)
          // Use user record data for this
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Compliance Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into policy engagement and overall team compliance.</p>
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

      <div className="grid gap-6 md:grid-cols-7">
         <Card className="md:col-span-4 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Completion Rate by Policy</CardTitle>
              <CardDescription>Percentage of the workforce that has acknowledged each specific policy.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer config={{ 
                completed: { label: "Completed %", color: "hsl(var(--primary))" }
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={policyStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
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
              <CardTitle>Induction Status</CardTitle>
              <CardDescription>Distribution of employees across completion tiers.</CardDescription>
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
          <CardTitle>Live Activity Feed</CardTitle>
          <CardDescription>Latest individual policy read confirmations recorded in the system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow>
                <TableHead className="pl-6">Employee</TableHead>
                <TableHead>Policy Module</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="text-right pr-6">Timestamp</TableHead>
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
