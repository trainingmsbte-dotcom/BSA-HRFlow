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
import { Eye, Clock, AlertCircle, Loader2, BookOpen } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, limit, orderBy } from "firebase/firestore";

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
  const [isLoading, setIsLoading] = useState(true);
  const overallProgress = 0; // In a real app, calculate from user-specific compliance records

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName.split(' ')[0]);
    }

    // Fetch policies from Firestore, ordered by creation date
    const q = query(collection(db, "policies"), orderBy("createdAt", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const policiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Policy[];
      setPolicies(policiesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
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
                      <Button asChild variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white transition-all">
                        <Link href={`/dashboard/policies/${policy.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
