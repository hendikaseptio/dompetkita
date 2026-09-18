import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle2, Edit2, PieChart, Plus, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRp } from '@/lib/formatters';

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
        <>
            <Head title="Alokasi Budget Keuangan" />

            <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
                {/* Header & Month Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <PieChart className="size-6 text-purple-500" />
                            Target & Alokasi Budget Kategori
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kendalikan batas pengeluaran bulanan keluarga dan pantau saldo sisa budget.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Month Selector */}
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
                            onClick={() => handleOpenSetBudget()}
                            className="font-bold gap-2 shadow-sm"
                        >
                            <Plus className="size-4" />
                            Atur Limit Budget
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-border p-5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Limit Budget</span>
                        <div className="text-2xl font-black text-purple-500 mt-1">{formatRp(summary.totalLimit)}</div>
                    </Card>

                    <Card className="shadow-sm border-border p-5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Terpakai (Budgeted)</span>
                        <div className="text-2xl font-black text-rose-500 mt-1">{formatRp(summary.totalBudgetedSpent)}</div>
                    </Card>

                    <Card className="shadow-sm border-border p-5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pengeluaran Luar Budget</span>
                        <div className="text-2xl font-black text-amber-500 mt-1">{formatRp(summary.totalUnbudgetedSpent)}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Kategori tanpa limit fixed</p>
                    </Card>

                    <Card className="shadow-sm border-border p-5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sisa Budget Tersedia</span>
                        <div className={`text-2xl font-black mt-1 ${summary.remainingBudget >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatRp(summary.remainingBudget)}
                        </div>
                    </Card>
                </div>

                {/* Section 1: Categories WITH Budget Limit */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <PieChart className="size-5 text-purple-500" />
                        Kategori Terbudget ({budgetedItems.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {budgetedItems.length > 0 ? (
                            budgetedItems.map((item) => (
                                <Card
                                    key={item.id}
                                    className={`shadow-sm border p-5 space-y-3 transition-all ${
                                        item.is_over_budget
                                            ? 'border-rose-500/60 bg-rose-500/5'
                                            : item.percentage >= 80
                                            ? 'border-amber-500/60 bg-amber-500/5'
                                            : 'border-border'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="size-4 rounded-full border border-border"
                                                style={{ backgroundColor: item.category.color || '#8B5CF6' }}
                                            />
                                            <div>
                                                <h3 className="font-bold text-foreground text-base">{item.category.name}</h3>
                                                <p className="text-xs text-muted-foreground">Limit: {formatRp(item.monthly_limit)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {item.is_over_budget ? (
                                                <Badge variant="destructive" className="text-[11px] font-bold gap-1">
                                                    <ShieldAlert className="size-3.5" /> Over Budget
                                                </Badge>
                                            ) : item.percentage >= 80 ? (
                                                <Badge variant="outline" className="text-[11px] font-bold text-amber-500 border-amber-500/30 bg-amber-500/10 gap-1">
                                                    <AlertCircle className="size-3.5" /> Mendekati Limit
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[11px] font-bold text-emerald-500 border-emerald-500/30 bg-emerald-500/10 gap-1">
                                                    <CheckCircle2 className="size-3.5" /> Aman
                                                </Badge>
                                            )}

                                            <Button
                                                type="button"
                                                onClick={() => handleOpenSetBudget(item.category_id, item.monthly_limit)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-muted-foreground hover:text-foreground p-1.5 h-auto"
                                            >
                                                <Edit2 className="size-4" />
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={() => handleDeleteBudget(item.id, item.category.name)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-rose-500 hover:text-rose-600 p-1.5 h-auto"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-muted-foreground">Terpakai: {formatRp(item.spent)}</span>
                                            <span className="text-foreground font-bold">{item.percentage}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border">
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

                                    <div className="flex justify-between text-xs pt-2 border-t border-border">
                                        <span className="text-muted-foreground">Sisa Anggaran:</span>
                                        <span className={`font-bold font-mono ${item.remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {formatRp(item.remaining)}
                                        </span>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <Card className="col-span-2 p-8 text-center text-muted-foreground text-sm border-border">
                                Belum ada kategori yang diberi limit budget untuk bulan ini.
                            </Card>
                        )}
                    </div>
                </div>

                {/* Section 2: Unbudgeted / Variable Expenses Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Sparkles className="size-5 text-amber-500" />
                            Pengeluaran Luar Budget / Variabel ({unbudgetedItems.length})
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Kategori ini tidak dipasang limit fixed (misal: belanja bulanan variabel). Seluruh transaksi tetap tercatat penuh dalam grafik & laporan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {unbudgetedItems.map((item) => (
                            <Card
                                key={item.category_id}
                                className="shadow-sm border-border p-4 flex items-center justify-between transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="size-3.5 rounded-full border border-border"
                                        style={{ backgroundColor: item.category.color || '#F59E0B' }}
                                    />
                                    <div>
                                        <h4 className="font-semibold text-foreground text-sm">{item.category.name}</h4>
                                        <p className="text-xs text-amber-500 font-mono font-bold mt-0.5">
                                            Pengeluaran: {formatRp(item.spent)}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => handleOpenSetBudget(item.category_id)}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                >
                                    Set Budget
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Dialog Set Budget Limit */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Atur Limit Budget Bulanan</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSaveBudget} className="space-y-4 pt-2">
                            <div>
                                <Label>Pilih Kategori Pengeluaran</Label>
                                <select
                                    value={selectedCatId}
                                    onChange={(e) => setSelectedCatId(Number(e.target.value))}
                                    className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 text-sm focus:ring-2 focus:ring-ring"
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
                                <Label>Batas Pengeluaran Bulanan (Limit)</Label>
                                <CurrencyInput
                                    placeholder="0"
                                    value={limitInput}
                                    onChangeValue={(val) => setLimitInput(val)}
                                    className="font-bold text-lg mt-1"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    variant="outline"
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={budgetForm.processing} className="font-bold">
                                    Simpan Budget
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
