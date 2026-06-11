
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, MoreHorizontal, Shield, Trash2, Edit2, Loader2, Phone, Key, Hash, Sparkles, Wand2, Building2, Plus, FileText, Eye } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, serverTimestamp, updateDoc, where, getDocs, orderBy } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { syncUserToSheet } from "@/ai/flows/admin-sync-user-sheet";

interface UserRecord {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  status: string;
  passkey?: string;
  requiresChange?: boolean;
  createdAt?: any;
  createdByEmail?: string;
}

interface Department {
  id: string;
  name: string;
}

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isFixingIds, setIsFixingIds] = useState(false);
  const [isAddingDept, setIsAddingDept] = useState(false);
  
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "Employee",
    department: "Engineering",
    passkey: "",
  });

  const [newDeptName, setNewDeptName] = useState("");
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    // Listen for users
    const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribeUsers = onSnapshot(qUsers, (querySnapshot) => {
      const usersData: UserRecord[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserRecord);
      });
      setUsers(usersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      toast({ variant: "destructive", title: "Connection Error", description: "Could not fetch users." });
      setIsLoading(false);
    });

    // Listen for departments
    const qDepts = query(collection(db, "departments"), orderBy("name", "asc"));
    const unsubscribeDepts = onSnapshot(qDepts, (querySnapshot) => {
      const deptsData: Department[] = [];
      querySnapshot.forEach((doc) => {
        deptsData.push({ id: doc.id, ...doc.data() } as Department);
      });
      setDepartments(deptsData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeDepts();
    };
  }, [toast]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setIsAddingDept(true);
    try {
      const existing = departments.find(d => d.name.toLowerCase() === newDeptName.toLowerCase());
      if (existing) throw new Error("Department already exists.");
      await addDoc(collection(db, "departments"), { name: newDeptName.trim(), createdAt: serverTimestamp() });
      toast({ title: "Department Added", description: `${newDeptName} is now available.` });
      setNewDeptName("");
      setDeptOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally { setIsAddingDept(false); }
  };

  const handleGenerateMissingIds = async () => {
    const usersWithoutId = users.filter(u => !u.employeeId || u.employeeId === "Not Set");
    if (usersWithoutId.length === 0) {
      return toast({ title: "All set", description: "All users already have Employee IDs." });
    }
    setIsFixingIds(true);
    try {
      let fixCount = 0;
      for (const user of usersWithoutId) {
        const newEmployeeId = Math.floor(100000 + Math.random() * 900000).toString();
        await updateDoc(doc(db, "users", user.id), { employeeId: newEmployeeId, updatedAt: serverTimestamp() });
        fixCount++;
      }
      toast({ title: "IDs Generated", description: `Successfully generated IDs for ${fixCount} employees.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally { setIsFixingIds(false); }
  };

  const handleCleanupDuplicates = async () => {
    if (users.length === 0) return;
    setIsCleaning(true);
    try {
      const emailGroups = new Map<string, UserRecord[]>();
      users.forEach(user => {
        const email = user.email.toLowerCase();
        if (!emailGroups.has(email)) emailGroups.set(email, []);
        emailGroups.get(email)?.push(user);
      });
      let deleteCount = 0;
      for (const group of Array.from(emailGroups.values())) {
        if (group.length > 1) {
          const sorted = [...group].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          for (const u of sorted.slice(1)) {
            await deleteDoc(doc(db, "users", u.id));
            deleteCount++;
          }
        }
      }
      toast({ title: "Cleanup Complete", description: `Removed ${deleteCount} duplicates.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Cleanup Failed", description: error.message });
    } finally { setIsCleaning(false); }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.passkey) {
      return toast({ variant: "destructive", title: "Missing Fields", description: "Name, Email, and Passkey are required." });
    }
    setIsAdding(true);
    try {
      const creatorEmail = localStorage.getItem('userEmail') || "System";
      const usersRef = collection(db, "users");
      
      const emailCheck = query(usersRef, where("email", "==", formData.email));
      const emailSnap = await getDocs(emailCheck);
      if (!emailSnap.empty) throw new Error("Email already exists.");

      if (formData.mobile) {
        const mobileCheck = query(usersRef, where("mobile", "==", formData.mobile));
        const mobileSnap = await getDocs(mobileCheck);
        if (!mobileSnap.empty) throw new Error("Mobile number already exists.");
      }

      const newEmployeeId = Math.floor(100000 + Math.random() * 900000).toString();
      await addDoc(collection(db, "users"), {
        employeeId: newEmployeeId,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        department: formData.department,
        passkey: formData.passkey,
        requiresChange: true,
        status: "Active",
        createdAt: serverTimestamp(),
        createdByEmail: creatorEmail,
      });
      syncUserToSheet({
        name: formData.name, email: formData.email, mobile: formData.mobile, role: formData.role, department: formData.department
      });
      toast({ title: "User Added", description: `${formData.name} added.` });
      setAddOpen(false);
      setFormData({ name: "", email: "", mobile: "", role: "Employee", department: "Engineering", passkey: "" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally { setIsAdding(false); }
  };

  const handleEditClick = (user: UserRecord) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      role: user.role || "Employee",
      department: user.department || "Engineering",
      passkey: user.passkey || "",
    });
    setEditOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsEditing(true);
    try {
      const usersRef = collection(db, "users");
      
      const emailCheck = query(usersRef, where("email", "==", formData.email));
      const emailSnap = await getDocs(emailCheck);
      if (!emailSnap.empty && emailSnap.docs[0].id !== editingUser.id) {
        throw new Error("Email is already used by another employee.");
      }

      if (formData.mobile) {
        const mobileCheck = query(usersRef, where("mobile", "==", formData.mobile));
        const mobileSnap = await getDocs(mobileCheck);
        if (!mobileSnap.empty && mobileSnap.docs[0].id !== editingUser.id) {
          throw new Error("Mobile number is already used by another employee.");
        }
      }

      await updateDoc(doc(db, "users", editingUser.id), {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        department: formData.department,
        passkey: formData.passkey,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "User Updated", description: "Record saved." });
      setEditOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally { setIsEditing(false); }
  };

  const handleDeleteUser = async (userId: string, userName: string, targetRole: string, targetEmail: string) => {
    const currentUserEmail = localStorage.getItem('userEmail');
    const currentUserRecord = users.find(u => u.email === currentUserEmail);
    if (currentUserEmail === targetEmail) {
      return toast({ variant: "destructive", title: "Restricted", description: "Cannot delete yourself." });
    }
    if (targetRole === 'Admin' && currentUserRecord?.createdByEmail === targetEmail) {
      return toast({ variant: "destructive", title: "Denied", description: "Cannot delete parent admin." });
    }
    try {
      await deleteDoc(doc(db, "users", userId));
      toast({ title: "Removed", description: `${userName} deleted.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.employeeId?.includes(searchTerm) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const defaultDepts = ["Engineering", "Marketing", "Sales", "HR", "Operations", "Finance"];
  const allDepts = Array.from(new Set([...defaultDepts, ...departments.map(d => d.name)]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">User Management</h1>
          <p className="text-muted-foreground">Manage employees and tracking records.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <Dialog open={deptOpen} onOpenChange={setDeptOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-primary"><Building2 className="h-4 w-4 mr-2" /> Add Dept</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
              <form onSubmit={handleAddDepartment} className="space-y-4 py-4">
                <Input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="Dept Name" required />
                <Button type="submit" disabled={isAddingDept} className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handleGenerateMissingIds} disabled={isFixingIds}><Wand2 className="h-4 w-4 mr-2" /> IDs</Button>
          <Button variant="outline" size="sm" onClick={handleCleanupDuplicates} disabled={isCleaning}><Sparkles className="h-4 w-4 mr-2" /> Cleanup</Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" /> Add User</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
              <form onSubmit={handleAddUser} className="grid gap-4 py-4">
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Name" required />
                <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email" required />
                <Input value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} placeholder="Mobile" />
                <Input value={formData.passkey} onChange={(e) => setFormData({...formData, passkey: e.target.value})} placeholder="Default Passkey" required />
                <div className="grid grid-cols-2 gap-4">
                  <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Employee">Employee</SelectItem><SelectItem value="Admin">Admin</SelectItem></SelectContent></Select>
                  <Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{allDepts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
                </div>
                <Button type="submit" disabled={isAdding} className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit Employee</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateUser} className="grid gap-4 py-4">
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Name" required />
            <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email" required />
            <Input value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} placeholder="Mobile" />
            <Input value={formData.passkey} onChange={(e) => setFormData({...formData, passkey: e.target.value})} placeholder="Reset Passkey" />
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Employee">Employee</SelectItem><SelectItem value="Admin">Admin</SelectItem></SelectContent></Select>
              <Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{allDepts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            </div>
            <Button type="submit" disabled={isEditing} className="w-full">Update</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Directory</CardTitle>
            <div className="relative w-full max-w-sm"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead className="pl-6">User</TableHead><TableHead>ID</TableHead><TableHead>Contact</TableHead><TableHead>Dept</TableHead><TableHead>Status</TableHead><TableHead className="text-right pr-6">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="pl-6"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar><div><p className="font-semibold text-sm">{user.name}</p><p className="text-xs text-muted-foreground">{user.role}</p></div></div></TableCell>
                    <TableCell><div className="font-mono text-xs"><Hash className="h-3 w-3 inline mr-1" />{user.employeeId || "Not Set"}</div></TableCell>
                    <TableCell><div className="text-xs text-muted-foreground"><p>{user.email}</p><p>{user.mobile}</p></div></TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{user.department}</Badge></TableCell>
                    <TableCell><Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge></TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <Link href={`/dashboard/employee/declaration?email=${user.email}`} title="View Declaration">
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(user)}><Edit2 className="mr-2 h-4 w-4" /> Edit Record</DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/dashboard/employee/declaration?email=${user.email}`}><FileText className="mr-2 h-4 w-4" /> View Declaration</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id, user.name, user.role, user.email)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
