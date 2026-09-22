import { Head, router } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, BarChart3, Calendar, Printer, User, Wallet as WalletIcon } from 'lucide-react';
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
        router.get('/reports/monthly', { month: m, year: y }, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    const monthName = new Date(2026, month - 1, 1).toLocaleString('id-ID', { month: 'long' });

    return (
        <>
            <Head title={`Laporan Keuangan ${monthName} ${year}`} />

            <div className="p-3 sm:p-6 pb-28 md:pb-8 space-y-4 max-w-6xl mx-auto print:p-0 print:bg-white print:text-black">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 print:hidden">
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <BarChart3 className="size-5 text-cyan-500 shrink-0" />
                            <span className="truncate">Laporan Rekapitulasi Keuangan</span>
                        </h1>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                            Laporan lengkap performa keuangan bulanan dan aktivitas anggota keluarga.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2 py-1 shadow-xs text-xs font-semibold">
                            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                            <select
                                value={month}
                                onChange={(e) => handleMonthYearChange(Number(e.target.value), year)}
                                className="bg-transparent text-foreground text-xs font-semibold border-none focus:ring-0 cursor-pointer p-0"
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
                                className="bg-transparent text-foreground text-xs font-semibold border-none focus:ring-0 cursor-pointer p-0"
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
                            size="sm"
                            className="gap-1.5 h-8 text-xs font-semibold"
                        >
                            <Printer className="size-3.5" />
                            <span className="hidden sm:inline">Cetak / Print</span>
                            <span className="sm:hidden">Print</span>
                        </Button>
                    </div>
                </div>

                {/* Printable Document Title */}
                <div className="hidden print:block text-center mb-6">
                    <h1 className="text-2xl font-bold">Laporan Keuangan Keluarga DompetKita</h1>
                    <p className="text-sm text-gray-600">Periode: {monthName} {year}</p>
                </div>

                {/* Financial Executive Summary Cards */}
                <div className="grid grid-cols-3 gap-2.5">
                    <Card className="shadow-xs border-border p-3 print:border-gray-300 print:bg-gray-50">
                        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-gray-600">Total Income</span>
                        <div className="text-sm sm:text-xl font-black text-blue-500 mt-0.5 truncate print:text-blue-600">{formatRp(summary.totalIncome)}</div>
                    </Card>

                    <Card className="shadow-xs border-border p-3 print:border-gray-300 print:bg-gray-50">
                        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-gray-600">Total Expense</span>
                        <div className="text-sm sm:text-xl font-black text-rose-500 mt-0.5 truncate print:text-rose-600">{formatRp(summary.totalExpense)}</div>
                    </Card>

                    <Card className="shadow-xs border-border p-3 print:border-gray-300 print:bg-gray-50">
                        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-gray-600">Net Cash Flow</span>
                        <div className={`text-sm sm:text-xl font-black mt-0.5 truncate ${summary.netCashFlow >= 0 ? 'text-emerald-500 print:text-emerald-600' : 'text-rose-500'}`}>
                            {formatRp(summary.netCashFlow)}
                        </div>
                    </Card>
                </div>

                {/* Income & Expense Breakdown Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Income Breakdown */}
                    <Card className="shadow-xs border-border p-3.5 sm:p-4 space-y-3 print:border-gray-300 print:bg-white">
                        <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2 print:text-black">
                            <ArrowUpRight className="size-4 text-blue-500" />
                            Rincian Pemasukan ({incomeBreakdown.length})
                        </h3>

                        <div className="space-y-2">
                            {incomeBreakdown.length > 0 ? (
                                incomeBreakdown.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs sm:text-sm border-b border-border pb-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="font-medium text-foreground print:text-black truncate">{item.category}</span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="font-mono font-bold text-blue-500 print:text-blue-600 block text-xs sm:text-sm">{formatRp(item.total)}</span>
                                            <span className="text-[10px] text-muted-foreground">{item.percentage}%</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground py-3 text-center">Tidak ada pemasukan pada periode ini.</p>
                            )}
                        </div>
                    </Card>

                    {/* Expense Breakdown */}
                    <Card className="shadow-xs border-border p-3.5 sm:p-4 space-y-3 print:border-gray-300 print:bg-white">
                        <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2 print:text-black">
                            <ArrowDownRight className="size-4 text-rose-500" />
                            Rincian Pengeluaran ({expenseBreakdown.length})
                        </h3>

                        <div className="space-y-2">
                            {expenseBreakdown.length > 0 ? (
                                expenseBreakdown.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs sm:text-sm border-b border-border pb-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="font-medium text-foreground print:text-black truncate">{item.category}</span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="font-mono font-bold text-rose-500 print:text-rose-600 block text-xs sm:text-sm">{formatRp(item.total)}</span>
                                            <span className="text-[10px] text-muted-foreground">{item.percentage}%</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground py-3 text-center">Tidak ada pengeluaran pada periode ini.</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Member Activity Breakdown */}
                <Card className="shadow-xs border-border p-3.5 sm:p-4 space-y-3 print:border-gray-300 print:bg-white">
                    <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2 print:text-black">
                        <User className="size-4 text-emerald-500" />
                        Aktivitas Pengeluaran Per Anggota Keluarga
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {memberActivity.map((member, i) => (
                            <div key={i} className="bg-muted/50 p-2.5 sm:p-3 rounded-lg border border-border print:border-gray-300 print:bg-gray-50 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="size-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                                        {member.user_name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-foreground text-xs sm:text-sm print:text-black truncate">{member.user_name}</h4>
                                        <p className="text-[11px] text-muted-foreground">{member.count} Transaksi</p>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="font-mono font-bold text-rose-500 print:text-black block text-xs sm:text-sm">
                                        {formatRp(member.total_spent)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-semibold">{member.percentage}% dari total</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Wallets Summary */}
                <Card className="shadow-xs border-border p-3.5 sm:p-4 space-y-3 print:border-gray-300 print:bg-white">
                    <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2 print:text-black">
                        <WalletIcon className="size-4 text-purple-500" />
                        Ringkasan Saldo Wallet
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {wallets.map((w) => (
                            <div key={w.id} className="bg-muted/40 p-2.5 rounded-lg border border-border print:border-gray-200">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block truncate">{w.name}</span>
                                <span className="text-xs sm:text-sm font-bold font-mono text-foreground mt-0.5 block truncate print:text-black">
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
