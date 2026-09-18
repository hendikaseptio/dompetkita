import { Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeftRight,
    BarChart3,
    Home,
    LayoutGrid,
    PieChart,
    Tag,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Transaksi',
        href: '/transactions',
        icon: ArrowLeftRight,
    },
    {
        title: 'Dompet / Wallet',
        href: '/wallets',
        icon: Wallet,
    },
    {
        title: 'Budget',
        href: '/budgets',
        icon: PieChart,
    },
    {
        title: 'Kategori',
        href: '/categories',
        icon: Tag,
    },
    {
        title: 'Laporan Bulanan',
        href: '/reports/monthly',
        icon: BarChart3,
    },
    {
        title: 'Activity Log',
        href: '/activity-log',
        icon: Activity,
    },
    {
        title: 'Keluarga Kita',
        href: '/family',
        icon: Home,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
