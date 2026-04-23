
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileCheck, AlertCircle, TrendingUp, MoreVertical, Edit, Mail, BarChart2 } from "lucide-react";
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

const stats = [
  { name: "Total Employees", value: "248", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
  { name: "Completion Rate", value: "78%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
  { name: "Active Policies", value: "12", icon: FileCheck, color: "text-purple-600", bg: "bg-purple-100" },
  { name: "Non-Compliant", value: "14", icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
];

const complianceData = [
  { employee: "Alice Smith", department: "Engineering", progress: 100, status: "Completed" },
  { employee: "Bob Johnson", department: "Marketing", progress: 45, status: "Pending" },
  { employee: "Charlie Brown", department: "Sales", progress: 12, status: "Pending" },
  { employee: "Diana Prince", department: "Legal", progress: 95, status: "Completed" },
  { employee: "Edward Norton", department: "HR", progress: 0, status: "Overdue" },
];

export default function AdminDashboard() {
  const { toast } = useToast();

  const handleAction = (action: string, employee: string) => {
    toast({
      title: `${action} triggered`,
      description: `Action performed for ${employee}.`,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Monitor induction progress and company-wide compliance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">+2.5% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Employee Compliance</CardTitle>
            <CardDescription>Real-time status of assigned policies across all teams.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Dept</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceData.map((user) => (
                  <TableRow key={user.employee}>
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
                              <BarChart2 className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Edit Assignments", user.employee)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Assignments
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Policy Performance</CardTitle>
            <CardDescription>Average completion rate per policy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">IT Security Policy</span>
                <span className="text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2 bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Code of Conduct</span>
                <span className="text-muted-foreground">84%</span>
              </div>
              <Progress value={84} className="h-2 bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Remote Work Policy</span>
                <span className="text-muted-foreground">67%</span>
              </div>
              <Progress value={67} className="h-2 bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Health & Safety</span>
                <span className="text-muted-foreground">41%</span>
              </div>
              <Progress value={41} className="h-2 bg-muted" />
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/admin/stats">View All Detailed Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
