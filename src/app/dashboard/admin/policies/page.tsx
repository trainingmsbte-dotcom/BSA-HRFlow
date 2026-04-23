
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, FileText, BarChart2, Trash2, Edit } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const mockPolicies = [
  { id: "1", title: "Remote Work & Digital Security", category: "IT Security", mandatory: true, completionRate: 92, lastUpdated: "2023-11-15" },
  { id: "2", title: "Workplace Health & Safety", category: "Safety", mandatory: true, completionRate: 41, lastUpdated: "2023-10-20" },
  { id: "3", title: "Employee Code of Conduct", category: "HR", mandatory: true, completionRate: 84, lastUpdated: "2023-12-01" },
  { id: "4", title: "Sustainability & Green Initiatives", category: "General", mandatory: false, completionRate: 67, lastUpdated: "2023-09-12" },
  { id: "5", title: "Social Media Guidelines", category: "Marketing", mandatory: false, completionRate: 55, lastUpdated: "2023-08-30" },
];

export default function AdminPoliciesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPolicies = mockPolicies.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Policy Management</h1>
          <p className="text-muted-foreground">Create, edit, and track company policy documents.</p>
        </div>
        <Button asChild className="shadow-sm">
          <Link href="/dashboard/admin/policies/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Policy
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Policy Catalog</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search policies..." 
                className="pl-9 bg-background" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow>
                <TableHead className="pl-6">Policy Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Avg. Completion</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy) => (
                  <TableRow key={policy.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="font-semibold pl-6">{policy.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">{policy.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {policy.mandatory ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Mandatory</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all" 
                            style={{ width: `${policy.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{policy.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{policy.lastUpdated}</TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Policy Management</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/policies/new`} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" /> Edit Content
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/stats`} className="cursor-pointer">
                              <BarChart2 className="mr-2 h-4 w-4" /> Detailed Stats
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Policy
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                    No policies matching your search criteria were found.
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
