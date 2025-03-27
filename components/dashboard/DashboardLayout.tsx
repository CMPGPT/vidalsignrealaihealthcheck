'use client';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode, useState, memo, useCallback } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

// Memoized header component to prevent unnecessary re-renders
const DashboardHeader = memo(function DashboardHeader() {
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const handleNavigation = useCallback((path: string) => {
    setIsDropdownOpen(false);
    router.push(path);
  }, [router]);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between dashboard-header">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="hidden sm:flex items-center relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm w-[220px] focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-primary/10 hover:text-primary active:bg-accent active:text-accent-foreground"
        >
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-primary/10 hover:text-primary active:bg-accent active:text-accent-foreground"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleNavigation('/dashboard/settings?tab=profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleNavigation('/dashboard/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleNavigation('/dashboard/settings?tab=billing')}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleNavigation('/')}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        
        <main className="flex-1 flex flex-col max-w-full overflow-hidden dashboard-layout-main">
          <DashboardHeader />
          
          <div className="p-3 sm:p-6 flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default memo(DashboardLayout);
