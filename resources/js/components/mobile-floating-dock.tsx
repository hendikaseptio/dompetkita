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
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

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
            <nav className="bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 rounded-full px-3 py-2 flex items-center gap-1.5 shadow-2xl shadow-slate-950/80 ring-1 ring-white/10">
                {mainNavItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center justify-center size-11 rounded-full transition-all duration-300 ${
                                active
                                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                        >
                            <Icon className="size-5" />
                        </Link>
                    );
                })}

                {/* More / Secondary Menu Sheet Drawer */}
                <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                    <SheetTrigger asChild>
                        <button
                            type="button"
                            className={`flex items-center justify-center size-11 rounded-full transition-all duration-300 ${
                                secondaryNavItems.some((item) => isActive(item.href))
                                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                        >
                            <Menu className="size-5" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 text-white rounded-t-3xl p-6">
                        <SheetHeader className="mb-4">
                            <SheetTitle className="text-white text-left text-lg font-bold flex items-center justify-between">
                                Menu Lainnya
                            </SheetTitle>
                        </SheetHeader>

                        <div className="grid grid-cols-1 gap-3">
                            {secondaryNavItems.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpenSheet(false)}
                                        className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
                                            active
                                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                                : 'bg-slate-800/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${active ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                                            <Icon className="size-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
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
