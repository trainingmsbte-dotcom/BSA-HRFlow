
"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string>("employee");

  useEffect(() => {
    // Access localStorage on the client after hydration
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');
    
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole.toLowerCase());
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar role={userRole as "admin" | "employee"} />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 border-b shrink-0 bg-white">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="hidden md:flex relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search policies..." className="pl-9 bg-muted/30 border-none focus-visible:ring-1" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                </div>
                <Avatar className="h-9 w-9 border shadow-sm cursor-pointer hover:opacity-80">
                  <AvatarImage src={`https://picsum.photos/seed/${userName}/100`} />
                  <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
