
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, MoreHorizontal, Mail, Shield, Trash2, Edit2, Loader2, Phone, Key, Table as TableIcon, Hash, Sparkles, Wand2, Building2, Plus } from "lucide-react";
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
import { sendWelcomeEmail } from "@/ai/flows/admin-send-welcome-email";

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
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not fetch users from Firestore.",
      });
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
      // Check for existing
      const existing = departments.find(d => d.name.toLowerCase() === newDeptName.toLowerCase());
      if (existing) throw new Error("Department already exists.");

      await addDoc(collection(db, "departments"), {
        name: newDeptName.trim(),
        createdAt: serverTimestamp()
      });

      toast({
        title: "Department Added",
        description: `${newDeptName} is now available in the employee forms.`,
      });
      setNewDeptName("");
      setDeptOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Add Department",
        description: error.message,
      });
    } finally {
      setIsAddingDept(false);
    }
  };

  const handleSendWelcomeMail = async (user: UserRecord) => {
    try {
      const loginLink = window.location.origin + "/login";
      const result = await sendWelcomeEmail({
        email: user.email,
        name: user.name,
        employeeId: user.employeeId || "Not Set",
        passkey: user.passkey || "TemporaryPassword123",
        loginLink: loginLink
      });
      
      if (result.success) {
        toast({
          title: "Welcome Mail Sent",
          description: `Credentials and portal link sent to ${user.email}. (Simulated)`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Mail Failed",
        description: error.message,
      });
    }
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
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, {
          employeeId: newEmployeeId,
          updatedAt: serverTimestamp(),
        });
        fixCount++;
      }
      toast({
        title: "IDs Generated",
        description: `Successfully generated unique IDs for ${fixCount} employees.`,
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Operation Failed", description: error.message });
    } finally {
      setIsFixingIds(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (users.length === 0) return;
    setIsCleaning(true);
    try {
      const emailGroups = new Map<string, UserRecord[]>();
      const mobileGroups = new Map<string, UserRecord[]>();

      users.forEach(user => {
        const email = user.email.toLowerCase();
        if (!emailGroups.has(email)) emailGroups.set(email, []);
        emailGroups.get(email)?.push(user);

        if (user.mobile) {
          if (!mobileGroups.has(user.mobile)) mobileGroups.set(user.mobile, []);
          mobileGroups.get(user.mobile)?.push(user);
        }
      });

      let deleteCount = 0;
      const idsToDelete = new Set<string>();

      emailGroups.forEach((group) => {
        if (group.length > 1) {
          const sorted = [...group].sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
          sorted.slice(1).forEach(u => idsToDelete.add(u.id));
        }
      });

      mobileGroups.forEach((group) => {
        if (group.length > 1) {
          const sorted = [...group].sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
          sorted.slice(1).forEach(u => idsToDelete.add(u.id));
        }
      });

      for (const id of idsToDelete) {
        await deleteDoc(doc(db, "users", id));
        deleteCount++;
      }

      toast({
        title: "Cleanup Complete",
        description: `Successfully identified and removed ${deleteCount} duplicate records.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Cleanup Failed",
        description: error.message,
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.passkey) {
      return toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in Name, Email, and a Default Passkey.",
      });
    }

    setIsAdding(true);
    try {
      const creatorEmail = localStorage.getItem('userEmail') || "System";
      const usersRef = collection(db, "users");
      
      const emailCheck = query(usersRef, where("email", "==", formData.email));
      const emailSnap = await getDocs(emailCheck);
      if (!emailSnap.empty) {
        throw new Error("A user with this email already exists.");
      }

      if (formData.mobile) {
        const mobileCheck = query(usersRef, where("mobile", "==", formData.mobile));
        const mobileSnap = await getDocs(mobileCheck);
        if (!mobileSnap.empty) {
          throw new Error("A user with this mobile number already exists.");
        }
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

      // Synchronize to Google Sheet if configured (using server-side environment variables)
      syncUserToSheet({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        department: formData.department
      }).then(result => {
        if (!result.success && result.message !== 'Google Sheet ID is not configured.') {
          toast({
            variant: "destructive",
            title: "Sheet Sync Failed",
            description: result.message,
          });
        }
      });

      toast({
        title: "User Added",
        description: `${formData.name} (ID: ${newEmployeeId}) has been added and recorded.`,
      });
      setAddOpen(false);
      setFormData({ name: "", email: "", mobile: "", role: "Employee", department: "Engineering", passkey: "" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: error.message,
      });
    } finally {
      setIsAdding(false);
    }
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
    if (!editingUser || !formData.name || !formData.email) return;

    setIsEditing(true);
    try {
      const usersRef = collection(db, "users");
      const emailCheck = query(usersRef, where("email", "==", formData.email));
      const emailSnap = await getDocs(emailCheck);
      const isEmailDuplicate = emailSnap.docs.some(d => d.id !== editingUser.id);
      if (isEmailDuplicate) {
        throw new Error("Another user already has this email.");
      }

      if (formData.mobile) {
        const mobileCheck = query(usersRef, where("mobile", "==", formData.mobile));
        const mobileSnap = await getDocs(mobileCheck);
        const isMobileDuplicate = mobileSnap.docs.some(d => d.id !== editingUser.id);
        if (isMobileDuplicate) {
          throw new Error("Another user already has this mobile number.");
        }
      }

      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        department: formData.department,
        passkey: formData.passkey,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "User Updated",
        description: `${formData.name}'s record has been updated.`,
      });
      setEditOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string, targetRole: string, targetEmail: string) => {
    const currentUserEmail = localStorage.getItem('userEmail');
    const currentUserRecord = users.find(u => u.email === currentUserEmail);

    if (currentUserEmail === targetEmail) {
      return toast({
        variant: "destructive",
        title: "Action Restricted",
        description: "You cannot delete your own account.",
      });
    }

    if (targetRole === 'Admin' && currentUserRecord?.createdByEmail === targetEmail) {
      return toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Security Protection: You cannot delete your parent admin account.",
      });
    }

    try {
      await deleteDoc(doc(db, "users", userId));
      toast({
        title: "User Removed",
        description: `${userName} was deleted from Firestore.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.employeeId?.includes(searchTerm) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combine default depts with Firestore depts
  const defaultDepts = ["Engineering", "Marketing", "Sales", "HR", "Operations", "Finance"];
  const allDepts = Array.from(new Set([...defaultDepts, ...departments.map(d => d.name)]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">User Management</h1>
          <p className="text-muted-foreground">Manage employees, default passkeys, and record synchronization.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <Dialog open={deptOpen} onOpenChange={setDeptOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-primary hover:bg-primary/5">
                <Building2 className="h-4 w-4 mr-2" /> Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogDescription>
                  Enter the name of the new department to be added to the selection list.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDepartment} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dept-name">Department Name</Label>
                  <Input 
                    id="dept-name" 
                    value={newDeptName} 
                    onChange={(e) => setNewDeptName(e.target.value)} 
                    placeholder="e.g. Quality Assurance" 
                    required 
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isAddingDept || !newDeptName.trim()} className="w-full">
                    {isAddingDept ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Save Department
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary hover:bg-primary/5"
            onClick={handleGenerateMissingIds}
            disabled={isFixingIds || users.length === 0}
          >
            {isFixingIds ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Generate Missing IDs
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={handleCleanupDuplicates}
            disabled={isCleaning || users.length === 0}
          >
            {isCleaning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Cleanup Duplicates
          </Button>
          
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-sm">
                <UserPlus className="mr-2 h-4 w-4" /> Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Create a new record. A unique Employee ID will be generated automatically.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Full Name</Label>
                  <Input 
                    id="add-name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="John Doe" 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-email">Email Address</Label>
                  <Input 
                    id="add-email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="john@bsa.com" 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-mobile">Mobile Number</Label>
                  <Input 
                    id="add-mobile" 
                    type="tel" 
                    value={formData.mobile} 
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})} 
                    placeholder="+1 (555) 000-0000" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-passkey">Default Passkey</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="add-passkey" 
                      type="text" 
                      className="pl-9"
                      value={formData.passkey} 
                      onChange={(e) => setFormData({...formData, passkey: e.target.value})} 
                      placeholder="TemporaryPassword123" 
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="add-role">Role</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(v) => setFormData({...formData, role: v})}
                    >
                      <SelectTrigger id="add-role"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-dept">Department</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(v) => setFormData({...formData, department: v})}
                    >
                      <SelectTrigger id="add-dept"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {allDepts.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isAdding} className="w-full">
                    {isAdding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Create & Sync"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the details for {editingUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input 
                id="edit-name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="John Doe" 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input 
                id="edit-email" 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                placeholder="john@bsa.com" 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-mobile">Mobile Number</Label>
              <Input 
                id="edit-mobile" 
                type="tel" 
                value={formData.mobile} 
                onChange={(e) => setFormData({...formData, mobile: e.target.value})} 
                placeholder="+1 (555) 000-0000" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-passkey">Passkey (Leave blank to keep current)</Label>
              <Input 
                id="edit-passkey" 
                type="text" 
                value={formData.passkey} 
                onChange={(e) => setFormData({...formData, passkey: e.target.value})} 
                placeholder="Reset passkey if needed" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(v) => setFormData({...formData, role: v})}
                >
                  <SelectTrigger id="edit-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dept">Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(v) => setFormData({...formData, department: v})}
                >
                  <SelectTrigger id="edit-dept"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allDepts.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isEditing} className="w-full">
                {isEditing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Employee Directory</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users or ID..." 
                className="pl-9 bg-background" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow>
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Role & Dept</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://picsum.photos/seed/${user.id}/100`} />
                            <AvatarFallback>{user.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{user.name}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Shield className={`h-3 w-3 ${user.role === 'Admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            {user.employeeId || "Not Set"}
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.mobile && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.mobile}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider w-fit">
                            {user.department}
                          </Badge>
                          {user.requiresChange && (
                            <Badge variant="secondary" className="text-[9px] w-fit">
                              Passkey Reset Pending
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "default" : user.status === "Pending" ? "secondary" : "outline"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendWelcomeMail(user)}>
                                <Mail className="mr-2 h-4 w-4" /> Send Welcome Mail
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteUser(user.id, user.name, user.role, user.email)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete from Firestore
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
                      No users found in Firestore.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
