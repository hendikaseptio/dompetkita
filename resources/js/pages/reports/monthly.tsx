import { Head, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Calendar,
    Printer,
    User,
    Wallet as WalletIcon,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatRp } from '@/lib/formatters';

interface BreakdownItem {
    category: string;
    color: string;
    total: number;
    percentage: number;
}

interface WalletItem {
    id: number;
    name: string;
    type: string;
    balance: string;
}

interface MemberActivityItem {
    user_name: string;
    total_spent: number;
    count: number;
    percentage: number;
}

interface MonthlyReportProps {
    month: number;
    year: number;
    summary: {
        totalIncome: number;
        totalExpense: number;
        netCashFlow: number;
    };
    incomeBreakdown: BreakdownItem[];
    expenseBreakdown: BreakdownItem[];
    wallets: WalletItem[];
    memberActivity: MemberActivityItem[];
}

export default function MonthlyReport({
    month,
    year,
    summary,
    incomeBreakdown,
    expenseBreakdown,
    wallets,
    memberActivity,
}: MonthlyReportProps) {
    const handleMonthYearChange = (m: number, y: number) => {
        router.get(
            '/reports/monthly',
            { month: m, year: y },
            { preserveState: true },
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const monthName = new Date(2026, month - 1, 1).toLocaleString('id-ID', {
        month: 'long',
    });

    return (
        <>
            <Head title={`Laporan Keuangan ${monthName} ${year}`} />

            <div className="mx-auto max-w-6xl space-y-4 p-3 pb-28 sm:p-6 md:pb-8 print:bg-white print:p-0 print:text-black">
                {/* Header & Controls */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <div className="min-w-0">
                        <h1 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl">
                            <BarChart3 className="size-5 shrink-0 text-cyan-500" />
                            <span className="truncate">
                                Laporan Rekapitulasi Keuangan
                            </span>
                        </h1>
                        <p className="text-muted-foreground hidden text-xs sm:block">
                            Laporan lengkap performa keuangan bulanan dan
                            aktivitas anggota keluarga.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                        <div className="bg-card border-border flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold shadow-xs">
                            <Calendar className="text-muted-foreground size-3.5 shrink-0" />
                            <select
                                value={month}
                                onChange={(e) =>
                                    handleMonthYearChange(
                                        Number(e.target.value),
                                        year,
                                    )
                                }
                                className="text-foreground cursor-pointer border-none bg-transparent p-0 text-xs font-semibold focus:ring-0"
                            >
                                {Array.from(
                                    { length: 12 },
                                    (_, i) => i + 1,
                                ).map((m) => (
                                    <option
                                        key={m}
                                        value={m}
                                        className="bg-card text-card-foreground"
                                    >
                                        {new Date(
                                            2026,
                                            m - 1,
                                            1,
                                        ).toLocaleString('id-ID', {
                                            month: 'long',
                                        })}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={year}
                                onChange={(e) =>
                                    handleMonthYearChange(
                                        month,
                                        Number(e.target.value),
                                    )
                                }
                                className="text-foreground cursor-pointer border-none bg-transparent p-0 text-xs font-semibold focus:ring-0"
                            >
                                {[2025, 2026, 2027].map((y) => (
                                    <option
                                        key={y}
                                        value={y}
                                        className="bg-card text-card-foreground"
                                    >
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            type="button"
                            onClick={handlePrint}
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-semibold"
                        >
                            <Printer className="size-3.5" />
                            <span className="hidden sm:inline">
                                Cetak / Print
                            </span>
                            <span className="sm:hidden">Print</span>
                        </Button>
                    </div>
                </div>

                {/* Printable Document Title */}
                <div className="mb-6 hidden text-center print:block">
                    <h1 className="text-2xl font-bold">
                        Laporan Keuangan Keluarga DompetKita
                    </h1>
                    <p className="text-sm text-gray-600">
                        Periode: {monthName} {year}
                    </p>
                </div>

                {/* Financial Executive Summary Cards */}
                <div className="grid grid-cols-3 gap-2.5">
                    <Card className="border-border p-3 shadow-xs print:border-gray-300 print:bg-gray-50">
                        <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase sm:text-xs print:text-gray-600">
                            Total Income
                        </span>
                        <div className="mt-0.5 truncate text-sm font-black text-blue-500 sm:text-xl print:text-blue-600">
                            {formatRp(summary.totalIncome)}
                        </div>
                    </Card>

                    <Card className="border-border p-3 shadow-xs print:border-gray-300 print:bg-gray-50">
                        <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase sm:text-xs print:text-gray-600">
                            Total Expense
                        </span>
                        <div className="mt-0.5 truncate text-sm font-black text-rose-500 sm:text-xl print:text-rose-600">
                            {formatRp(summary.totalExpense)}
                        </div>
                    </Card>

                    <Card className="border-border p-3 shadow-xs print:border-gray-300 print:bg-gray-50">
                        <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase sm:text-xs print:text-gray-600">
                            Net Cash Flow
                        </span>
                        <div
                            className={`mt-0.5 truncate text-sm font-black sm:text-xl ${summary.netCashFlow >= 0 ? 'text-emerald-500 print:text-emerald-600' : 'text-rose-500'}`}
                        >
                            {formatRp(summary.netCashFlow)}
                        </div>
                    </Card>
                </div>

                {/* Income & Expense Breakdown Tables */}
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                    {/* Income Breakdown */}
                    <Card className="border-border space-y-3 p-3.5 shadow-xs sm:p-4 print:border-gray-300 print:bg-white">
                        <h3 className="text-foreground flex items-center gap-2 text-sm font-bold sm:text-base print:text-black">
                            <ArrowUpRight className="size-4 text-blue-500" />
                            Rincian Pemasukan ({incomeBreakdown.length})
                        </h3>

                        <div className="space-y-2">
                            {incomeBreakdown.length > 0 ? (
                                incomeBreakdown.map((item, i) => (
                                    <div
                                        key={i}
                                        className="border-border flex items-center justify-between border-b pb-1.5 text-xs sm:text-sm"
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span
                                                className="size-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor: item.color,
                                                }}
                                            />
                                            <span className="text-foreground truncate font-medium print:text-black">
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="block font-mono text-xs font-bold text-blue-500 sm:text-sm print:text-blue-600">
                                                {formatRp(item.total)}
                                            </span>
                                            <span className="text-muted-foreground text-[10px]">
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground py-3 text-center text-xs">
                                    Tidak ada pemasukan pada periode ini.
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Expense Breakdown */}
                    <Card className="border-border space-y-3 p-3.5 shadow-xs sm:p-4 print:border-gray-300 print:bg-white">
                        <h3 className="text-foreground flex items-center gap-2 text-sm font-bold sm:text-base print:text-black">
                            <ArrowDownRight className="size-4 text-rose-500" />
                            Rincian Pengeluaran ({expenseBreakdown.length})
                        </h3>

                        <div className="space-y-2">
                            {expenseBreakdown.length > 0 ? (
                                expenseBreakdown.map((item, i) => (
                                    <div
                                        key={i}
                                        className="border-border flex items-center justify-between border-b pb-1.5 text-xs sm:text-sm"
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span
                                                className="size-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor: item.color,
                                                }}
                                            />
                                            <span className="text-foreground truncate font-medium print:text-black">
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="block font-mono text-xs font-bold text-rose-500 sm:text-sm print:text-rose-600">
                                                {formatRp(item.total)}
                                            </span>
                                            <span className="text-muted-foreground text-[10px]">
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground py-3 text-center text-xs">
                                    Tidak ada pengeluaran pada periode ini.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Member Activity Breakdown */}
                <Card className="border-border space-y-3 p-3.5 shadow-xs sm:p-4 print:border-gray-300 print:bg-white">
                    <h3 className="text-foreground flex items-center gap-2 text-sm font-bold sm:text-base print:text-black">
                        <User className="size-4 text-emerald-500" />
                        Aktivitas Pengeluaran Per Anggota Keluarga
                    </h3>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {memberActivity.map((member, i) => (
                            <div
                                key={i}
                                className="bg-muted/50 border-border flex items-center justify-between gap-2 rounded-lg border p-2.5 sm:p-3 print:border-gray-300 print:bg-gray-50"
                            >
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-500">
                                        {member.user_name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-foreground truncate text-xs font-bold sm:text-sm print:text-black">
                                            {member.user_name}
                                        </h4>
                                        <p className="text-muted-foreground text-[11px]">
                                            {member.count} Transaksi
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0 text-right">
                                    <span className="block font-mono text-xs font-bold text-rose-500 sm:text-sm print:text-black">
                                        {formatRp(member.total_spent)}
                                    </span>
                                    <span className="text-muted-foreground text-[10px] font-semibold">
                                        {member.percentage}% dari total
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Wallets Summary */}
                <Card className="border-border space-y-3 p-3.5 shadow-xs sm:p-4 print:border-gray-300 print:bg-white">
                    <h3 className="text-foreground flex items-center gap-2 text-sm font-bold sm:text-base print:text-black">
                        <WalletIcon className="size-4 text-purple-500" />
                        Ringkasan Saldo Wallet
                    </h3>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {wallets.map((w) => (
                            <div
                                key={w.id}
                                className="bg-muted/40 border-border rounded-lg border p-2.5 print:border-gray-200"
                            >
                                <span className="text-muted-foreground block truncate text-[10px] tracking-wider uppercase">
                                    {w.name}
                                </span>
                                <span className="text-foreground mt-0.5 block truncate font-mono text-xs font-bold sm:text-sm print:text-black">
                                    {formatRp(Number(w.balance))}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </>
    );
}
