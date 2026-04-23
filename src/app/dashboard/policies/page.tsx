
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen } from "lucide-react";
import Link from "next/link";

export default function PoliciesCatalogPage() {
  const policies = [
    { id: "1", title: "Workplace Health & Safety", description: "Critical safety procedures for office and field work.", category: "Compliance", mandatory: true },
    { id: "2", title: "IT & Information Security", description: "Learn how to keep company data safe and secure.", category: "IT", mandatory: true },
    { id: "3", title: "Employee Code of Conduct", description: "Our standards for professional behavior.", category: "HR", mandatory: true },
    { id: "4", title: "Sustainability at Work", description: "How we minimize our environmental footprint.", category: "General", mandatory: false },
    { id: "5", title: "Social Media Policy", description: "Guidelines for representing the brand online.", category: "Marketing", mandatory: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Policy Catalog</h1>
          <p className="text-muted-foreground">Access all company documents and induction materials.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search catalog..." className="pl-8" />
          </div>
          <button className="p-2 rounded-md border hover:bg-muted"><Filter className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid gap-4">
        {policies.map((p) => (
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
                      {p.mandatory && <Badge variant="default" className="text-[10px] h-4">MANDATORY</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <Badge variant="outline" className="mb-1">{p.category}</Badge>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Version 1.0.4</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
