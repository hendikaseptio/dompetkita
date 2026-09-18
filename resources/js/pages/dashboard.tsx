import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    BarChart3,
    CreditCard,
    Plus,
    PieChart as PieIcon,
    Receipt,
    TrendingDown,
    TrendingUp,
    Wallet as WalletIcon,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Wallet {
    id: number;
    name: string;
    type: string;
    balance: string;
}

interface Category {
    id: number;
    name: string;
    type: string;
    color: string | null;
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
    categories?: Category[];
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
    const [isAddOpen, setIsAddOpen] = useState(false);

    const formatRp = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num);
    };

    return (
        <>
            <Head title="Dashboard Keuangan" />

            <div className="p-6 space-y-8 max-w-7xl mx-auto">
                {/* Header Welcome Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span>Keluarga {family.name}</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Ringkasan performa & kesehatan keuangan bersama bulan {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/transactions"
                            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm"
                        >
                            <Plus className="size-4" />
                            Tambah Transaksi
                        </Link>
                    </div>
                </div>

                {/* 4 Executive Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Uang */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Saldo Wallet</span>
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                <WalletIcon className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-extrabold text-white tracking-tight">{formatRp(totalBalance)}</span>
                            <p className="text-xs text-slate-400 mt-1">Gabungan dari {wallets.length} dompet</p>
                        </div>
                    </div>

                    {/* Monthly Income */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pemasukan Bulan Ini</span>
                            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                                <TrendingUp className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-extrabold text-blue-400 tracking-tight">{formatRp(monthlyIncome)}</span>
                            <p className="text-xs text-slate-400 mt-1">Total uang masuk keluarga</p>
                        </div>
                    </div>

                    {/* Monthly Expense */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pengeluaran Bulan Ini</span>
                            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
                                <TrendingDown className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-extrabold text-rose-400 tracking-tight">{formatRp(monthlyExpense)}</span>
                            <p className="text-xs text-slate-400 mt-1">Total belanja & biaya hidup</p>
                        </div>
                    </div>

                    {/* Remaining Budget */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Limit Budget</span>
                            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                                <PieIcon className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-extrabold text-purple-400 tracking-tight">{formatRp(remainingBudget)}</span>
                            <p className="text-xs text-slate-400 mt-1">Dari total limit {formatRp(totalBudgetLimit)}</p>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Expense by Category Breakdown */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white text-base flex items-center gap-2">
                                    <PieIcon className="size-4 text-emerald-400" />
                                    Distribusi Pengeluaran
                                </h3>
                                <span className="text-xs text-slate-400">Bulan Ini</span>
                            </div>

                            {charts.expenseByCategory.length > 0 ? (
                                <div className="space-y-3.5 mt-4">
                                    {charts.expenseByCategory.map((item, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-slate-300 flex items-center gap-2">
                                                    <span
                                                        className="size-2.5 rounded-full"
                                                        style={{ backgroundColor: item.color || '#10B981' }}
                                                    />
                                                    {item.category}
                                                </span>
                                                <span className="text-slate-400 font-mono">
                                                    {formatRp(item.total)} ({item.percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
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
                                <div className="py-12 text-center text-slate-400 text-sm">
                                    Belum ada transaksi pengeluaran bulan ini.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Income vs Expense Bar Graphic */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-2 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white text-base flex items-center gap-2">
                                    <BarChart3 className="size-4 text-blue-400" />
                                    Perbandingan Income vs Expense (6 Bulan)
                                </h3>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                    <span className="flex items-center gap-1.5 text-blue-400">
                                        <span className="size-2.5 bg-blue-500 rounded-sm" /> Income
                                    </span>
                                    <span className="flex items-center gap-1.5 text-rose-400">
                                        <span className="size-2.5 bg-rose-500 rounded-sm" /> Expense
                                    </span>
                                </div>
                            </div>

                            <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-800">
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
                                                    className="w-1/2 max-w-[20px] bg-blue-500/90 hover:bg-blue-400 rounded-t-md transition-all relative group"
                                                    style={{ height: `${Math.max(incPct, 4)}%` }}
                                                >
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] text-white px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                                                        {formatRp(bar.income)}
                                                    </div>
                                                </div>
                                                {/* Expense Bar */}
                                                <div
                                                    className="w-1/2 max-w-[20px] bg-rose-500/90 hover:bg-rose-400 rounded-t-md transition-all relative group"
                                                    style={{ height: `${Math.max(expPct, 4)}%` }}
                                                >
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] text-white px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                                                        {formatRp(bar.expense)}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-slate-400 font-medium truncate w-full text-center">
                                                {bar.month}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wallets Overview & Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Wallets Summary Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white text-base">Dompet Keuangan</h3>
                            <Link href="/wallets" className="text-xs text-emerald-400 hover:underline">
                                Lihat Semua &rarr;
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {wallets.map((w) => (
                                <div key={w.id} className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-700/60 text-emerald-400 rounded-lg">
                                            <WalletIcon className="size-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">{w.name}</h4>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{w.type}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-white font-mono">{formatRp(Number(w.balance))}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white text-base">Transaksi Terakhir</h3>
                            <Link href="/transactions" className="text-xs text-emerald-400 hover:underline">
                                Semua Transaksi &rarr;
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((tx) => (
                                    <div key={tx.id} className="bg-slate-800/40 hover:bg-slate-800/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between transition-all">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`p-2.5 rounded-xl ${tx.type === 'income'
                                                    ? 'bg-blue-500/10 text-blue-400'
                                                    : tx.type === 'expense'
                                                        ? 'bg-rose-500/10 text-rose-400'
                                                        : 'bg-amber-500/10 text-amber-400'
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
                                                    <span className="text-sm font-semibold text-white">
                                                        {tx.category?.name || (tx.type === 'transfer' ? 'Transfer Wallet' : 'Transaksi')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                                        {tx.payer?.name ? `Oleh: ${tx.payer.name}` : ''}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {tx.note || (tx.type === 'transfer' ? `${tx.wallet_from?.name} -> ${tx.wallet_to?.name}` : tx.transaction_date)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span
                                                className={`text-sm font-bold font-mono ${tx.type === 'income'
                                                    ? 'text-blue-400'
                                                    : tx.type === 'expense'
                                                        ? 'text-rose-400'
                                                        : 'text-amber-400'
                                                    }`}
                                            >
                                                {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                                {formatRp(Number(tx.amount))}
                                            </span>
                                            <p className="text-[10px] text-slate-500">{tx.transaction_date}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-slate-400 text-sm">Belum ada transaksi tercatat.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
