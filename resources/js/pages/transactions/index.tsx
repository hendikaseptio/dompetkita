import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    Calendar,
    Filter,
    Plus,
    Receipt,
    Search,
    Trash2,
    User,
    Wallet as WalletIcon,
    Edit2,
} from 'lucide-react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Wallet {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    type: string;
}

interface Member {
    id: number;
    name: string;
}

interface Transaction {
    id: number;
    type: 'income' | 'expense' | 'transfer';
    amount: string;
    paid_by: number;
    transaction_date: string;
    note: string | null;
    category_id: number | null;
    wallet_from_id: number | null;
    wallet_to_id: number | null;
    creator?: { id: number; name: string };
    payer?: { id: number; name: string };
    category?: { id: number; name: string; color: string | null };
    wallet_from?: { id: number; name: string };
    wallet_to?: { id: number; name: string };
}

interface TransactionsProps {
    transactions: {
        data: Transaction[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    wallets: Wallet[];
    categories: Category[];
    members: Member[];
    filters: {
        type?: string;
        category_id?: string;
        wallet_id?: string;
        month?: string;
        year?: string;
        search?: string;
    };
}

export default function TransactionsIndex({ transactions, wallets, categories, members, filters }: TransactionsProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [search, setSearch] = useState(filters.search || '');

    const addForm = useForm({
        type: 'expense' as 'income' | 'expense' | 'transfer',
        amount: '',
        paid_by: members[0]?.id || '',
        transaction_date: new Date().toISOString().split('T')[0],
        category_id: '',
        wallet_from_id: wallets[0]?.id || '',
        wallet_to_id: wallets[1]?.id || wallets[0]?.id || '',
        note: '',
    });

    const editForm = useForm({
        type: 'expense' as 'income' | 'expense' | 'transfer',
        amount: '',
        paid_by: '',
        transaction_date: '',
        category_id: '',
        wallet_from_id: '',
        wallet_to_id: '',
        note: '',
    });

    const deleteForm = useForm({});

    const formatRp = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num);
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/transactions',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/transactions', {
            onSuccess: () => {
                setIsAddOpen(false);
                addForm.reset();
            },
        });
    };

    const handleOpenEdit = (tx: Transaction) => {
        setEditingTx(tx);
        editForm.setData({
            type: tx.type,
            amount: tx.amount,
            paid_by: tx.paid_by,
            transaction_date: tx.transaction_date,
            category_id: tx.category_id ? String(tx.category_id) : '',
            wallet_from_id: tx.wallet_from_id ? String(tx.wallet_from_id) : '',
            wallet_to_id: tx.wallet_to_id ? String(tx.wallet_to_id) : '',
            note: tx.note || '',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTx) return;
        editForm.put(`/transactions/${editingTx.id}`, {
            onSuccess: () => setEditingTx(null),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus transaksi ini? Saldo dompet terkait akan disesuaikan secara otomatis.')) {
            deleteForm.delete(`/transactions/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Transaksi', href: '/transactions' }]}>
            <Head title="Histori Transaksi" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Receipt className="size-6 text-emerald-400" />
                            Catatan Transaksi Keuangan
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Histori lengkap pengeluaran, pemasukan, dan transfer antar wallet keluarga.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="size-4" />
                        Tambah Transaksi
                    </Button>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari catatan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', search)}
                                className="bg-slate-800 border-slate-700 pl-9 text-white text-sm"
                            />
                        </div>

                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                handleFilterChange('type', e.target.value);
                            }}
                            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Semua Jenis</option>
                            <option value="expense">Pengeluaran</option>
                            <option value="income">Pemasukan</option>
                            <option value="transfer">Transfer</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={filters.wallet_id || ''}
                            onChange={(e) => handleFilterChange('wallet_id', e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Semua Wallet</option>
                            {wallets.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.category_id || ''}
                            onChange={(e) => handleFilterChange('category_id', e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.type})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-800/40 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4">Jenis & Kategori</th>
                                    <th className="p-4">Dicatat oleh / Dibayar oleh</th>
                                    <th className="p-4">Sumber / Tujuan Wallet</th>
                                    <th className="p-4 text-right">Jumlah (Rp)</th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80 text-sm">
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="p-4 text-slate-300 font-mono text-xs whitespace-nowrap">
                                                {tx.transaction_date}
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={`p-2 rounded-lg ${
                                                            tx.type === 'income'
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
                                                            <ArrowLeftRight className="size-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-white block">
                                                            {tx.category?.name || (tx.type === 'transfer' ? 'Transfer Antar Wallet' : 'Transaksi')}
                                                        </span>
                                                        {tx.note && <p className="text-xs text-slate-400 line-clamp-1">{tx.note}</p>}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="text-xs">
                                                    <span className="text-slate-300 font-medium block">
                                                        Dibayar: <strong className="text-emerald-400">{tx.payer?.name || '-'}</strong>
                                                    </span>
                                                    <span className="text-slate-500">
                                                        Input: {tx.creator?.name || '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-4 text-xs text-slate-300">
                                                {tx.type === 'income' && tx.wallet_to && (
                                                    <span className="text-blue-400 font-medium">Masuk ke: {tx.wallet_to.name}</span>
                                                )}
                                                {tx.type === 'expense' && tx.wallet_from && (
                                                    <span className="text-rose-400 font-medium">Dari: {tx.wallet_from.name}</span>
                                                )}
                                                {tx.type === 'transfer' && (
                                                    <span className="text-amber-400 font-medium">
                                                        {tx.wallet_from?.name} &rarr; {tx.wallet_to?.name}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-right font-mono font-bold whitespace-nowrap">
                                                <span
                                                    className={
                                                        tx.type === 'income'
                                                            ? 'text-blue-400'
                                                            : tx.type === 'expense'
                                                            ? 'text-rose-400'
                                                            : 'text-amber-400'
                                                    }
                                                >
                                                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                                    {formatRp(Number(tx.amount))}
                                                </span>
                                            </td>

                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(tx)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-400 hover:text-white p-1 h-auto"
                                                    >
                                                        <Edit2 className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleDelete(tx.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-rose-400 hover:text-rose-300 p-1 h-auto"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                                            Tidak ada transaksi ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Add Transaction */}
                {isAddOpen && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
                            <h3 className="text-lg font-bold text-white">Catat Transaksi Baru</h3>

                            {/* Type Tabs */}
                            <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => addForm.setData('type', 'expense')}
                                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        addForm.data.type === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-slate-400'
                                    }`}
                                >
                                    Pengeluaran
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addForm.setData('type', 'income')}
                                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        addForm.data.type === 'income' ? 'bg-blue-500 text-white shadow' : 'text-slate-400'
                                    }`}
                                >
                                    Pemasukan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addForm.setData('type', 'transfer')}
                                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        addForm.data.type === 'transfer' ? 'bg-amber-500 text-white shadow' : 'text-slate-400'
                                    }`}
                                >
                                    Transfer
                                </button>
                            </div>

                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">Jumlah Transaksi (Rp)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={addForm.data.amount}
                                        onChange={(e) => addForm.setData('amount', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white text-lg font-bold mt-1"
                                        required
                                    />
                                </div>

                                {addForm.data.type !== 'transfer' && (
                                    <div>
                                        <Label className="text-slate-300">Kategori</Label>
                                        <select
                                            value={addForm.data.category_id}
                                            onChange={(e) => addForm.setData('category_id', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500"
                                            required
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {categories
                                                .filter((c) => c.type === addForm.data.type)
                                                .map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {(addForm.data.type === 'expense' || addForm.data.type === 'transfer') && (
                                        <div>
                                            <Label className="text-slate-300">Wallet Asal (Sumber Uang)</Label>
                                            <select
                                                value={addForm.data.wallet_from_id}
                                                onChange={(e) => addForm.setData('wallet_from_id', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1"
                                                required
                                            >
                                                <option value="">-- Pilih Wallet --</option>
                                                {wallets.map((w) => (
                                                    <option key={w.id} value={w.id}>
                                                        {w.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {(addForm.data.type === 'income' || addForm.data.type === 'transfer') && (
                                        <div>
                                            <Label className="text-slate-300">Wallet Tujuan</Label>
                                            <select
                                                value={addForm.data.wallet_to_id}
                                                onChange={(e) => addForm.setData('wallet_to_id', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1"
                                                required
                                            >
                                                <option value="">-- Pilih Wallet --</option>
                                                {wallets.map((w) => (
                                                    <option key={w.id} value={w.id}>
                                                        {w.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-300">Siapa Yang Membayar / Melakukan?</Label>
                                        <select
                                            value={addForm.data.paid_by}
                                            onChange={(e) => addForm.setData('paid_by', Number(e.target.value))}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1"
                                            required
                                        >
                                            {members.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label className="text-slate-300">Tanggal Transaksi</Label>
                                        <Input
                                            type="date"
                                            value={addForm.data.transaction_date}
                                            onChange={(e) => addForm.setData('transaction_date', e.target.value)}
                                            className="bg-slate-800 border-slate-700 text-white mt-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-slate-300">Catatan / Keterangan (Opsional)</Label>
                                    <Input
                                        type="text"
                                        placeholder="Contoh: Beli bensin motor, Gaji bulan September"
                                        value={addForm.data.note}
                                        onChange={(e) => addForm.setData('note', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
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
                                    <Button type="submit" disabled={addForm.processing} className="bg-emerald-500 text-slate-950 font-bold">
                                        Simpan Transaksi
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Edit Transaction */}
                {editingTx && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
                            <h3 className="text-lg font-bold text-white">Edit Transaksi</h3>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">Jumlah Transaksi (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={editForm.data.amount}
                                        onChange={(e) => editForm.setData('amount', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white text-lg font-bold mt-1"
                                        required
                                    />
                                </div>

                                {editForm.data.type !== 'transfer' && (
                                    <div>
                                        <Label className="text-slate-300">Kategori</Label>
                                        <select
                                            value={editForm.data.category_id}
                                            onChange={(e) => editForm.setData('category_id', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1"
                                            required
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {categories
                                                .filter((c) => c.type === editForm.data.type)
                                                .map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-300">Siapa Yang Membayar?</Label>
                                        <select
                                            value={editForm.data.paid_by}
                                            onChange={(e) => editForm.setData('paid_by', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1"
                                            required
                                        >
                                            {members.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label className="text-slate-300">Tanggal Transaksi</Label>
                                        <Input
                                            type="date"
                                            value={editForm.data.transaction_date}
                                            onChange={(e) => editForm.setData('transaction_date', e.target.value)}
                                            className="bg-slate-800 border-slate-700 text-white mt-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-slate-300">Catatan / Keterangan</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.note}
                                        onChange={(e) => editForm.setData('note', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setEditingTx(null)}
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
