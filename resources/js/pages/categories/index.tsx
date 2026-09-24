import { Head, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Edit2,
    Plus,
    Tag,
    Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { MobileFab } from '@/components/mobile-fab';
import { CategoryIcon } from '@/components/category-icon';
import { IconPicker } from '@/components/icon-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    icon: string | null;
    color: string | null;
    is_default: boolean;
}

interface CategoriesProps {
    categories: Category[];
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

export default function CategoriesIndex({ categories }: CategoriesProps) {
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);

    const addForm = useForm({
        name: '',
        type: activeTab,
        icon: 'ShoppingBag',
        color: '#10B981',
    });

    const editForm = useForm({
        name: '',
        icon: 'Tag',
        color: '#10B981',
    });

    const deleteForm = useForm({});

    const filteredCategories = categories.filter((c) => c.type === activeTab);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/categories', {
            onSuccess: () => {
                setIsAddOpen(false);
                addForm.reset();
            },
        });
    };

    const handleOpenEdit = (cat: Category) => {
        setEditingCat(cat);
        editForm.setData({
            name: cat.name,
            icon: cat.icon || 'Tag',
            color: cat.color || '#10B981',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCat) return;
        editForm.put(`/categories/${editingCat.id}`, {
            onSuccess: () => setEditingCat(null),
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Hapus kategori "${name}"?`)) {
            deleteForm.delete(`/categories/${id}`);
        }
    };

    return (
        <>
            <Head title="Manajemen Kategori" />

            {/* Mobile FAB */}
            <MobileFab
                actions={[
                    {
                        id: 'add-category',
                        label: 'Tambah Kategori',
                        icon: <Plus className="size-4" />,
                        onClick: () => {
                            addForm.setData('type', activeTab);
                            setIsAddOpen(true);
                        },
                        color: 'emerald',
                    },
                ]}
            />

            <div className="mx-auto max-w-6xl space-y-4 p-3 pb-28 sm:p-6 md:pb-8">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <h1 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl">
                            <Tag className="size-5 shrink-0 text-emerald-500" />
                            <span className="truncate">Kategori Transaksi</span>
                        </h1>
                        <p className="text-muted-foreground hidden text-xs sm:block">
                            Atur klasifikasi jenis transaksi keuangan keluarga
                            Anda.
                        </p>
                    </div>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                            addForm.setData('type', activeTab);
                            setIsAddOpen(true);
                        }}
                        className="shrink-0 gap-1.5 text-xs font-bold shadow-sm"
                    >
                        <Plus className="size-4" />
                        <span>Tambah Kategori</span>
                    </Button>
                </div>

                {/* Tabs Selector & Count summary */}
                <div className="border-border flex items-center justify-between gap-2 border-b pb-2">
                    <div className="flex gap-1.5">
                        <Button
                            type="button"
                            onClick={() => setActiveTab('expense')}
                            variant={
                                activeTab === 'expense' ? 'default' : 'outline'
                            }
                            size="sm"
                            className="h-8 gap-1.5 px-3 text-xs"
                        >
                            <ArrowDownRight className="size-3.5" />
                            Pengeluaran (
                            {
                                categories.filter((c) => c.type === 'expense')
                                    .length
                            }
                            )
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setActiveTab('income')}
                            variant={
                                activeTab === 'income' ? 'default' : 'outline'
                            }
                            size="sm"
                            className="h-8 gap-1.5 px-3 text-xs"
                        >
                            <ArrowUpRight className="size-3.5" />
                            Pemasukan (
                            {
                                categories.filter((c) => c.type === 'income')
                                    .length
                            }
                            )
                        </Button>
                    </div>
                </div>

                {/* Categories Grid - 2 columns on mobile */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredCategories.map((cat) => (
                        <Card
                            key={cat.id}
                            className="border-border hover:border-accent flex min-w-0 items-center justify-between gap-2 p-2.5 shadow-xs transition-all sm:p-3"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <div
                                    className="border-border flex size-7 shrink-0 items-center justify-center rounded-lg border sm:size-8"
                                    style={{
                                        backgroundColor: cat.color
                                            ? `${cat.color}20`
                                            : 'var(--muted)',
                                        borderColor: cat.color
                                            ? `${cat.color}40`
                                            : 'var(--border)',
                                    }}
                                >
                                    <CategoryIcon
                                        name={cat.icon}
                                        color={cat.color}
                                        className="size-4"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h4
                                        className="text-foreground truncate text-xs font-medium sm:text-sm"
                                        title={cat.name}
                                    >
                                        {cat.name}
                                    </h4>
                                    {cat.is_default && (
                                        <Badge
                                            variant="secondary"
                                            className="px-1 py-0 text-[9px] uppercase"
                                        >
                                            Default
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-0.5">
                                <Button
                                    type="button"
                                    onClick={() => handleOpenEdit(cat)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground size-7 p-0"
                                >
                                    <Edit2 className="size-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(cat.id, cat.name)
                                    }
                                    variant="ghost"
                                    size="sm"
                                    className="size-7 p-0 text-rose-500 hover:text-rose-600"
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {filteredCategories.length === 0 && (
                        <Card className="text-muted-foreground border-border col-span-full p-6 text-center text-xs">
                            Belum ada kategori untuk jenis ini. Klik "Tambah
                            Kategori" di atas.
                        </Card>
                    )}
                </div>

                {/* Dialog Add Category */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Tambah Kategori Baru</DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleAddSubmit}
                            className="space-y-4 pt-2"
                        >
                            <div>
                                <Label>Jenis Kategori</Label>
                                <select
                                    value={addForm.data.type}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'type',
                                            e.target.value as any,
                                        )
                                    }
                                    className="bg-background border-input text-foreground focus:ring-ring mt-1 w-full rounded-md border p-2 text-sm focus:ring-2"
                                >
                                    <option value="expense">
                                        Pengeluaran (Expense)
                                    </option>
                                    <option value="income">
                                        Pemasukan (Income)
                                    </option>
                                </select>
                            </div>

                            <div>
                                <Label>Nama Kategori</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Langganan Netflix, Servis Laptop"
                                    value={addForm.data.name}
                                    onChange={(e) =>
                                        addForm.setData('name', e.target.value)
                                    }
                                    className="mt-1 text-sm"
                                    required
                                />
                            </div>

                            {/* Icon Picker Component */}
                            <IconPicker
                                value={addForm.data.icon}
                                color={addForm.data.color}
                                onChange={(iconName) =>
                                    addForm.setData('icon', iconName)
                                }
                            />

                            {/* Color Selector */}
                            <div>
                                <Label className="text-xs font-semibold">
                                    Warna Indikator
                                </Label>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                    {PRESET_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() =>
                                                addForm.setData('color', c)
                                            }
                                            className={`border-border size-6 rounded-full border transition-transform ${
                                                addForm.data.color === c
                                                    ? 'ring-primary scale-125 ring-2 ring-offset-2'
                                                    : 'hover:scale-110'
                                            }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={addForm.data.color}
                                        onChange={(e) =>
                                            addForm.setData(
                                                'color',
                                                e.target.value,
                                            )
                                        }
                                        className="border-border size-6 cursor-pointer rounded-full border bg-transparent p-0"
                                        title="Pilih Warna Custom"
                                    />
                                    <span className="text-muted-foreground ml-1 font-mono text-xs">
                                        {addForm.data.color}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    variant="outline"
                                    size="sm"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={addForm.processing}
                                    size="sm"
                                    className="font-bold"
                                >
                                    Simpan Kategori
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog Edit Category */}
                {editingCat && (
                    <Dialog
                        open={!!editingCat}
                        onOpenChange={() => setEditingCat(null)}
                    >
                        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    Edit Kategori "{editingCat.name}"
                                </DialogTitle>
                            </DialogHeader>

                            <form
                                onSubmit={handleEditSubmit}
                                className="space-y-4 pt-2"
                            >
                                <div>
                                    <Label>Nama Kategori</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 text-sm"
                                        required
                                    />
                                </div>

                                {/* Icon Picker Component */}
                                <IconPicker
                                    value={editForm.data.icon}
                                    color={editForm.data.color}
                                    onChange={(iconName) =>
                                        editForm.setData('icon', iconName)
                                    }
                                />

                                {/* Color Selector */}
                                <div>
                                    <Label className="text-xs font-semibold">
                                        Warna Indikator
                                    </Label>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                        {PRESET_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() =>
                                                    editForm.setData('color', c)
                                                }
                                                className={`border-border size-6 rounded-full border transition-transform ${
                                                    editForm.data.color === c
                                                        ? 'ring-primary scale-125 ring-2 ring-offset-2'
                                                        : 'hover:scale-110'
                                                }`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                        <input
                                            type="color"
                                            value={editForm.data.color}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'color',
                                                    e.target.value,
                                                )
                                            }
                                            className="border-border size-6 cursor-pointer rounded-full border bg-transparent p-0"
                                            title="Pilih Warna Custom"
                                        />
                                        <span className="text-muted-foreground ml-1 font-mono text-xs">
                                            {editForm.data.color}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setEditingCat(null)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editForm.processing}
                                        size="sm"
                                        className="font-bold"
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}
