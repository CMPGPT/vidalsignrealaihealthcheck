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
  SidebarMenuItem,
  SidebarProvider
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Settings, 
  QrCode, 
  Building2, 
  Home,
  LogOut,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { FC } from 'react';

// Main menu items definition
const mainMenuItems = [
  {
    icon: Home,
    label: "Overview",
    path: "/admin"
  },
  {
    icon: QrCode,
    label: "QR Codes",
    path: "/admin/qrcodes"
  },
  {
    icon: Building2,
    label: "Partners",
    path: "/admin/partners"
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/admin/analytics"
  }
];

const settingsMenuItems = [
  {
    icon: Settings,
    label: "Settings",
    path: "/admin/settings"
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    path: "/admin/help"
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

// Main AdminSidebar component
const AdminSidebar: FC = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    // Exact match for admin root
    if (path === "/admin") {
      return pathname === "/admin";
    }
    
    // For other routes, check if the current path starts with this path
    return pathname.startsWith(path);
  };

  return (
    <>
      <SidebarProvider>
        <Sidebar 
          className="border-r border-[hsl(var(--sidebar-border))] h-screen overflow-hidden bg-[hsl(var(--sidebar-background))]"
          collapsible="offcanvas"
        >
          <SidebarHeader className="px-6 py-4 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] relative">
            <Link href="/" className="inline-block text-2xl font-bold text-[hsl(var(--sidebar-primary))] hover:opacity-80 transition-opacity">
              VidalSigns Admin
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
          
          <SidebarFooter className="p-3 mt-auto bg-[hsl(var(--sidebar-background))] border-t border-[hsl(var(--sidebar-border))]">
            <Link href="/">
              <button className="flex items-center w-full py-2.5 px-3 rounded-md gap-3 text-[hsl(var(--sidebar-foreground))] transition-colors hover:bg-[hsl(var(--sidebar-accent))]">
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </Link>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </>
  );
};

export default memo(AdminSidebar); 