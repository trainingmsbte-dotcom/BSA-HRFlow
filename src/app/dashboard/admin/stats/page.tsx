
"use client";

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
import { TrendingUp, Users, FileCheck, Clock } from "lucide-react";

// Mock data for the stats page
const policyStats = [
  { name: "IT Security", completed: 85, pending: 15 },
  { name: "Conduct", completed: 70, pending: 30 },
  { name: "Safety", completed: 40, pending: 60 },
  { name: "Remote Work", completed: 95, pending: 5 },
  { name: "Green Init.", completed: 60, pending: 40 },
];

const userProgress = [
  { user: "Alice Smith", policy: "IT Security & Data Protection", progress: 100, status: "Completed", timeSpent: "12m 30s" },
  { user: "Alice Smith", policy: "Workplace Health & Safety", progress: 45, status: "In Progress", timeSpent: "4m 15s" },
  { user: "Bob Johnson", policy: "IT Security & Data Protection", progress: 80, status: "In Progress", timeSpent: "15m 02s" },
  { user: "Bob Johnson", policy: "Remote Work Guidelines", progress: 100, status: "Completed", timeSpent: "8m 45s" },
  { user: "Charlie Brown", policy: "Employee Code of Conduct", progress: 20, status: "In Progress", timeSpent: "2m 10s" },
  { user: "Diana Prince", policy: "IT Security & Data Protection", progress: 100, status: "Completed", timeSpent: "10m 20s" },
  { user: "Edward Norton", policy: "Workplace Health & Safety", progress: 0, status: "Not Started", timeSpent: "0s" },
  { user: "Jane Doe", policy: "Diversity & Inclusion", progress: 100, status: "Completed", timeSpent: "14m 55s" },
];

const COLORS = ['#4460A3', '#50C0D8', '#cbd5e1'];

export default function ComplianceStatsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Analytics</h1>
          <p className="text-muted-foreground">Deep dive into employee engagement and policy read progress.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Read Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72.4%</div>
            <p className="text-xs text-muted-foreground font-medium text-green-600">+4.1% from last week</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Currently engaged in induction</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications Issued</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-muted-foreground">Total policy acknowledgments</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">482h</div>
            <p className="text-xs text-muted-foreground">Across all induction modules</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
         <Card className="md:col-span-4 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Completion by Policy</CardTitle>
              <CardDescription>Comparison of completed vs pending reads per module.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer config={{ 
                completed: { label: "Completed", color: "hsl(var(--primary))" },
                pending: { label: "Pending", color: "hsl(var(--accent))" }
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={policyStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} barSize={40} />
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
                      data={[
                        { name: 'Completed', value: 65 },
                        { name: 'In Progress', value: 25 },
                        { name: 'Not Started', value: 10 },
                      ]}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="grid grid-cols-3 gap-4 w-full mt-4 text-center">
                  <div>
                    <div className="text-sm font-bold text-primary">65%</div>
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold">Done</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-accent">25%</div>
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold">In Progress</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400">10%</div>
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold">Waitlist</div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle>Employee Progress Tracker</CardTitle>
          <CardDescription>Live tracking of user interaction depth and reading completion.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow>
                <TableHead className="pl-6">Employee</TableHead>
                <TableHead>Target Policy</TableHead>
                <TableHead>Read Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Time on Page</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userProgress.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="font-semibold pl-6">{row.user}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.policy}</TableCell>
                  <TableCell className="w-1/4">
                    <div className="flex items-center gap-3">
                      <Progress value={row.progress} className="h-1.5 flex-1" />
                      <span className="text-[11px] font-bold w-10 text-right">{row.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === "Completed" ? "default" : row.status === "In Progress" ? "secondary" : "outline"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 text-sm font-mono text-muted-foreground">
                    {row.timeSpent}
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
