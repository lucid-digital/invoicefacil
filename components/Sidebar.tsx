'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  RefreshCw,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, businessProfile, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
    },
    {
      name: 'Recurring',
      href: '/recurring-invoices',
      icon: RefreshCw,
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users,
    },
    {
      name: 'Business Profile',
      href: '/business-profile',
      icon: Building,
    }
  ];

  return (
    <div
      className={cn(
        'h-screen bg-card border-r border-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-[70px]' : 'w-[250px]'
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        <div className={cn('flex items-center', collapsed && 'justify-center w-full')}>
          {!collapsed && (
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              Facil<span className="text-foreground">Invoice</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              F<span className="text-foreground">I</span>
            </Link>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('', collapsed && 'absolute -right-9 bg-background border border-border rounded-full')}
        >
          {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon size={20} className={cn('flex-shrink-0', collapsed ? 'mr-0' : 'mr-3')} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className={cn('flex items-center', collapsed && 'justify-center')}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-3 text-muted-foreground hover:text-destructive justify-start"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        )}
        
        {collapsed && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full mt-3 text-muted-foreground hover:text-destructive flex justify-center"
            onClick={handleLogout}
          >
            <LogOut size={16} />
          </Button>
        )}
      </div>
    </div>
  );
} 