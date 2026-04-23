
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
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const initialPolicies = [
  { id: "1", title: "Remote Work & Digital Security", category: "IT Security", mandatory: true, completionRate: 92, lastUpdated: "2023-11-15" },
  { id: "2", title: "Workplace Health & Safety", category: "Safety", mandatory: true, completionRate: 41, lastUpdated: "2023-10-20" },
  { id: "3", title: "Employee Code of Conduct", category: "HR", mandatory: true, completionRate: 84, lastUpdated: "2023-12-01" },
  { id: "4", title: "Sustainability & Green Initiatives", category: "General", mandatory: false, completionRate: 67, lastUpdated: "2023-09-12" },
  { id: "5", title: "Social Media Guidelines", category: "Marketing", mandatory: false, completionRate: 55, lastUpdated: "2023-08-30" },
];

export default function AdminPoliciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [policies, setPolicies] = useState(initialPolicies);
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredPolicies = policies.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (!policyToDelete) return;
    
    setPolicies(prev => prev.filter(p => p.id !== policyToDelete));
    toast({
      title: "Policy Deleted",
      description: "The policy has been successfully removed from the catalog.",
    });
    setPolicyToDelete(null);
  };

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
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <Link href={`/dashboard/admin/policies/new`}>
                            <Edit className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/policies/new`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit Content
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/stats`} className="cursor-pointer">
                                <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => setPolicyToDelete(policy.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Remove Policy
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

      <AlertDialog open={!!policyToDelete} onOpenChange={(open) => !open && setPolicyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the policy and its associated completion data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Policy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
