import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    Edit2,
    Filter,
    Plus,
    Receipt,
    Search,
    Trash2,
} from 'lucide-react';
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
import { formatDateHuman, formatDateWithDay, formatRp } from '@/lib/formatters';

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
            paid_by: String(tx.paid_by),
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
        <>
            <Head title="Histori Transaksi" />

            <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Receipt className="size-6 text-emerald-500" />
                            Catatan Transaksi Keuangan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Histori lengkap pengeluaran, pemasukan, dan transfer antar wallet keluarga.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="font-bold gap-2 shadow-sm"
                    >
                        <Plus className="size-4" />
                        Tambah Transaksi
                    </Button>
                </div>

                {/* Filter Toolbar */}
                <Card className="shadow-sm border-border p-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari catatan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', search)}
                                    className="pl-9 text-sm"
                                />
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value);
                                    handleFilterChange('type', e.target.value);
                                }}
                                className="bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
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
                                className="bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
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
                                className="bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
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
                </Card>

                {/* Desktop View Table (hidden on mobile) */}
                <Card className="shadow-sm border-border hidden md:block overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4">Jenis & Kategori</th>
                                    <th className="p-4">Dicatat oleh / Dibayar oleh</th>
                                    <th className="p-4">Sumber / Tujuan Wallet</th>
                                    <th className="p-4 text-right">Jumlah (Rp)</th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-sm">
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-muted/40 transition-colors">
                                            <td className="p-4 text-foreground font-medium text-xs whitespace-nowrap">
                                                {formatDateWithDay(tx.transaction_date)}
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={`p-2 rounded-lg ${
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
                                                            <ArrowLeftRight className="size-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-foreground block">
                                                            {tx.category?.name || (tx.type === 'transfer' ? 'Transfer Antar Wallet' : 'Transaksi')}
                                                        </span>
                                                        {tx.note && <p className="text-xs text-muted-foreground line-clamp-1">{tx.note}</p>}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="text-xs">
                                                    <span className="text-foreground font-medium block">
                                                        Dibayar: <strong className="text-emerald-500">{tx.payer?.name || '-'}</strong>
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        Input: {tx.creator?.name || '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-4 text-xs text-foreground">
                                                {tx.type === 'income' && tx.wallet_to && (
                                                    <span className="text-blue-500 font-medium">Masuk ke: {tx.wallet_to.name}</span>
                                                )}
                                                {tx.type === 'expense' && tx.wallet_from && (
                                                    <span className="text-rose-500 font-medium">Dari: {tx.wallet_from.name}</span>
                                                )}
                                                {tx.type === 'transfer' && (
                                                    <span className="text-amber-500 font-medium">
                                                        {tx.wallet_from?.name} &rarr; {tx.wallet_to?.name}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-right font-mono font-bold whitespace-nowrap">
                                                <span
                                                    className={
                                                        tx.type === 'income'
                                                            ? 'text-blue-500'
                                                            : tx.type === 'expense'
                                                            ? 'text-rose-500'
                                                            : 'text-amber-500'
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
                                                        className="text-muted-foreground hover:text-foreground p-1 h-auto"
                                                    >
                                                        <Edit2 className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleDelete(tx.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-rose-500 hover:text-rose-600 p-1 h-auto"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                                            Tidak ada transaksi ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Mobile View Card List (Mobile-Friendly Responsive Cards) */}
                <div className="block md:hidden space-y-3">
                    {transactions.data.length > 0 ? (
                        transactions.data.map((tx) => (
                            <Card key={tx.id} className="shadow-sm border-border p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`p-2 rounded-lg ${
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
                                                <ArrowLeftRight className="size-4" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground text-sm">
                                                {tx.category?.name || (tx.type === 'transfer' ? 'Transfer' : 'Transaksi')}
                                            </h4>
                                            <span className="text-[11px] text-muted-foreground font-medium">
                                                {formatDateHuman(tx.transaction_date)}
                                            </span>
                                        </div>
                                    </div>

                                    <span
                                        className={`text-base font-bold font-mono ${
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
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div>
                                        <span>Dibayar: <strong className="text-foreground font-semibold">{tx.payer?.name || '-'}</strong></span>
                                        {tx.wallet_from && <span className="block mt-0.5">Wallet: {tx.wallet_from.name}</span>}
                                        {tx.wallet_to && tx.type === 'income' && <span className="block mt-0.5">Wallet: {tx.wallet_to.name}</span>}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            onClick={() => handleOpenEdit(tx)}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-2.5 text-xs"
                                        >
                                            <Edit2 className="size-3.5 mr-1" /> Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleDelete(tx.id)}
                                            variant="destructive"
                                            size="sm"
                                            className="h-8 px-2.5 text-xs"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {tx.note && (
                                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded-lg italic">
                                        "{tx.note}"
                                    </p>
                                )}
                            </Card>
                        ))
                    ) : (
                        <Card className="p-6 text-center text-muted-foreground text-sm">
                            Tidak ada transaksi ditemukan.
                        </Card>
                    )}
                </div>

                {/* Dialog Add Transaction */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Catat Transaksi Baru</DialogTitle>
                        </DialogHeader>

                        {/* Type Tabs */}
                        <div className="grid grid-cols-3 gap-2 bg-muted p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => addForm.setData('type', 'expense')}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    addForm.data.type === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-muted-foreground'
                                }`}
                            >
                                Pengeluaran
                            </button>
                            <button
                                type="button"
                                onClick={() => addForm.setData('type', 'income')}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    addForm.data.type === 'income' ? 'bg-blue-500 text-white shadow' : 'text-muted-foreground'
                                }`}
                            >
                                Pemasukan
                            </button>
                            <button
                                type="button"
                                onClick={() => addForm.setData('type', 'transfer')}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    addForm.data.type === 'transfer' ? 'bg-amber-500 text-white shadow' : 'text-muted-foreground'
                                }`}
                            >
                                Transfer
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
                            <div>
                                <Label>Jumlah Transaksi</Label>
                                <CurrencyInput
                                    placeholder="0"
                                    value={addForm.data.amount}
                                    onChangeValue={(val) => addForm.setData('amount', val)}
                                    className="text-lg font-bold mt-1"
                                    required
                                />
                            </div>

                            {addForm.data.type !== 'transfer' && (
                                <div>
                                    <Label>Kategori</Label>
                                    <select
                                        value={addForm.data.category_id}
                                        onChange={(e) => addForm.setData('category_id', e.target.value)}
                                        className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 focus:ring-2 focus:ring-ring text-sm"
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
                                        <Label>Wallet Asal</Label>
                                        <select
                                            value={addForm.data.wallet_from_id}
                                            onChange={(e) => addForm.setData('wallet_from_id', e.target.value)}
                                            className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 text-sm"
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
                                        <Label>Wallet Tujuan</Label>
                                        <select
                                            value={addForm.data.wallet_to_id}
                                            onChange={(e) => addForm.setData('wallet_to_id', e.target.value)}
                                            className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 text-sm"
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
                                    <Label>Siapa Yang Membayar?</Label>
                                    <select
                                        value={addForm.data.paid_by}
                                        onChange={(e) => addForm.setData('paid_by', Number(e.target.value))}
                                        className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 text-sm"
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
                                    <Label>Tanggal Transaksi</Label>
                                    <Input
                                        type="date"
                                        value={addForm.data.transaction_date}
                                        onChange={(e) => addForm.setData('transaction_date', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Catatan / Keterangan (Opsional)</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Beli bensin motor, Gaji bulan September"
                                    value={addForm.data.note}
                                    onChange={(e) => addForm.setData('note', e.target.value)}
                                    className="mt-1"
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
                                <Button type="submit" disabled={addForm.processing} className="font-bold">
                                    Simpan Transaksi
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog Edit Transaction */}
                {editingTx && (
                    <Dialog open={!!editingTx} onOpenChange={() => setEditingTx(null)}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Edit Transaksi</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                                <div>
                                    <Label>Jumlah Transaksi</Label>
                                    <CurrencyInput
                                        value={editForm.data.amount}
                                        onChangeValue={(val) => editForm.setData('amount', val)}
                                        className="text-lg font-bold mt-1"
                                        required
                                    />
                                </div>

                                {editForm.data.type !== 'transfer' && (
                                    <div>
                                        <Label>Kategori</Label>
                                        <select
                                            value={editForm.data.category_id}
                                            onChange={(e) => editForm.setData('category_id', e.target.value)}
                                            className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 text-sm"
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
                                        <Label>Siapa Yang Membayar?</Label>
                                        <select
                                            value={editForm.data.paid_by}
                                            onChange={(e) => editForm.setData('paid_by', e.target.value)}
                                            className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 text-sm"
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
                                        <Label>Tanggal Transaksi</Label>
                                        <Input
                                            type="date"
                                            value={editForm.data.transaction_date}
                                            onChange={(e) => editForm.setData('transaction_date', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Catatan / Keterangan</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.note}
                                        onChange={(e) => editForm.setData('note', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setEditingTx(null)}
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
