
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileCheck, AlertCircle, TrendingUp, MoreVertical, Edit, Mail, BarChart2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

interface DashboardStats {
  totalEmployees: number;
  completionRate: number;
  activePolicies: number;
  nonCompliant: number;
}

interface UserCompliance {
  id: string;
  employee: string;
  department: string;
  progress: number;
  status: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({ totalEmployees: 0, completionRate: 0, activePolicies: 0, nonCompliant: 0 });
  const [complianceData, setComplianceData] = useState<UserCompliance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for users, policies, and completions to build the dashboard
    const unsubUsers = onSnapshot(collection(db, "users"), (userSnap) => {
      const users = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      onSnapshot(collection(db, "policies"), (policySnap) => {
        const policies = policySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        onSnapshot(collection(db, "completions"), (compSnap) => {
          const completions = compSnap.docs.map(doc => doc.data());
          
          // Calculate Compliance Data per User
          const compliance = users.map((user: any) => {
            const userCompletions = completions.filter(c => c.userEmail === user.email);
            const progress = policies.length > 0 ? Math.round((userCompletions.length / policies.length) * 100) : 0;
            let status = "Pending";
            if (progress === 100) status = "Completed";
            else if (progress === 0) status = "Not Started";

            return {
              id: user.id,
              employee: user.name || "Unknown",
              department: user.department || "General",
              progress,
              status
            };
          });

          setComplianceData(compliance);
          
          // Calculate Global Stats
          const totalEmployees = users.length;
          const activePolicies = policies.length;
          const avgProgress = compliance.length > 0 ? Math.round(compliance.reduce((acc, curr) => acc + curr.progress, 0) / compliance.length) : 0;
          const nonCompliant = compliance.filter(c => c.progress < 100).length;

          setStats({
            totalEmployees,
            activePolicies,
            completionRate: avgProgress,
            nonCompliant
          });
          setIsLoading(false);
        });
      });
    });

    return () => unsubUsers();
  }, []);

  const handleAction = (action: string, employee: string) => {
    toast({
      title: `${action} triggered`,
      description: `Action performed for ${employee}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { name: "Total Employees", value: stats.totalEmployees.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Avg. Completion", value: `${stats.completionRate}%`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    { name: "Active Policies", value: stats.activePolicies.toString(), icon: FileCheck, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Incomplete Users", value: stats.nonCompliant.toString(), icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Overview</h1>
        <p className="text-muted-foreground">Monitor induction progress and company-wide compliance in real-time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">Real-time data from Firestore</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-7 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Employee Compliance Tracking</CardTitle>
            <CardDescription>Live status of assigned policies across all registered users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Dept</TableHead>
                  <TableHead>Read Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceData.length > 0 ? (
                  complianceData.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.employee}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell className="w-1/3">
                        <div className="flex items-center gap-2">
                          <Progress value={user.progress} className="h-2" />
                          <span className="text-xs font-medium">{user.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Completed" ? "default" : user.status === "Pending" ? "secondary" : "destructive"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Compliance Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAction("Send Reminder", user.employee)}>
                              <Mail className="mr-2 h-4 w-4" /> Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/admin/stats" className="cursor-pointer">
                                <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("Edit Assignments", user.employee)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      No compliance data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
