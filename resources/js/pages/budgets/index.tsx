import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle2, PieChart, Plus, ShieldAlert, Sparkles, Tag, Trash2, Edit2 } from 'lucide-react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category {
    id: number;
    name: string;
    type: string;
    icon: string | null;
    color: string | null;
}

interface BudgetedItem {
    id: number;
    category_id: number;
    category: Category;
    monthly_limit: number;
    spent: number;
    remaining: number;
    percentage: number;
    is_over_budget: boolean;
}

interface UnbudgetedItem {
    category_id: number;
    category: Category;
    spent: number;
}

interface BudgetsProps {
    budgetedItems: BudgetedItem[];
    unbudgetedItems: UnbudgetedItem[];
    month: number;
    year: number;
    expenseCategories: Category[];
    summary: {
        totalLimit: number;
        totalBudgetedSpent: number;
        totalUnbudgetedSpent: number;
        totalExpense: number;
        remainingBudget: number;
    };
}

export default function BudgetsIndex({
    budgetedItems,
    unbudgetedItems,
    month,
    year,
    expenseCategories,
    summary,
}: BudgetsProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedCatId, setSelectedCatId] = useState<number | ''>('');
    const [limitInput, setLimitInput] = useState('');

    const budgetForm = useForm({
        category_id: '',
        monthly_limit: '',
        month: month,
        year: year,
    });

    const deleteForm = useForm({});

    const formatRp = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num);
    };

    const handleMonthYearChange = (m: number, y: number) => {
        router.get('/budgets', { month: m, year: y }, { preserveState: true });
    };

    const handleOpenSetBudget = (categoryId?: number, currentLimit?: number) => {
        if (categoryId) {
            setSelectedCatId(categoryId);
            setLimitInput(currentLimit ? String(currentLimit) : '');
        } else {
            setSelectedCatId('');
            setLimitInput('');
        }
        setIsAddOpen(true);
    };

    const handleSaveBudget = (e: React.FormEvent) => {
        e.preventDefault();
        budgetForm.setData({
            category_id: String(selectedCatId),
            monthly_limit: limitInput,
            month: month,
            year: year,
        });

        budgetForm.post('/budgets', {
            onSuccess: () => {
                setIsAddOpen(false);
            },
        });
    };

    const handleDeleteBudget = (budgetId: number, categoryName: string) => {
        if (confirm(`Hapus batasan budget untuk "${categoryName}"? Kategori akan menjadi Pengeluaran Variabel (Unbudgeted).`)) {
            deleteForm.delete(`/budgets/${budgetId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Budgeting', href: '/budgets' }]}>
            <Head title="Alokasi Budget Keuangan" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Header & Month Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <PieChart className="size-6 text-purple-400" />
                            Target & Alokasi Budget Kategori
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Kendalikan batas pengeluaran bulanan keluarga dan pantau saldo sisa budget.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Month Selector */}
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5">
                            <Calendar className="size-4 text-slate-400 ml-2" />
                            <select
                                value={month}
                                onChange={(e) => handleMonthYearChange(Number(e.target.value), year)}
                                className="bg-transparent text-white text-sm font-semibold border-none focus:ring-0 cursor-pointer"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m} className="bg-slate-900">
                                        {new Date(2026, m - 1, 1).toLocaleString('id-ID', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={year}
                                onChange={(e) => handleMonthYearChange(month, Number(e.target.value))}
                                className="bg-transparent text-white text-sm font-semibold border-none focus:ring-0 cursor-pointer"
                            >
                                {[2025, 2026, 2027].map((y) => (
                                    <option key={y} value={y} className="bg-slate-900">
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            type="button"
                            onClick={() => handleOpenSetBudget()}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold gap-2 shadow-lg shadow-purple-600/20"
                        >
                            <Plus className="size-4" />
                            Atur Limit Budget
                        </Button>
                    </div>
                </div>

                {/* Summary Banner */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Limit Budget</span>
                        <div className="text-2xl font-black text-purple-400 mt-1">{formatRp(summary.totalLimit)}</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terpakai (Budgeted)</span>
                        <div className="text-2xl font-black text-rose-400 mt-1">{formatRp(summary.totalBudgetedSpent)}</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pengeluaran Luar Budget</span>
                        <div className="text-2xl font-black text-amber-400 mt-1">{formatRp(summary.totalUnbudgetedSpent)}</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Kategori tanpa limit fixed</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Budget Tersedia</span>
                        <div className={`text-2xl font-black mt-1 ${summary.remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                            {formatRp(summary.remainingBudget)}
                        </div>
                    </div>
                </div>

                {/* Section 1: Categories WITH Budget Limit */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <PieChart className="size-5 text-purple-400" />
                        Kategori Terbudget ({budgetedItems.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {budgetedItems.length > 0 ? (
                            budgetedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`bg-slate-900 border rounded-2xl p-5 shadow-lg space-y-3 transition-all ${
                                        item.is_over_budget
                                            ? 'border-rose-500/60 bg-rose-950/10'
                                            : item.percentage >= 80
                                            ? 'border-amber-500/60 bg-amber-950/10'
                                            : 'border-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="size-4 rounded-full border border-slate-700"
                                                style={{ backgroundColor: item.category.color || '#8B5CF6' }}
                                            />
                                            <div>
                                                <h3 className="font-bold text-white text-base">{item.category.name}</h3>
                                                <p className="text-xs text-slate-400">Limit: {formatRp(item.monthly_limit)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {item.is_over_budget ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                                                    <ShieldAlert className="size-3.5" /> Over Budget
                                                </span>
                                            ) : item.percentage >= 80 ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                                                    <AlertCircle className="size-3.5" /> Mendekati Limit
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                                                    <CheckCircle2 className="size-3.5" /> Aman
                                                </span>
                                            )}

                                            <Button
                                                type="button"
                                                onClick={() => handleOpenSetBudget(item.category_id, item.monthly_limit)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-400 hover:text-white p-1.5 h-auto"
                                            >
                                                <Edit2 className="size-4" />
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={() => handleDeleteBudget(item.id, item.category.name)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-rose-400 hover:text-rose-300 p-1.5 h-auto"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-slate-400">Terpakai: {formatRp(item.spent)}</span>
                                            <span className="text-slate-300 font-bold">{item.percentage}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    item.is_over_budget
                                                        ? 'bg-rose-500'
                                                        : item.percentage >= 80
                                                        ? 'bg-amber-500'
                                                        : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${Math.min(100, item.percentage)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-xs pt-2 border-t border-slate-800/80">
                                        <span className="text-slate-400">Sisa Anggaran:</span>
                                        <span className={`font-bold font-mono ${item.remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {formatRp(item.remaining)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 py-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm">
                                Belum ada kategori yang diberi limit budget untuk bulan ini.
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Unbudgeted / Variable Expenses Section (User Feedback Feature) */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Sparkles className="size-5 text-amber-400" />
                                Pengeluaran Luar Budget / Variabel ({unbudgetedItems.length})
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Kategori ini tidak dipasang limit fixed (misal: belanja bulanan variabel). Seluruh transaksi tetap tercatat penuh dalam grafik & laporan.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {unbudgetedItems.map((item) => (
                            <div
                                key={item.category_id}
                                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="size-3.5 rounded-full border border-slate-700"
                                        style={{ backgroundColor: item.category.color || '#F59E0B' }}
                                    />
                                    <div>
                                        <h4 className="font-semibold text-white text-sm">{item.category.name}</h4>
                                        <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                                            Pengeluaran: {formatRp(item.spent)}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => handleOpenSetBudget(item.category_id)}
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-700 text-slate-300 hover:text-white text-xs"
                                >
                                    Set Budget
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal Set Budget Limit */}
                {isAddOpen && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
                            <h3 className="text-lg font-bold text-white">Atur Limit Budget Bulanan</h3>

                            <form onSubmit={handleSaveBudget} className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">Pilih Kategori Pengeluaran</Label>
                                    <select
                                        value={selectedCatId}
                                        onChange={(e) => setSelectedCatId(Number(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-purple-500"
                                        required
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {expenseCategories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-slate-300">Batas Pengeluaran Bulanan (Limit Rp)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Contoh: 2000000"
                                        value={limitInput}
                                        onChange={(e) => setLimitInput(e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white font-bold mt-1"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setIsAddOpen(false)}
                                        variant="outline"
                                        className="border-slate-700 text-slate-300"
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={budgetForm.processing} className="bg-purple-600 text-white font-bold">
                                        Simpan Budget
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
