
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Info } from "lucide-react";
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

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Dummy check for admin credentials
      if (username === "admin" && password === "password") {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in as Administrator.",
        });
        router.push("/dashboard/admin");
      } else {
        // Just for demo, allowing other logins but checking for "admin" string to route
        toast({
          title: "Login Successful",
          description: "Welcome to BSA HRFlow.",
        });
        if (username.toLowerCase().includes("admin")) {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/employee");
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              {isLoading ? "Signing in..." : <><LogIn className="mr-2 h-4 w-4" /> Sign In</>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          {/* Sign up section removed */}
        </CardFooter>
      </Card>
    </div>
  );
}
