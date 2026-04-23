
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function EmployeeDashboard() {
  const userName = "Jane";
  const overallProgress = 65;

  const assignedPolicies = [
    { id: "1", title: "Company Culture & Values", category: "General", status: "Completed", mandatory: true },
    { id: "2", title: "IT Security & Data Protection", category: "IT", status: "Pending", mandatory: true },
    { id: "3", title: "Diversity & Inclusion", category: "HR", status: "Pending", mandatory: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {userName}! 👋</h1>
          <p className="text-muted-foreground">You are making great progress on your induction journey.</p>
        </div>
        <Card className="border-none shadow-sm bg-primary text-primary-foreground p-4 md:w-80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-white/20" />
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignedPolicies.map((policy) => (
          <Card key={policy.id} className="border-none shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant={policy.mandatory ? "default" : "outline"} className={policy.mandatory ? "bg-primary" : ""}>
                  {policy.mandatory ? "Mandatory" : "Optional"}
                </Badge>
                <Badge variant="secondary" className="capitalize">{policy.category}</Badge>
              </div>
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                {policy.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {policy.status === "Completed" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Completed</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>Estimated: 5 mins</span>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild variant={policy.status === "Completed" ? "outline" : "default"} className="w-full">
                <Link href={`/dashboard/policies/${policy.id}`}>
                  {policy.status === "Completed" ? "Review Content" : "Start Learning"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-accent/5">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-accent/20">
            <AlertCircle className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Induction Deadline</h3>
            <p className="text-muted-foreground text-sm">Please complete all mandatory policies by <span className="font-bold">Next Friday, Dec 20th</span> to avoid compliance reminders.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
