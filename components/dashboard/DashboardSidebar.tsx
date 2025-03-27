'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { 
  Home, 
  Upload, 
  BarChart3, 
  Settings, 
  Users, 
  File, 
  HelpCircle, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";

const mainMenuItems = [
  {
    icon: Home,
    label: "Dashboard",
    path: "/dashboard"
  },
  {
    icon: Upload,
    label: "Upload Reports",
    path: "/dashboard/upload"
  },
  {
    icon: File,
    label: "Track Reports",
    path: "/dashboard/reports"
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/dashboard/analytics"
  },
  {
    icon: Users,
    label: "Patients",
    path: "/dashboard/patients"
  }
];

const settingsMenuItems = [
  {
    icon: Settings,
    label: "Settings",
    path: "/dashboard/settings"
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    path: "/dashboard/support"
  }
];

// Memoized menu item to prevent unnecessary re-renders
const MenuItem = memo(({ 
  icon: Icon, 
  label, 
  path, 
  isActive 
}: { 
  icon: React.ElementType; 
  label: string; 
  path: string; 
  isActive: boolean; 
}) => {
  return (
    <Link href={path} prefetch={true}>
      <SidebarMenuItem className={cn(
        "transition-colors flex items-center w-full py-2.5 px-3 rounded-md gap-3 text-[hsl(var(--sidebar-foreground))] font-medium",
        isActive && "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]"
      )}>
        <Icon className={cn(
          "h-5 w-5", 
          isActive && "text-[hsl(var(--sidebar-primary))]"
        )} />
        {label}
      </SidebarMenuItem>
    </Link>
  );
});

MenuItem.displayName = 'MenuItem';

const DashboardSidebar = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    // Exact match for dashboard root
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    
    // For other routes, check if the current path starts with this path
    return pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-[hsl(var(--sidebar-border))] h-screen overflow-hidden bg-[hsl(var(--sidebar-background))]">
      <SidebarHeader className="px-6 py-4 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))]">
        <Link href="/" className="inline-block text-2xl font-bold text-[hsl(var(--sidebar-primary))] hover:opacity-80 transition-opacity">
          VidalSigns
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-2 bg-[hsl(var(--sidebar-background))]">
        <SidebarGroup>
          <SidebarMenu>
            {mainMenuItems.map((item) => (
              <MenuItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={isActive(item.path)}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 mb-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))]">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <MenuItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  isActive={isActive(item.path)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-3 bg-[hsl(var(--sidebar-background))]">
        <Link href="/">
          <button className="flex items-center w-full py-2.5 px-3 rounded-md gap-3 text-[hsl(var(--sidebar-foreground))] transition-colors hover:bg-[hsl(var(--sidebar-accent))]">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
};

export default memo(DashboardSidebar);
