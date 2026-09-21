import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Edit2,
    FolderPlus,
    PieChart,
    Plus,
    ShieldAlert,
    Sparkles,
    Tag,
    Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { CategoryIcon } from '@/components/category-icon';
import { IconPicker } from '@/components/icon-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatRp } from '@/lib/formatters';

interface Category {
    id: number;
    name: string;
    type: string; // 'income' | 'expense'
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
    allCategories?: Category[];
    summary: {
        totalLimit: number;
        totalBudgetedSpent: number;
        totalUnbudgetedSpent: number;
        totalExpense: number;
        remainingBudget: number;
    };
}

const PRESET_COLORS = [
    '#EF4444',
    '#F97316',
    '#F59E0B',
    '#10B981',
    '#06B6D4',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#64748B',
];

export default function BudgetsIndex({
    budgetedItems,
    unbudgetedItems,
    month,
    year,
    expenseCategories,
    allCategories = [],
    summary,
}: BudgetsProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedCatId, setSelectedCatId] = useState<number | ''>('');
    const [limitInput, setLimitInput] = useState('');

    // Category Management Modal State
    const [isCatManageOpen, setIsCatManageOpen] = useState(false);
    const [isCatFormOpen, setIsCatFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const budgetForm = useForm({
        category_id: '',
        monthly_limit: '',
        month: month,
        year: year,
    });

    const deleteForm = useForm({});

    // Category CRUD form
    const categoryForm = useForm({
        name: '',
        type: 'expense',
        icon: 'Tag',
        color: '#8B5CF6',
    });

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

    // Open category form (add mode or edit mode)
    const handleOpenCategoryForm = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            categoryForm.setData({
                name: category.name,
                type: category.type,
                icon: category.icon || 'Tag',
                color: category.color || '#8B5CF6',
            });
        } else {
            setEditingCategory(null);
            categoryForm.setData({
                name: '',
                type: 'expense',
                icon: 'ShoppingBag',
                color: '#8B5CF6',
            });
        }
        setIsCatFormOpen(true);
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            categoryForm.put(`/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setIsCatFormOpen(false);
                    setEditingCategory(null);
                },
            });
        } else {
            categoryForm.post('/categories', {
                onSuccess: () => {
                    setIsCatFormOpen(false);
                },
            });
        }
    };

    const handleDeleteCategory = (cat: Category) => {
        if (confirm(`Hapus kategori "${cat.name}"? Semua data transaksi kategori ini akan tetap tersimpan.`)) {
            router.delete(`/categories/${cat.id}`, {
                preserveScroll: true,
            });
        }
    };

    const displayedCategories = allCategories.length > 0 ? allCategories : expenseCategories;

    return (
        <>
            <Head title="Alokasi Budget Keuangan" />

            <div className="p-4 md:p-6 pb-28 md:pb-8 space-y-6 max-w-7xl mx-auto">
                {/* Header & Month Selector */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 flex-wrap">
                                <PieChart className="size-5 sm:size-6 text-purple-500 shrink-0" />
                                <span>Target &amp; Alokasi Budget</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1 leading-snug">
                                Kendalikan batas pengeluaran bulanan keluarga dan kelola kategori transaksi.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCatManageOpen(true)}
                                className="font-semibold gap-1.5 shadow-sm text-sm"
                                size="sm"
                            >
                                <Tag className="size-4 text-purple-500" />
                                <span className="hidden sm:inline">Kelola Kategori</span>
                                <span className="sm:hidden">Kategori</span>
                            </Button>

                            <Button
                                type="button"
                                onClick={() => handleOpenSetBudget()}
                                className="font-bold gap-1.5 shadow-sm text-sm"
                                size="sm"
                            >
                                <Plus className="size-4" />
                                <span className="hidden sm:inline">Atur Limit Budget</span>
                                <span className="sm:hidden">Atur</span>
                            </Button>
                        </div>
                    </div>

                    {/* Month Selector row */}
                    <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm self-start">
                        <Calendar className="size-4 text-muted-foreground shrink-0" />
                        <select
                            value={month}
                            onChange={(e) => handleMonthYearChange(Number(e.target.value), year)}
                            className="bg-transparent text-foreground text-sm font-semibold border-none focus:ring-0 cursor-pointer outline-none"
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
                            className="bg-transparent text-foreground text-sm font-semibold border-none focus:ring-0 cursor-pointer outline-none"
                        >
                            {[2025, 2026, 2027].map((y) => (
                                <option key={y} value={y} className="bg-card text-card-foreground">
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="shadow-sm border-border p-4">
                        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Limit</span>
                        <div className="text-xl sm:text-2xl font-black text-purple-500 mt-1 truncate">{formatRp(summary.totalLimit)}</div>
                    </Card>

                    <Card className="shadow-sm border-border p-4">
                        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Terpakai</span>
                        <div className="text-xl sm:text-2xl font-black text-rose-500 mt-1 truncate">{formatRp(summary.totalBudgetedSpent)}</div>
                    </Card>

                    <Card className="shadow-sm border-border p-4">
                        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Luar Budget</span>
                        <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1 truncate">{formatRp(summary.totalUnbudgetedSpent)}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">Tanpa limit fixed</p>
                    </Card>

                    <Card className="shadow-sm border-border p-4">
                        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sisa Budget</span>
                        <div className={`text-xl sm:text-2xl font-black mt-1 truncate ${summary.remainingBudget >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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
                                                className="size-9 rounded-xl flex items-center justify-center border border-border shrink-0"
                                                style={{
                                                    backgroundColor: item.category.color ? `${item.category.color}20` : 'var(--muted)',
                                                    borderColor: item.category.color ? `${item.category.color}40` : 'var(--border)',
                                                }}
                                            >
                                                <CategoryIcon
                                                    name={item.category.icon}
                                                    color={item.category.color}
                                                    className="size-5"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground text-base flex items-center gap-1.5">
                                                    <span>{item.category.name}</span>
                                                </h3>
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
                            Kategori ini tidak dipasang limit fixed (misal: belanja bulanan variabel). Seluruh transaksi tetap tercatat penuh dalam grafik &amp; laporan.
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
                                        className="size-8 rounded-lg flex items-center justify-center border border-border shrink-0"
                                        style={{
                                            backgroundColor: item.category.color ? `${item.category.color}20` : 'var(--muted)',
                                            borderColor: item.category.color ? `${item.category.color}40` : 'var(--border)',
                                        }}
                                    >
                                        <CategoryIcon
                                            name={item.category.icon}
                                            color={item.category.color}
                                            className="size-4"
                                        />
                                    </div>
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

                {/* Dialog 1: Set Budget Limit */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Atur Limit Budget Bulanan</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSaveBudget} className="space-y-4 pt-2">
                            <div>
                                <Label>Pilih Kategori Pengeluaran</Label>
                                <Select
                                    value={String(selectedCatId)}
                                    onValueChange={(val) => setSelectedCatId(Number(val))}
                                    required
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="-- Pilih Kategori --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {expenseCategories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon name={c.icon} color={c.color} className="size-4" />
                                                    <span>{c.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                {/* Dialog 2: Category Management List */}
                <Dialog open={isCatManageOpen} onOpenChange={setIsCatManageOpen}>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="flex flex-row items-center justify-between">
                            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                                <Tag className="size-5 text-purple-500" />
                                Manajemen Kategori Transaksi
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Kelola daftar kategori pemasukan dan pengeluaran beserta icon &amp; warnanya.
                                </p>
                                <Button
                                    type="button"
                                    onClick={() => handleOpenCategoryForm()}
                                    size="sm"
                                    className="font-bold gap-1 text-xs shrink-0"
                                >
                                    <FolderPlus className="size-4" />
                                    Tambah Kategori
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                                {displayedCategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="size-8 rounded-lg flex items-center justify-center border border-border shrink-0"
                                                style={{
                                                    backgroundColor: cat.color ? `${cat.color}20` : 'var(--muted)',
                                                    borderColor: cat.color ? `${cat.color}40` : 'var(--border)',
                                                }}
                                            >
                                                <CategoryIcon name={cat.icon} color={cat.color} className="size-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                                    <span>{cat.name}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] px-1.5 py-0 font-medium ${
                                                            cat.type === 'income'
                                                                ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                                                                : 'text-purple-500 border-purple-500/30 bg-purple-500/10'
                                                        }`}
                                                    >
                                                        {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                    </Badge>
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenCategoryForm(cat)}
                                                className="size-8 p-0 text-muted-foreground hover:text-foreground"
                                                title="Edit Kategori"
                                            >
                                                <Edit2 className="size-4" />
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteCategory(cat)}
                                                className="size-8 p-0 text-rose-500 hover:text-rose-600"
                                                title="Hapus Kategori"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {displayedCategories.length === 0 && (
                                    <p className="text-center text-xs text-muted-foreground py-6">
                                        Belum ada kategori yang dibuat.
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsCatManageOpen(false)}
                                    variant="outline"
                                >
                                    Selesai
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog 3: Add / Edit Category Form */}
                <Dialog open={isCatFormOpen} onOpenChange={setIsCatFormOpen}>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? `Edit Kategori "${editingCategory.name}"` : 'Tambah Kategori Baru'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
                            <div>
                                <Label>Nama Kategori</Label>
                                <Input
                                    placeholder="Misal: Belanja Bulanan, Gaji, Liburan..."
                                    value={categoryForm.data.name}
                                    onChange={(e) => categoryForm.setData('name', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                            </div>

                            {!editingCategory && (
                                <div>
                                    <Label>Tipe Kategori</Label>
                                    <Select
                                        value={categoryForm.data.type}
                                        onValueChange={(val) => categoryForm.setData('type', val)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih Tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="expense">Pengeluaran</SelectItem>
                                            <SelectItem value="income">Pemasukan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Icon Picker Component */}
                            <IconPicker
                                value={categoryForm.data.icon}
                                color={categoryForm.data.color}
                                onChange={(iconName) => categoryForm.setData('icon', iconName)}
                            />

                            {/* Color Selector */}
                            <div>
                                <Label className="text-xs font-semibold">Warna Kategori</Label>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    {PRESET_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => categoryForm.setData('color', c)}
                                            className={`size-7 rounded-full transition-transform border border-border ${
                                                categoryForm.data.color === c ? 'scale-125 ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                                            }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={categoryForm.data.color}
                                        onChange={(e) => categoryForm.setData('color', e.target.value)}
                                        className="size-7 rounded-full cursor-pointer border border-border p-0 bg-transparent"
                                        title="Pilih Warna Custom"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3">
                                <Button
                                    type="button"
                                    onClick={() => setIsCatFormOpen(false)}
                                    variant="outline"
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={categoryForm.processing} className="font-bold">
                                    {editingCategory ? 'Perbarui Kategori' : 'Simpan Kategori'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
