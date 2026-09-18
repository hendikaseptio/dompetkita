import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    PieChart as PieIcon,
    Plus,
    Receipt,
    TrendingDown,
    TrendingUp,
    Wallet as WalletIcon,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateHuman, formatRp } from '@/lib/formatters';

interface Wallet {
    id: number;
    name: string;
    type: string;
    balance: string;
}

interface Transaction {
    id: number;
    type: 'income' | 'expense' | 'transfer';
    amount: string;
    transaction_date: string;
    note: string | null;
    creator?: { name: string };
    payer?: { name: string };
    category?: { name: string; color: string | null };
    wallet_from?: { name: string };
    wallet_to?: { name: string };
}

interface DashboardProps {
    family: { id: number; name: string };
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    totalBudgetLimit: number;
    remainingBudget: number;
    wallets: Wallet[];
    recentTransactions: Transaction[];
    charts: {
        expenseByCategory: { category: string; color: string; total: number; percentage: number }[];
        incomeVsExpense: { month: string; income: number; expense: number }[];
        dailyExpense: { date: string; total: number }[];
    };
}

export default function Dashboard({
    family,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    totalBudgetLimit,
    remainingBudget,
    wallets,
    recentTransactions,
    charts,
}: DashboardProps) {
    return (
        <>
            <Head title="Dashboard Keuangan" />

            <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
                {/* Header Welcome Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <span>Keluarga {family.name}</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ringkasan performa & kesehatan keuangan bersama bulan {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button asChild className="font-bold gap-2 shadow-sm">
                            <Link href="/transactions">
                                <Plus className="size-4" />
                                Tambah Transaksi
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 4 Executive Summary Cards using Shadcn Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Uang */}
                    <Card className="shadow-sm border-border hover:border-emerald-500/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Saldo Wallet
                            </CardTitle>
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                <WalletIcon className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold text-foreground tracking-tight">{formatRp(totalBalance)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Gabungan dari {wallets.length} dompet</p>
                        </CardContent>
                    </Card>

                    {/* Monthly Income */}
                    <Card className="shadow-sm border-border hover:border-blue-500/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Pemasukan Bulan Ini
                            </CardTitle>
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                                <TrendingUp className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold text-blue-500 tracking-tight">{formatRp(monthlyIncome)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total uang masuk keluarga</p>
                        </CardContent>
                    </Card>

                    {/* Monthly Expense */}
                    <Card className="shadow-sm border-border hover:border-rose-500/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Pengeluaran Bulan Ini
                            </CardTitle>
                            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                                <TrendingDown className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold text-rose-500 tracking-tight">{formatRp(monthlyExpense)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total belanja & biaya hidup</p>
                        </CardContent>
                    </Card>

                    {/* Remaining Budget */}
                    <Card className="shadow-sm border-border hover:border-purple-500/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Sisa Limit Budget
                            </CardTitle>
                            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                                <PieIcon className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold text-purple-500 tracking-tight">{formatRp(remainingBudget)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Dari total limit {formatRp(totalBudgetLimit)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Expense by Category Breakdown */}
                    <Card className="shadow-sm border-border flex flex-col justify-between">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <PieIcon className="size-4 text-emerald-500" />
                                    Distribusi Pengeluaran
                                </CardTitle>
                                <span className="text-xs text-muted-foreground">Bulan Ini</span>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {charts.expenseByCategory.length > 0 ? (
                                <div className="space-y-3.5">
                                    {charts.expenseByCategory.map((item, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-foreground flex items-center gap-2">
                                                    <span
                                                        className="size-2.5 rounded-full"
                                                        style={{ backgroundColor: item.color || '#10B981' }}
                                                    />
                                                    {item.category}
                                                </span>
                                                <span className="text-muted-foreground font-mono">
                                                    {formatRp(item.total)} ({item.percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${item.percentage}%`,
                                                        backgroundColor: item.color || '#10B981',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-muted-foreground text-sm">
                                    Belum ada transaksi pengeluaran bulan ini.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Income vs Expense Bar Graphic */}
                    <Card className="shadow-sm border-border lg:col-span-2 flex flex-col justify-between">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <BarChart3 className="size-4 text-blue-500" />
                                    Perbandingan Income vs Expense (6 Bulan)
                                </CardTitle>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                    <span className="flex items-center gap-1.5 text-blue-500">
                                        <span className="size-2.5 bg-blue-500 rounded-sm" /> Income
                                    </span>
                                    <span className="flex items-center gap-1.5 text-rose-500">
                                        <span className="size-2.5 bg-rose-500 rounded-sm" /> Expense
                                    </span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="h-60 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-border">
                                {charts.incomeVsExpense.map((bar, i) => {
                                    const maxVal = Math.max(
                                        ...charts.incomeVsExpense.map((b) => Math.max(b.income, b.expense)),
                                        1
                                    );
                                    const incPct = Math.round((bar.income / maxVal) * 100);
                                    const expPct = Math.round((bar.expense / maxVal) * 100);

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                            <div className="w-full flex items-end justify-center gap-1.5 h-full">
                                                {/* Income Bar */}
                                                <div
                                                    className="w-1/2 max-w-[20px] bg-blue-500 hover:bg-blue-400 rounded-t-md transition-all relative group"
                                                    style={{ height: `${Math.max(incPct, 4)}%` }}
                                                >
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border text-[10px] text-popover-foreground px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                                                        {formatRp(bar.income)}
                                                    </div>
                                                </div>
                                                {/* Expense Bar */}
                                                <div
                                                    className="w-1/2 max-w-[20px] bg-rose-500 hover:bg-rose-400 rounded-t-md transition-all relative group"
                                                    style={{ height: `${Math.max(expPct, 4)}%` }}
                                                >
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border text-[10px] text-popover-foreground px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                                                        {formatRp(bar.expense)}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground font-medium truncate w-full text-center">
                                                {bar.month}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Wallets Overview & Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Wallets Summary Card */}
                    <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base font-bold">Dompet Keuangan</CardTitle>
                            <Link href="/wallets" className="text-xs text-primary hover:underline">
                                Lihat Semua &rarr;
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {wallets.map((w) => (
                                <div key={w.id} className="bg-muted/50 p-3.5 rounded-xl border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-background border border-border text-emerald-500 rounded-lg">
                                            <WalletIcon className="size-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground">{w.name}</h4>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{w.type}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-foreground font-mono">{formatRp(Number(w.balance))}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Transactions List with Human Readable Dates */}
                    <Card className="shadow-sm border-border lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base font-bold">Transaksi Terakhir</CardTitle>
                            <Link href="/transactions" className="text-xs text-primary hover:underline">
                                Semua Transaksi &rarr;
                            </Link>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((tx) => (
                                    <div key={tx.id} className="bg-muted/40 hover:bg-muted/80 p-3.5 rounded-xl border border-border flex items-center justify-between transition-all">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`p-2.5 rounded-xl ${
                                                    tx.type === 'income'
                                                        ? 'bg-blue-500/10 text-blue-500'
                                                        : tx.type === 'expense'
                                                        ? 'bg-rose-500/10 text-rose-500'
                                                        : 'bg-amber-500/10 text-amber-500'
                                                }`}
                                            >
                                                {tx.type === 'income' ? (
                                                    <ArrowUpRight className="size-4" />
                                                ) : tx.type === 'expense' ? (
                                                    <ArrowDownRight className="size-4" />
                                                ) : (
                                                    <Receipt className="size-4" />
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {tx.category?.name || (tx.type === 'transfer' ? 'Transfer Wallet' : 'Transaksi')}
                                                    </span>
                                                    {tx.payer?.name && (
                                                        <Badge variant="outline" className="text-[10px] font-normal">
                                                            {tx.payer.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {tx.note || (tx.type === 'transfer' ? `${tx.wallet_from?.name} \u2192 ${tx.wallet_to?.name}` : formatDateHuman(tx.transaction_date))}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span
                                                className={`text-sm font-bold font-mono ${
                                                    tx.type === 'income'
                                                        ? 'text-blue-500'
                                                        : tx.type === 'expense'
                                                        ? 'text-rose-500'
                                                        : 'text-amber-500'
                                                }`}
                                            >
                                                {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                                {formatRp(Number(tx.amount))}
                                            </span>
                                            <p className="text-[10px] text-muted-foreground">{formatDateHuman(tx.transaction_date)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-muted-foreground text-sm">Belum ada transaksi tercatat.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
