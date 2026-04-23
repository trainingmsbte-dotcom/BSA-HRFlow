
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  isMandatory: boolean;
  version: string;
}

export default function PoliciesCatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "policies"), orderBy("createdAt", "desc"));
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

  const filteredPolicies = policies.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Policy Catalog</h1>
          <p className="text-muted-foreground">Access all company documents and induction materials from Firestore.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search catalog..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 rounded-md border hover:bg-muted"><Filter className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPolicies.length > 0 ? (
          filteredPolicies.map((p) => (
            <Link key={p.id} href={`/dashboard/policies/${p.id}`}>
              <Card className="border-none shadow-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer group">
                <CardContent className="p-0">
                  <div className="flex items-center p-5 gap-6">
                    <div className="hidden sm:flex w-12 h-12 rounded-lg bg-muted items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{p.title}</h3>
                        {p.isMandatory && <Badge variant="default" className="text-[10px] h-4">MANDATORY</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <Badge variant="outline" className="mb-1">{p.category}</Badge>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Version {p.version || "1.0.0"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 text-muted-foreground italic">
            No policies found in the database.
          </div>
        )}
      </div>
    </div>
  );
}
