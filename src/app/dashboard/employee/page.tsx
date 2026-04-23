
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Eye, Clock, AlertCircle, Loader2, BookOpen, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, limit, orderBy, where } from "firebase/firestore";

interface Policy {
  id: string;
  title: string;
  category: string;
  isMandatory: boolean;
  status?: string;
  createdAt?: any;
}

export default function EmployeeDashboard() {
  const [userName, setUserName] = useState("User");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [completions, setCompletions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    if (storedName) {
      setUserName(storedName.split(' ')[0]);
    }

    // Fetch policies from Firestore
    const qPolicies = query(collection(db, "policies"), orderBy("createdAt", "desc"), limit(20));
    const unsubscribePolicies = onSnapshot(qPolicies, (snapshot) => {
      const policiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Policy[];
      setPolicies(policiesData);
      setIsLoading(false);
    });

    // Fetch completions for this user
    let unsubscribeCompletions = () => {};
    if (userEmail) {
      const qCompletions = query(collection(db, "completions"), where("userEmail", "==", userEmail));
      unsubscribeCompletions = onSnapshot(qCompletions, (snapshot) => {
        const completedIds = snapshot.docs.map(doc => doc.data().policyId);
        setCompletions(completedIds);
      });
    }

    return () => {
      unsubscribePolicies();
      unsubscribeCompletions();
    };
  }, []);

  const overallProgress = policies.length > 0 
    ? Math.round((completions.length / policies.length) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome, {userName}! 👋</h1>
          <p className="text-muted-foreground">Stay compliant by completing your assigned induction policies.</p>
        </div>
        <Card className="border-none shadow-sm bg-primary text-primary-foreground p-5 md:w-80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Your Completion Progress</span>
            <span className="text-sm font-bold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-white/20" />
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-muted/10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Assigned Policies
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Modules you need to review and acknowledge.</p>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : policies.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow>
                  <TableHead className="pl-6">Policy Module</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead className="text-right pr-6">Status & Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => {
                  const isCompleted = completions.includes(policy.id);
                  return (
                    <TableRow key={policy.id} className="hover:bg-muted/5 transition-colors group">
                      <TableCell className="font-semibold pl-6 py-4">
                        {policy.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {policy.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {policy.isMandatory ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20">Mandatory</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          5 mins
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-3">
                          {isCompleted ? (
                            <Badge className="bg-green-600 text-white border-none gap-1 py-1">
                              <CheckCircle2 className="h-3 w-3" /> Accepted
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 py-1">
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          )}
                          <Button asChild variant={isCompleted ? "outline" : "default"} size="sm" className="transition-all">
                            <Link href={`/dashboard/policies/${policy.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 text-muted-foreground italic bg-muted/5">
              No policies have been assigned to you yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-accent/5 border-l-4 border-l-accent">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-accent/20">
            <AlertCircle className="h-6 w-6 text-accent" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Induction Notice</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Please ensure all <span className="font-bold text-primary">Mandatory</span> modules are reviewed. 
              Your compliance record is automatically updated upon acknowledgment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
