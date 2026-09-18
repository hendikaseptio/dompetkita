import { Head, useForm } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Edit2, Plus, Tag, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function CategoriesIndex({ categories }: CategoriesProps) {
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);

    const addForm = useForm({
        name: '',
        type: activeTab,
        color: '#10B981',
    });

    const editForm = useForm({
        name: '',
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

            <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Tag className="size-6 text-emerald-500" />
                            Kategori Pemasukan & Pengeluaran
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Atur klasifikasi jenis transaksi keuangan keluarga Anda.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            addForm.setData('type', activeTab);
                            setIsAddOpen(true);
                        }}
                        className="font-bold gap-2 shadow-sm"
                    >
                        <Plus className="size-4" />
                        Tambah Kategori Baru
                    </Button>
                </div>

                {/* Tabs Selector */}
                <div className="flex gap-2 border-b border-border pb-2">
                    <Button
                        type="button"
                        onClick={() => setActiveTab('expense')}
                        variant={activeTab === 'expense' ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                    >
                        <ArrowDownRight className="size-4" />
                        Pengeluaran ({categories.filter((c) => c.type === 'expense').length})
                    </Button>
                    <Button
                        type="button"
                        onClick={() => setActiveTab('income')}
                        variant={activeTab === 'income' ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                    >
                        <ArrowUpRight className="size-4" />
                        Pemasukan ({categories.filter((c) => c.type === 'income').length})
                    </Button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredCategories.map((cat) => (
                        <Card
                            key={cat.id}
                            className="shadow-sm border-border p-4 flex items-center justify-between hover:border-accent transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="size-4 rounded-full border border-border shadow-sm"
                                    style={{ backgroundColor: cat.color || '#10B981' }}
                                />
                                <div>
                                    <h4 className="font-semibold text-foreground text-sm">{cat.name}</h4>
                                    {cat.is_default && (
                                        <Badge variant="secondary" className="text-[10px] uppercase">Default</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    onClick={() => handleOpenEdit(cat)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground p-1.5 h-auto"
                                >
                                    <Edit2 className="size-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleDelete(cat.id, cat.name)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-rose-500 hover:text-rose-600 p-1.5 h-auto"
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Dialog Add Category */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Tambah Kategori Baru</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
                            <div>
                                <Label>Jenis Kategori</Label>
                                <select
                                    value={addForm.data.type}
                                    onChange={(e) => addForm.setData('type', e.target.value as any)}
                                    className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 text-sm focus:ring-2 focus:ring-ring"
                                >
                                    <option value="expense">Pengeluaran (Expense)</option>
                                    <option value="income">Pemasukan (Income)</option>
                                </select>
                            </div>

                            <div>
                                <Label>Nama Kategori</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Langganan Netflix, Servis Laptop"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Warna Indikator</Label>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <Input
                                        type="color"
                                        value={addForm.data.color}
                                        onChange={(e) => addForm.setData('color', e.target.value)}
                                        className="size-10 p-1 bg-background border-input rounded-lg cursor-pointer"
                                    />
                                    <span className="text-xs text-muted-foreground font-mono">{addForm.data.color}</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    variant="outline"
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={addForm.processing} className="font-bold">
                                    Simpan Kategori
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog Edit Category */}
                {editingCat && (
                    <Dialog open={!!editingCat} onOpenChange={() => setEditingCat(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Edit Kategori</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                                <div>
                                    <Label>Nama Kategori</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Warna Indikator</Label>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <Input
                                            type="color"
                                            value={editForm.data.color}
                                            onChange={(e) => editForm.setData('color', e.target.value)}
                                            className="size-10 p-1 bg-background border-input rounded-lg cursor-pointer"
                                        />
                                        <span className="text-xs text-muted-foreground font-mono">{editForm.data.color}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setEditingCat(null)}
                                        variant="outline"
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={editForm.processing} className="font-bold">
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
