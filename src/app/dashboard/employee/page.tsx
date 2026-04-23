
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, limit } from "firebase/firestore";

interface Policy {
  id: string;
  title: string;
  category: string;
  isMandatory: boolean;
  status?: string;
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

    const q = query(collection(db, "policies"), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const policiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Policy[];
      setPolicies(policiesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {userName}! 👋</h1>
          <p className="text-muted-foreground">Monitor your induction progress from Firestore.</p>
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
        {isLoading ? (
          <div className="col-span-full h-32 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : policies.length > 0 ? (
          policies.map((policy) => (
            <Card key={policy.id} className="border-none shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={policy.isMandatory ? "default" : "outline"} className={policy.isMandatory ? "bg-primary" : ""}>
                    {policy.isMandatory ? "Mandatory" : "Optional"}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">{policy.category}</Badge>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {policy.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated: 5 mins focus</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button asChild variant="default" className="w-full">
                  <Link href={`/dashboard/policies/${policy.id}`}>
                    Start Learning
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
            No policies assigned yet.
          </div>
        )}
      </div>

      <Card className="border-none shadow-sm bg-accent/5">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-accent/20">
            <AlertCircle className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Induction Deadline</h3>
            <p className="text-muted-foreground text-sm">Please complete all mandatory policies stored in Firestore to ensure compliance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
