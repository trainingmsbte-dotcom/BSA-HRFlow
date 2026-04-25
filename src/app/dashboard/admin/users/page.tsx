
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, MoreHorizontal, Mail, Shield, Trash2, Edit2, Loader2, Phone, Key, Table as TableIcon } from "lucide-react";
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
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
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
  name: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  status: string;
  passkey?: string;
  requiresChange?: boolean;
}

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [sheetId, setSheetId] = useState("");
  const { toast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "Employee",
    department: "Engineering",
    passkey: "",
  });

  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    // Load sheet ID from localStorage if exists
    const savedSheetId = localStorage.getItem('google_sheet_id');
    if (savedSheetId) setSheetId(savedSheetId);

    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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

    return () => unsubscribe();
  }, [toast]);

  const handleSaveSheetId = () => {
    localStorage.setItem('google_sheet_id', sheetId);
    toast({
      title: "Settings Saved",
      description: "Google Sheet ID updated for record synchronization.",
    });
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
      // 1. Save to Firestore
      await addDoc(collection(db, "users"), {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        department: formData.department,
        passkey: formData.passkey,
        requiresChange: true,
        status: "Active",
        createdAt: serverTimestamp(),
      });

      // 2. Sync to Google Sheet if configured
      if (sheetId) {
        syncUserToSheet({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          role: formData.role,
          department: formData.department,
          sheetId: sheetId
        }).then(result => {
          if (!result.success) {
            toast({
              variant: "destructive",
              title: "Sheet Sync Failed",
              description: result.message,
            });
          }
        });
      }

      toast({
        title: "User Added",
        description: `${formData.name} has been added and recorded.`,
      });
      setAddOpen(false);
      setFormData({ name: "", email: "", mobile: "", role: "Employee", department: "Engineering", passkey: "" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
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

  const handleDeleteUser = async (userId: string, userName: string) => {
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
    u.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">User Management</h1>
          <p className="text-muted-foreground">Manage employees, default passkeys, and record synchronization.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border shadow-sm">
            <TableIcon className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Google Sheet ID" 
              className="h-8 w-40 border-none focus-visible:ring-0 shadow-none text-xs" 
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
            />
            <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={handleSaveSheetId}>Save</Button>
          </div>
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
                  Create a new record. Data will automatically sync to your shared Google Sheet.
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
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
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
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
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
                placeholder="Search users..." 
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
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" /> Send Welcome Mail
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteUser(user.id, user.name)}
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
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
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
