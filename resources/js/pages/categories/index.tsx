import { Head, useForm } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Plus, Tag, Trash2, Edit2 } from 'lucide-react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
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
        <AppLayout breadcrumbs={[{ title: 'Kategori', href: '/categories' }]}>
            <Head title="Manajemen Kategori" />

            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Tag className="size-6 text-emerald-400" />
                            Kategori Pemasukan & Pengeluaran
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Atur klasifikasi jenis transaksi keuangan keluarga Anda.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            addForm.setData('type', activeTab);
                            setIsAddOpen(true);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="size-4" />
                        Tambah Kategori Baru
                    </Button>
                </div>

                {/* Tabs Selector */}
                <div className="flex gap-2 border-b border-slate-800 pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('expense')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                            activeTab === 'expense'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <ArrowDownRight className="size-4" />
                        Pengeluaran ({categories.filter((c) => c.type === 'expense').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('income')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                            activeTab === 'income'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <ArrowUpRight className="size-4" />
                        Pemasukan ({categories.filter((c) => c.type === 'income').length})
                    </button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredCategories.map((cat) => (
                        <div
                            key={cat.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="size-4 rounded-full border border-slate-700 shadow-sm"
                                    style={{ backgroundColor: cat.color || '#10B981' }}
                                />
                                <div>
                                    <h4 className="font-semibold text-white text-sm">{cat.name}</h4>
                                    {cat.is_default && (
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Default</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    onClick={() => handleOpenEdit(cat)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-white p-1.5 h-auto"
                                >
                                    <Edit2 className="size-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleDelete(cat.id, cat.name)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-rose-400 hover:text-rose-300 p-1.5 h-auto"
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Add Category */}
                {isAddOpen && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
                            <h3 className="text-lg font-bold text-white">Tambah Kategori Baru</h3>
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">Jenis Kategori</Label>
                                    <select
                                        value={addForm.data.type}
                                        onChange={(e) => addForm.setData('type', e.target.value as any)}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="expense">Pengeluaran (Expense)</option>
                                        <option value="income">Pemasukan (Income)</option>
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-slate-300">Nama Kategori</Label>
                                    <Input
                                        type="text"
                                        placeholder="Contoh: Langganan Netflix, Servis Laptop"
                                        value={addForm.data.name}
                                        onChange={(e) => addForm.setData('name', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-300">Warna Indikator</Label>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <Input
                                            type="color"
                                            value={addForm.data.color}
                                            onChange={(e) => addForm.setData('color', e.target.value)}
                                            className="size-10 p-1 bg-slate-800 border-slate-700 rounded-lg cursor-pointer"
                                        />
                                        <span className="text-xs text-slate-400 font-mono">{addForm.data.color}</span>
                                    </div>
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
                                    <Button type="submit" disabled={addForm.processing} className="bg-emerald-500 text-slate-950 font-bold">
                                        Simpan Kategori
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Edit Category */}
                {editingCat && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
                            <h3 className="text-lg font-bold text-white">Edit Kategori</h3>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">Nama Kategori</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-300">Warna Indikator</Label>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <Input
                                            type="color"
                                            value={editForm.data.color}
                                            onChange={(e) => editForm.setData('color', e.target.value)}
                                            className="size-10 p-1 bg-slate-800 border-slate-700 rounded-lg cursor-pointer"
                                        />
                                        <span className="text-xs text-slate-400 font-mono">{editForm.data.color}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setEditingCat(null)}
                                        variant="outline"
                                        className="border-slate-700 text-slate-300"
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={editForm.processing} className="bg-emerald-500 text-slate-950 font-bold">
                                        Simpan Perubahan
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
