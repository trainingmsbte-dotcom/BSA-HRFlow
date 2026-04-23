
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Info, ShieldAlert, KeyRound, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Passkey Change State
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [newPasskey, setNewPasskey] = useState("");
  const [confirmPasskey, setConfirmPasskey] = useState("");
  const [currentUserDocId, setCurrentUserDocId] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Check hardcoded admin fallback
      if (username === "admin" && password === "password") {
        toast({
          title: "Admin Sign In",
          description: "Accessing Administrator Dashboard.",
        });
        router.push("/dashboard/admin");
        return;
      }

      // 2. Query Firestore for user
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Try querying by name if email didn't match
        const q2 = query(usersRef, where("name", "==", username));
        const querySnapshot2 = await getDocs(q2);
        
        if (querySnapshot2.empty) {
          throw new Error("Invalid username or password.");
        }
        
        verifyUser(querySnapshot2.docs[0]);
      } else {
        verifyUser(querySnapshot.docs[0]);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  const verifyUser = (userDoc: any) => {
    const userData = userDoc.data();
    
    if (userData.passkey === password) {
      if (userData.requiresChange) {
        setIsFirstLogin(true);
        setCurrentUserDocId(userDoc.id);
        setIsLoading(false);
        toast({
          title: "Security Update",
          description: "First-time login detected. Please set a new passkey.",
        });
      } else {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.name}!`,
        });
        if (userData.role === "Admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/employee");
        }
      }
    } else {
      throw new Error("Invalid username or password.");
    }
  };

  const handlePasskeyChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserDocId) return;
    
    if (newPasskey !== confirmPasskey) {
      return toast({
        variant: "destructive",
        title: "Error",
        description: "Passkeys do not match.",
      });
    }

    if (newPasskey.length < 6) {
      return toast({
        variant: "destructive",
        title: "Weak Passkey",
        description: "New passkey must be at least 6 characters long.",
      });
    }

    setIsLoading(true);
    try {
      const userRef = doc(db, "users", currentUserDocId);
      await updateDoc(userRef, {
        passkey: newPasskey,
        requiresChange: false,
        lastPasskeyChange: serverTimestamp(),
      });
      
      toast({
        title: "Passkey Updated",
        description: "Your security credentials have been updated successfully.",
      });
      
      // Fetch updated data to determine routing
      // For simplicity, we'll just redirect to employee dashboard as most users are employees
      // or we can store the role in state
      router.push("/dashboard/employee");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  if (isFirstLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white font-bold">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Set New Passkey</CardTitle>
            <CardDescription>To protect your account, please update the default passkey provided by your admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasskeyChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-passkey">New Passkey</Label>
                <Input 
                  id="new-passkey" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={newPasskey}
                  onChange={(e) => setNewPasskey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-passkey">Confirm New Passkey</Label>
                <Input 
                  id="confirm-passkey" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  value={confirmPasskey}
                  onChange={(e) => setConfirmPasskey(e.target.value)}
                />
              </div>
              <Button className="w-full bg-accent hover:bg-accent/90" type="submit" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : <><KeyRound className="mr-2 h-4 w-4" /> Update and Continue</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl">IF</div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Login to BSA HRFlow</CardTitle>
          <CardDescription>Enter your credentials to access your portal</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert variant="default" className="bg-primary/5 border-primary/20 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs text-muted-foreground">
              Demo Credentials:<br />
              <span className="font-bold">Username:</span> admin / <span className="font-bold">Password:</span> password
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="admin" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="text-sm text-primary hover:underline font-medium">Forgot password?</button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription className="text-base pt-2">
                        To reset password please contact with Admin.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end">
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Close
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : <><LogIn className="mr-2 h-4 w-4" /> Sign In</>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
        </CardFooter>
      </Card>
    </div>
  );
}
