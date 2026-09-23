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
import { CategoryIcon } from '@/components/category-icon';
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
    category?: { name: string; color: string | null; icon: string | null };
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
        expenseByCategory: {
            category: string;
            color: string;
            total: number;
            percentage: number;
        }[];
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

            <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <span>Keluarga {family.name}</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Ringkasan performa & kesehatan keuangan bersama
                            bulan{' '}
                            {new Date().toLocaleString('id-ID', {
                                month: 'long',
                                year: 'numeric',
                            })}
                            .
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button asChild className="gap-2 font-bold shadow-sm">
                            <Link href="/transactions">
                                <Plus className="size-4" />
                                Tambah Transaksi
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 4 Executive Summary Cards using Shadcn Card */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Uang */}
                    <Card className="border-border shadow-sm transition-all hover:border-emerald-500/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Total Saldo Wallet
                            </CardTitle>
                            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
                                <WalletIcon className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-foreground text-2xl font-extrabold tracking-tight">
                                {formatRp(totalBalance)}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Gabungan dari {wallets.length} dompet
                            </p>
                        </CardContent>
                    </Card>

                    {/* Monthly Income */}
                    <Card className="border-border shadow-sm transition-all hover:border-blue-500/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Pemasukan Bulan Ini
                            </CardTitle>
                            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-500">
                                <TrendingUp className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold tracking-tight text-blue-500">
                                {formatRp(monthlyIncome)}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Total uang masuk keluarga
                            </p>
                        </CardContent>
                    </Card>

                    {/* Monthly Expense */}
                    <Card className="border-border shadow-sm transition-all hover:border-rose-500/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Pengeluaran Bulan Ini
                            </CardTitle>
                            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-500">
                                <TrendingDown className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold tracking-tight text-rose-500">
                                {formatRp(monthlyExpense)}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Total belanja & biaya hidup
                            </p>
                        </CardContent>
                    </Card>

                    {/* Remaining Budget */}
                    <Card className="border-border shadow-sm transition-all hover:border-purple-500/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Sisa Limit Budget
                            </CardTitle>
                            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-500">
                                <PieIcon className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold tracking-tight text-purple-500">
                                {formatRp(remainingBudget)}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Dari total limit {formatRp(totalBudgetLimit)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Expense by Category Breakdown */}
                    <Card className="border-border flex flex-col justify-between shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base font-bold">
                                    <PieIcon className="size-4 text-emerald-500" />
                                    Distribusi Pengeluaran
                                </CardTitle>
                                <span className="text-muted-foreground text-xs">
                                    Bulan Ini
                                </span>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {charts.expenseByCategory.length > 0 ? (
                                <div className="space-y-3.5">
                                    {charts.expenseByCategory.map(
                                        (item, idx) => (
                                            <div
                                                key={idx}
                                                className="space-y-1"
                                            >
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-foreground flex items-center gap-2">
                                                        <span
                                                            className="size-2.5 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    item.color ||
                                                                    '#10B981',
                                                            }}
                                                        />
                                                        {item.category}
                                                    </span>
                                                    <span className="text-muted-foreground font-mono">
                                                        {formatRp(item.total)} (
                                                        {item.percentage}%)
                                                    </span>
                                                </div>
                                                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${item.percentage}%`,
                                                            backgroundColor:
                                                                item.color ||
                                                                '#10B981',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="text-muted-foreground py-12 text-center text-sm">
                                    Belum ada transaksi pengeluaran bulan ini.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Income vs Expense Bar Graphic */}
                    <Card className="border-border flex flex-col justify-between shadow-sm lg:col-span-2">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base font-bold">
                                    <BarChart3 className="size-4 text-blue-500" />
                                    Perbandingan Income vs Expense (6 Bulan)
                                </CardTitle>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                    <span className="flex items-center gap-1.5 text-blue-500">
                                        <span className="size-2.5 rounded-sm bg-blue-500" />{' '}
                                        Income
                                    </span>
                                    <span className="flex items-center gap-1.5 text-rose-500">
                                        <span className="size-2.5 rounded-sm bg-rose-500" />{' '}
                                        Expense
                                    </span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="border-border flex h-60 items-end justify-between gap-2 border-b pt-6 pb-2">
                                {charts.incomeVsExpense.map((bar, i) => {
                                    const maxVal = Math.max(
                                        ...charts.incomeVsExpense.map((b) =>
                                            Math.max(b.income, b.expense),
                                        ),
                                        1,
                                    );
                                    const incPct = Math.round(
                                        (bar.income / maxVal) * 100,
                                    );
                                    const expPct = Math.round(
                                        (bar.expense / maxVal) * 100,
                                    );

                                    return (
                                        <div
                                            key={i}
                                            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                                        >
                                            <div className="flex h-full w-full items-end justify-center gap-1.5">
                                                {/* Income Bar */}
                                                <div
                                                    className="group relative w-1/2 max-w-[20px] rounded-t-md bg-blue-500 transition-all hover:bg-blue-400"
                                                    style={{
                                                        height: `${Math.max(incPct, 4)}%`,
                                                    }}
                                                >
                                                    <div className="bg-popover border-border text-popover-foreground pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 rounded border px-2 py-0.5 text-[10px] whitespace-nowrap opacity-0 shadow transition-opacity group-hover:opacity-100">
                                                        {formatRp(bar.income)}
                                                    </div>
                                                </div>
                                                {/* Expense Bar */}
                                                <div
                                                    className="group relative w-1/2 max-w-[20px] rounded-t-md bg-rose-500 transition-all hover:bg-rose-400"
                                                    style={{
                                                        height: `${Math.max(expPct, 4)}%`,
                                                    }}
                                                >
                                                    <div className="bg-popover border-border text-popover-foreground pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 rounded border px-2 py-0.5 text-[10px] whitespace-nowrap opacity-0 shadow transition-opacity group-hover:opacity-100">
                                                        {formatRp(bar.expense)}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-muted-foreground w-full truncate text-center text-[11px] font-medium">
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
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Wallets Summary Card */}
                    <Card className="border-border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base font-bold">
                                Dompet Keuangan
                            </CardTitle>
                            <Link
                                href="/wallets"
                                className="text-primary text-xs hover:underline"
                            >
                                Lihat Semua &rarr;
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {wallets.map((w) => (
                                <div
                                    key={w.id}
                                    className="bg-muted/50 border-border flex items-center justify-between rounded-xl border p-3.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-background border-border rounded-lg border p-2 text-emerald-500">
                                            <WalletIcon className="size-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-foreground text-sm font-semibold">
                                                {w.name}
                                            </h4>
                                            <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                                                {w.type}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-foreground font-mono text-sm font-bold">
                                        {formatRp(Number(w.balance))}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Transactions List with Human Readable Dates */}
                    <Card className="border-border shadow-sm lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base font-bold">
                                Transaksi Terakhir
                            </CardTitle>
                            <Link
                                href="/transactions"
                                className="text-primary text-xs hover:underline"
                            >
                                Semua Transaksi &rarr;
                            </Link>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="bg-muted/40 hover:bg-muted/80 border-border flex items-center justify-between rounded-xl border p-3.5 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="border-border flex shrink-0 items-center justify-center rounded-lg border p-2"
                                                style={{
                                                    backgroundColor: tx.category
                                                        ?.color
                                                        ? `${tx.category.color}20`
                                                        : 'var(--muted)',
                                                    borderColor: tx.category
                                                        ?.color
                                                        ? `${tx.category.color}40`
                                                        : 'var(--border)',
                                                }}
                                            >
                                                {tx.type === 'transfer' ? (
                                                    <Receipt className="size-4 text-amber-500" />
                                                ) : (
                                                    <CategoryIcon
                                                        name={tx.category?.icon}
                                                        color={
                                                            tx.category?.color
                                                        }
                                                        className="size-4"
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground text-sm font-semibold">
                                                        {tx.category?.name ||
                                                            (tx.type ===
                                                            'transfer'
                                                                ? 'Transfer Wallet'
                                                                : 'Transaksi')}
                                                    </span>
                                                    {tx.payer?.name && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-normal"
                                                        >
                                                            {tx.payer.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground mt-0.5 text-xs">
                                                    {tx.note ||
                                                        (tx.type === 'transfer'
                                                            ? `${tx.wallet_from?.name} \u2192 ${tx.wallet_to?.name}`
                                                            : formatDateHuman(
                                                                  tx.transaction_date,
                                                              ))}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span
                                                className={`font-mono text-sm font-bold ${
                                                    tx.type === 'income'
                                                        ? 'text-blue-500'
                                                        : tx.type === 'expense'
                                                          ? 'text-rose-500'
                                                          : 'text-amber-500'
                                                }`}
                                            >
                                                {tx.type === 'income'
                                                    ? '+'
                                                    : tx.type === 'expense'
                                                      ? '-'
                                                      : ''}
                                                {formatRp(Number(tx.amount))}
                                            </span>
                                            <p className="text-muted-foreground text-[10px]">
                                                {formatDateHuman(
                                                    tx.transaction_date,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground py-8 text-center text-sm">
                                    Belum ada transaksi tercatat.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
