import { Head, router } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, BarChart3, Calendar, Printer, User, Wallet as WalletIcon } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        router.get('/reports/monthly', { month: m, year: y }, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    const monthName = new Date(2026, month - 1, 1).toLocaleString('id-ID', { month: 'long' });

    return (
        <>
            <Head title={`Laporan Keuangan ${monthName} ${year}`} />

            <div className="p-4 md:p-6 space-y-8 max-w-6xl mx-auto print:p-0 print:bg-white print:text-black">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <BarChart3 className="size-6 text-cyan-500" />
                            Laporan Rekapitulasi Keuangan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Laporan lengkap performa keuangan bulanan dan aktivitas anggota keluarga.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1.5 shadow-sm">
                            <Calendar className="size-4 text-muted-foreground ml-2" />
                            <select
                                value={month}
                                onChange={(e) => handleMonthYearChange(Number(e.target.value), year)}
                                className="bg-transparent text-foreground text-sm font-semibold border-none focus:ring-0 cursor-pointer"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m} className="bg-card text-card-foreground">
                                        {new Date(2026, m - 1, 1).toLocaleString('id-ID', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={year}
                                onChange={(e) => handleMonthYearChange(month, Number(e.target.value))}
                                className="bg-transparent text-foreground text-sm font-semibold border-none focus:ring-0 cursor-pointer"
                            >
                                {[2025, 2026, 2027].map((y) => (
                                    <option key={y} value={y} className="bg-card text-card-foreground">
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            type="button"
                            onClick={handlePrint}
                            variant="outline"
                            className="gap-2"
                        >
                            <Printer className="size-4" />
                            Cetak / Print
                        </Button>
                    </div>
                </div>

                {/* Printable Document Title */}
                <div className="hidden print:block text-center mb-6">
                    <h1 className="text-2xl font-bold">Laporan Keuangan Keluarga DompetKita</h1>
                    <p className="text-sm text-gray-600">Periode: {monthName} {year}</p>
                </div>

                {/* Financial Executive Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="shadow-sm border-border p-5 print:border-gray-300 print:bg-gray-50">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-gray-600">Total Income</span>
                        <div className="text-2xl font-black text-blue-500 mt-1 print:text-blue-600">{formatRp(summary.totalIncome)}</div>
                    </Card>

                    <Card className="shadow-sm border-border p-5 print:border-gray-300 print:bg-gray-50">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-gray-600">Total Expense</span>
                        <div className="text-2xl font-black text-rose-500 mt-1 print:text-rose-600">{formatRp(summary.totalExpense)}</div>
                    </Card>

                    <Card className="shadow-sm border-border p-5 print:border-gray-300 print:bg-gray-50">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-gray-600">Net Cash Flow</span>
                        <div className={`text-2xl font-black mt-1 ${summary.netCashFlow >= 0 ? 'text-emerald-500 print:text-emerald-600' : 'text-rose-500'}`}>
                            {formatRp(summary.netCashFlow)}
                        </div>
                    </Card>
                </div>

                {/* Income & Expense Breakdown Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Income Breakdown */}
                    <Card className="shadow-sm border-border p-6 space-y-4 print:border-gray-300 print:bg-white">
                        <h3 className="font-bold text-foreground text-base flex items-center gap-2 print:text-black">
                            <ArrowUpRight className="size-5 text-blue-500" />
                            Rincian Pemasukan ({incomeBreakdown.length})
                        </h3>

                        <div className="space-y-3">
                            {incomeBreakdown.length > 0 ? (
                                incomeBreakdown.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm border-b border-border pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="font-medium text-foreground print:text-black">{item.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono font-bold text-blue-500 print:text-blue-600 block">{formatRp(item.total)}</span>
                                            <span className="text-[10px] text-muted-foreground">{item.percentage}%</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground py-4 text-center">Tidak ada pemasukan pada periode ini.</p>
                            )}
                        </div>
                    </Card>

                    {/* Expense Breakdown */}
                    <Card className="shadow-sm border-border p-6 space-y-4 print:border-gray-300 print:bg-white">
                        <h3 className="font-bold text-foreground text-base flex items-center gap-2 print:text-black">
                            <ArrowDownRight className="size-5 text-rose-500" />
                            Rincian Pengeluaran ({expenseBreakdown.length})
                        </h3>

                        <div className="space-y-3">
                            {expenseBreakdown.length > 0 ? (
                                expenseBreakdown.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm border-b border-border pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="font-medium text-foreground print:text-black">{item.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono font-bold text-rose-500 print:text-rose-600 block">{formatRp(item.total)}</span>
                                            <span className="text-[10px] text-muted-foreground">{item.percentage}%</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground py-4 text-center">Tidak ada pengeluaran pada periode ini.</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Member Activity Breakdown */}
                <Card className="shadow-sm border-border p-6 space-y-4 print:border-gray-300 print:bg-white">
                    <h3 className="font-bold text-foreground text-base flex items-center gap-2 print:text-black">
                        <User className="size-5 text-emerald-500" />
                        Aktivitas Pengeluaran Per Anggota Keluarga
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {memberActivity.map((member, i) => (
                            <div key={i} className="bg-muted/50 p-4 rounded-xl border border-border print:border-gray-300 print:bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-base">
                                        {member.user_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm print:text-black">{member.user_name}</h4>
                                        <p className="text-xs text-muted-foreground">{member.count} Transaksi Pembayaran</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="font-mono font-bold text-rose-500 print:text-black block text-base">
                                        {formatRp(member.total_spent)}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-semibold">{member.percentage}% dari total expense</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Wallets Summary */}
                <Card className="shadow-sm border-border p-6 space-y-4 print:border-gray-300 print:bg-white">
                    <h3 className="font-bold text-foreground text-base flex items-center gap-2 print:text-black">
                        <WalletIcon className="size-5 text-purple-500" />
                        Ringkasan Saldo Wallet
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {wallets.map((w) => (
                            <div key={w.id} className="bg-muted/40 p-3.5 rounded-xl border border-border print:border-gray-200">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">{w.name}</span>
                                <span className="text-lg font-bold font-mono text-foreground mt-1 block print:text-black">
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
