import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowLeftRight,
    BarChart3,
    Home,
    LayoutGrid,
    Menu,
    PieChart,
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

export function MobileFloatingDock() {
    const { url } = usePage();
    const [openSheet, setOpenSheet] = useState(false);

    const mainNavItems = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        { title: 'Transaksi', href: '/transactions', icon: ArrowLeftRight },
        { title: 'Dompet', href: '/wallets', icon: Wallet },
        { title: 'Budget', href: '/budgets', icon: PieChart },
    ];

    const secondaryNavItems = [
        { title: 'Kategori', href: '/categories', icon: Tag, desc: 'Kelola jenis pemasukan & pengeluaran' },
        { title: 'Laporan Bulanan', href: '/reports/monthly', icon: BarChart3, desc: 'Rekap keuangan & aktivitas anggota' },
        { title: 'Activity Log', href: '/activity-log', icon: Activity, desc: 'Audit log riwayat perubahan' },
        { title: 'Keluarga Kita', href: '/family', icon: Home, desc: 'Pengaturan rumah tangga & undang pasangan' },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard' && (url === '/dashboard' || url === '/')) return true;
        return url.startsWith(href) && href !== '/dashboard';
    };

    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden">
            <nav className="bg-popover/90 backdrop-blur-xl border border-border/80 rounded-full px-3 py-2 flex items-center gap-1.5 shadow-xl shadow-black/10 ring-1 ring-border/30 text-popover-foreground">
                {mainNavItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={`relative flex items-center justify-center size-11 rounded-full transition-all duration-300 ${
                                        active
                                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
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
                                    className={`flex items-center justify-center size-11 rounded-full transition-all duration-300 ${
                                        secondaryNavItems.some((item) => isActive(item.href))
                                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
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
                    <SheetContent side="bottom" className="bg-popover text-popover-foreground border-t border-border rounded-t-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
                        <SheetHeader className="mb-4">
                            <SheetTitle className="text-foreground text-left text-lg font-bold">
                                Menu Lainnya
                            </SheetTitle>
                        </SheetHeader>

                        <div className="grid grid-cols-1 gap-2.5">
                            {secondaryNavItems.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpenSheet(false)}
                                        className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                                            active
                                                ? 'bg-primary/10 border-primary/30 text-primary'
                                                : 'bg-card border-border text-foreground hover:bg-muted/60'
                                        }`}
                                    >
                                        <div className={`p-2.5 rounded-xl transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            <Icon className="size-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    );
}

