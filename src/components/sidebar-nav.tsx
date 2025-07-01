'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpenCheck,
  LayoutDashboard,
  Library,
  Layers3,
  Plug,
  Settings2,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scaffolding', label: 'Scaffolding', icon: Layers3 },
  { href: '/components', label: 'Components', icon: Library },
  { href: '/guidance', label: 'Guidance', icon: BookOpenCheck },
  { href: '/plugins', label: 'Plugins', icon: Plug },
  { href: '/configurations', label: 'Configurations', icon: Settings2 },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <SidebarMenuItem key={link.href}>
            <Link href={link.href}>
              <SidebarMenuButton isActive={isActive} tooltip={link.label}>
                <link.icon className={cn(isActive ? 'text-primary' : 'text-muted-foreground')} />
                <span>{link.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
