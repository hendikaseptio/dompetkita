import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowLeftRight,
    BarChart3,
    Home,
    LayoutGrid,
    LogOut,
    Menu,
    PieChart,
    Settings,
    Tag,
    Wallet,
} from 'lucide-react';
import React, { useState } from 'react';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import type { Auth } from '@/types';
import { PwaInstallMenuItem } from '@/components/pwa-install-button';

export function MobileFloatingDock() {
    const { url, props } = usePage<{ auth: Auth }>();
    const { auth } = props;
    const [openSheet, setOpenSheet] = useState(false);
    const cleanup = useMobileNavigation();

    const mainNavItems = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        { title: 'Transaksi', href: '/transactions', icon: ArrowLeftRight },
        { title: 'Dompet', href: '/wallets', icon: Wallet },
        { title: 'Budget', href: '/budgets', icon: PieChart },
    ];

    const secondaryNavItems = [
        {
            title: 'Kategori',
            href: '/categories',
            icon: Tag,
            desc: 'Kelola jenis pemasukan & pengeluaran',
        },
        {
            title: 'Laporan Bulanan',
            href: '/reports/monthly',
            icon: BarChart3,
            desc: 'Rekap keuangan & aktivitas anggota',
        },
        {
            title: 'Activity Log',
            href: '/activity-log',
            icon: Activity,
            desc: 'Audit log riwayat perubahan',
        },
        {
            title: 'Keluarga Kita',
            href: '/family',
            icon: Home,
            desc: 'Pengaturan rumah tangga & undang pasangan',
        },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard' && (url === '/dashboard' || url === '/'))
            return true;
        return url.startsWith(href) && href !== '/dashboard';
    };

    const isSecondaryActive =
        secondaryNavItems.some((item) => isActive(item.href)) ||
        isActive(editProfile().url) ||
        url.startsWith('/settings');

    const handleLogout = () => {
        setOpenSheet(false);
        cleanup();
        router.post(
            logout().url,
            {},
            {
                onFinish: () => router.flushAll(),
            },
        );
    };

    return (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 md:hidden">
            <nav className="bg-popover/90 border-border/80 ring-border/30 text-popover-foreground flex items-center gap-1.5 rounded-full border px-3 py-2 shadow-xl ring-1 shadow-black/10 backdrop-blur-xl">
                {mainNavItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={`relative flex size-11 items-center justify-center rounded-full transition-all duration-300 ${
                                        active
                                            ? 'bg-primary text-primary-foreground shadow-primary/25 scale-105 shadow-md'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    <Icon className="size-5" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                                {item.title}
                            </TooltipContent>
                        </Tooltip>
                    );
                })}

                {/* More / Secondary Menu Sheet Drawer */}
                <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SheetTrigger asChild>
                                <button
                                    type="button"
                                    className={`flex size-11 items-center justify-center rounded-full transition-all duration-300 ${
                                        isSecondaryActive
                                            ? 'bg-primary text-primary-foreground shadow-primary/25 scale-105 shadow-md'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    <Menu className="size-5" />
                                </button>
                            </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            Menu Lainnya
                        </TooltipContent>
                    </Tooltip>
                    <SheetContent
                        side="bottom"
                        className="bg-popover text-popover-foreground border-border max-h-[85vh] overflow-y-auto rounded-t-3xl border-t p-6 shadow-2xl"
                    >
                        <SheetHeader className="mb-4">
                            <SheetTitle className="text-foreground text-left text-lg font-bold">
                                Menu Lainnya
                            </SheetTitle>
                        </SheetHeader>

                        {/* User Card */}
                        {auth?.user && (
                            <div className="bg-muted/60 border-border mb-4 flex items-center justify-between gap-3 rounded-2xl border p-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <UserInfo
                                        user={auth.user}
                                        showEmail={true}
                                    />
                                </div>
                                <Link
                                    href={editProfile().url}
                                    onClick={() => setOpenSheet(false)}
                                    className="text-muted-foreground hover:text-foreground hover:bg-background hover:border-border shrink-0 rounded-xl border border-transparent p-2 transition-colors"
                                    title="Pengaturan Profil"
                                >
                                    <Settings className="size-5" />
                                </Link>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-2.5">
                            {secondaryNavItems.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpenSheet(false)}
                                        className={`flex items-center gap-3.5 rounded-2xl border p-3 transition-all ${
                                            active
                                                ? 'bg-primary/10 border-primary/30 text-primary'
                                                : 'bg-card border-border text-foreground hover:bg-muted/60'
                                        }`}
                                    >
                                        <div
                                            className={`rounded-xl p-2.5 transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                        >
                                            <Icon className="size-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-foreground text-sm font-semibold">
                                                {item.title}
                                            </h4>
                                            <p className="text-muted-foreground mt-0.5 text-xs">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Account Actions Section */}
                        <div className="border-border mt-3 space-y-2 border-t pt-3">
                            <span className="text-muted-foreground block px-1 text-[11px] font-semibold tracking-wider uppercase">
                                Akun & Pengaturan
                            </span>

                            {/* PWA Mobile Installation */}
                            <PwaInstallMenuItem
                                onAction={() => setOpenSheet(false)}
                            />

                            <Link
                                href={editProfile().url}
                                onClick={() => setOpenSheet(false)}
                                className={`flex items-center gap-3.5 rounded-2xl border p-3 transition-all ${
                                    url.startsWith('/settings')
                                        ? 'bg-primary/10 border-primary/30 text-primary'
                                        : 'bg-card border-border text-foreground hover:bg-muted/60'
                                }`}
                            >
                                <div
                                    className={`rounded-xl p-2.5 transition-colors ${url.startsWith('/settings') ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                >
                                    <Settings className="size-5" />
                                </div>
                                <div>
                                    <h4 className="text-foreground text-sm font-semibold">
                                        Pengaturan Akun
                                    </h4>
                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        Profil, kata sandi, dan keamanan
                                    </p>
                                </div>
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border p-3 text-left transition-all"
                            >
                                <div className="text-destructive-foreground rounded-xl p-2.5">
                                    <LogOut className="size-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold">
                                        Keluar (Log Out)
                                    </h4>
                                    <p className="text-destructive/80 mt-0.5 text-xs">
                                        Akhiri sesi di perangkat ini
                                    </p>
                                </div>
                            </button>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    );
}
