import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    Edit2,
    Filter,
    Plus,
    Receipt,
    RotateCcw,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CategoryIcon } from '@/components/category-icon';
import { formatDateHuman, formatDateWithDay, formatRp } from '@/lib/formatters';

interface Wallet {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    type: string;
    icon?: string | null;
    color?: string | null;
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
    category?: {
        id: number;
        name: string;
        color: string | null;
        icon: string | null;
    };
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

export default function TransactionsIndex({
    transactions,
    wallets,
    categories,
    members,
    filters,
}: TransactionsProps) {
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
            { preserveState: true, replace: true },
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
        if (
            confirm(
                'Hapus transaksi ini? Saldo dompet terkait akan disesuaikan secara otomatis.',
            )
        ) {
            deleteForm.delete(`/transactions/${id}`);
        }
    };

    const hasActiveFilters = Boolean(
        typeFilter || filters.wallet_id || filters.category_id || search,
    );

    return (
        <>
            <Head title="Histori Transaksi" />

            <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 md:pb-10">
                {/* Top Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
                            <Receipt className="text-primary size-6" />
                            Catatan Transaksi Keuangan
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                            Histori lengkap pengeluaran, pemasukan, dan transfer
                            antar wallet keluarga.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="w-full shrink-0 gap-2 font-semibold shadow-xs sm:w-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Transaksi
                    </Button>
                </div>

                {/* Filter Toolbar */}
                <Card className="border-border p-4 shadow-xs">
                    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative w-full">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                type="text"
                                placeholder="Cari catatan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    handleFilterChange('search', search)
                                }
                                className="w-full pl-9 text-sm"
                            />
                        </div>

                        <Select
                            value={typeFilter || 'all'}
                            onValueChange={(val) => {
                                const nextVal = val === 'all' ? '' : val;
                                setTypeFilter(nextVal);
                                handleFilterChange('type', nextVal);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Semua Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jenis</SelectItem>
                                <SelectItem value="expense">
                                    Pengeluaran
                                </SelectItem>
                                <SelectItem value="income">
                                    Pemasukan
                                </SelectItem>
                                <SelectItem value="transfer">
                                    Transfer
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={
                                filters.wallet_id
                                    ? String(filters.wallet_id)
                                    : 'all'
                            }
                            onValueChange={(val) => {
                                const nextVal = val === 'all' ? '' : val;
                                handleFilterChange('wallet_id', nextVal);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Semua Wallet" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Wallet
                                </SelectItem>
                                {wallets.map((w) => (
                                    <SelectItem key={w.id} value={String(w.id)}>
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={
                                filters.category_id
                                    ? String(filters.category_id)
                                    : 'all'
                            }
                            onValueChange={(val) => {
                                const nextVal = val === 'all' ? '' : val;
                                handleFilterChange('category_id', nextVal);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Kategori
                                </SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name} (
                                        {c.type === 'income'
                                            ? 'Pemasukan'
                                            : 'Pengeluaran'}
                                        )
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {hasActiveFilters && (
                        <div className="border-border mt-3 flex justify-end border-t pt-3">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setTypeFilter('');
                                    setSearch('');
                                    router.get(
                                        '/transactions',
                                        {},
                                        { preserveState: true, replace: true },
                                    );
                                }}
                                className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
                            >
                                <RotateCcw className="size-3.5" />
                                Reset Filter
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Desktop View Table (hidden on mobile) */}
                <Card className="border-border hidden overflow-hidden shadow-xs md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-border bg-muted/50 text-muted-foreground border-b text-xs font-semibold tracking-wider uppercase">
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4">Jenis & Kategori</th>
                                    <th className="p-4">
                                        Dicatat oleh / Dibayar oleh
                                    </th>
                                    <th className="p-4">
                                        Sumber / Tujuan Wallet
                                    </th>
                                    <th className="p-4 text-right">
                                        Jumlah (Rp)
                                    </th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y text-sm">
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="hover:bg-muted/40 transition-colors"
                                        >
                                            <td className="text-foreground p-4 text-xs font-medium whitespace-nowrap">
                                                {formatDateWithDay(
                                                    tx.transaction_date,
                                                )}
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className="border-border flex shrink-0 items-center justify-center rounded-lg border p-2"
                                                        style={{
                                                            backgroundColor: tx
                                                                .category?.color
                                                                ? `${tx.category.color}20`
                                                                : 'var(--muted)',
                                                            borderColor: tx
                                                                .category?.color
                                                                ? `${tx.category.color}40`
                                                                : 'var(--border)',
                                                        }}
                                                    >
                                                        {tx.type ===
                                                        'transfer' ? (
                                                            <ArrowLeftRight className="size-4 text-amber-500" />
                                                        ) : (
                                                            <CategoryIcon
                                                                name={
                                                                    tx.category
                                                                        ?.icon
                                                                }
                                                                color={
                                                                    tx.category
                                                                        ?.color
                                                                }
                                                                className="size-4"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-foreground block font-semibold">
                                                            {tx.category
                                                                ?.name ||
                                                                (tx.type ===
                                                                'transfer'
                                                                    ? 'Transfer Antar Wallet'
                                                                    : 'Transaksi')}
                                                        </span>
                                                        {tx.note && (
                                                            <p className="text-muted-foreground line-clamp-1 text-xs">
                                                                {tx.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="text-xs">
                                                    <span className="text-foreground block font-medium">
                                                        Dibayar:{' '}
                                                        <strong className="text-emerald-500">
                                                            {tx.payer?.name ||
                                                                '-'}
                                                        </strong>
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        Input:{' '}
                                                        {tx.creator?.name ||
                                                            '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="text-foreground p-4 text-xs">
                                                {tx.type === 'income' &&
                                                    tx.wallet_to && (
                                                        <span className="font-medium text-blue-500">
                                                            Masuk ke:{' '}
                                                            {tx.wallet_to.name}
                                                        </span>
                                                    )}
                                                {tx.type === 'expense' &&
                                                    tx.wallet_from && (
                                                        <span className="font-medium text-rose-500">
                                                            Dari:{' '}
                                                            {
                                                                tx.wallet_from
                                                                    .name
                                                            }
                                                        </span>
                                                    )}
                                                {tx.type === 'transfer' && (
                                                    <span className="font-medium text-amber-500">
                                                        {tx.wallet_from?.name}{' '}
                                                        &rarr;{' '}
                                                        {tx.wallet_to?.name}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-right font-mono font-bold whitespace-nowrap">
                                                <span
                                                    className={
                                                        tx.type === 'income'
                                                            ? 'text-blue-500'
                                                            : tx.type ===
                                                                'expense'
                                                              ? 'text-rose-500'
                                                              : 'text-amber-500'
                                                    }
                                                >
                                                    {tx.type === 'income'
                                                        ? '+'
                                                        : tx.type === 'expense'
                                                          ? '-'
                                                          : ''}
                                                    {formatRp(
                                                        Number(tx.amount),
                                                    )}
                                                </span>
                                            </td>

                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        type="button"
                                                        onClick={() =>
                                                            handleOpenEdit(tx)
                                                        }
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-muted-foreground hover:text-foreground h-auto p-1"
                                                    >
                                                        <Edit2 className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(tx.id)
                                                        }
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-auto p-1 text-rose-500 hover:text-rose-600"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-muted-foreground p-8 text-center text-sm"
                                        >
                                            Tidak ada transaksi ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Mobile View Card List (Mobile-Friendly Responsive Cards) */}
                <div className="block space-y-3 md:hidden">
                    {transactions.data.length > 0 ? (
                        transactions.data.map((tx) => (
                            <Card
                                key={tx.id}
                                className="border-border space-y-3 p-4 shadow-xs"
                            >
                                <div className="border-border flex items-start justify-between gap-3 border-b pb-2.5">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div
                                            className="border-border flex shrink-0 items-center justify-center rounded-lg border p-2"
                                            style={{
                                                backgroundColor: tx.category
                                                    ?.color
                                                    ? `${tx.category.color}20`
                                                    : 'var(--muted)',
                                                borderColor: tx.category?.color
                                                    ? `${tx.category.color}40`
                                                    : 'var(--border)',
                                            }}
                                        >
                                            {tx.type === 'transfer' ? (
                                                <ArrowLeftRight className="size-4 text-amber-500" />
                                            ) : (
                                                <CategoryIcon
                                                    name={tx.category?.icon}
                                                    color={tx.category?.color}
                                                    className="size-4"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-foreground truncate text-sm font-semibold">
                                                {tx.category?.name ||
                                                    (tx.type === 'transfer'
                                                        ? 'Transfer'
                                                        : 'Transaksi')}
                                            </h4>
                                            <span className="text-muted-foreground block text-[11px] font-medium">
                                                {formatDateHuman(
                                                    tx.transaction_date,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <span
                                        className={`shrink-0 font-mono text-sm font-bold sm:text-base ${
                                            tx.type === 'income'
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : tx.type === 'expense'
                                                  ? 'text-rose-600 dark:text-rose-400'
                                                  : 'text-amber-600 dark:text-amber-400'
                                        }`}
                                    >
                                        {tx.type === 'income'
                                            ? '+'
                                            : tx.type === 'expense'
                                              ? '-'
                                              : ''}
                                        {formatRp(Number(tx.amount))}
                                    </span>
                                </div>

                                <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
                                    <div className="min-w-0 space-y-0.5">
                                        <span>
                                            Dibayar:{' '}
                                            <strong className="text-foreground font-semibold">
                                                {tx.payer?.name || '-'}
                                            </strong>
                                        </span>
                                        {tx.wallet_from && (
                                            <span className="block truncate">
                                                Wallet: {tx.wallet_from.name}
                                            </span>
                                        )}
                                        {tx.wallet_to &&
                                            tx.type === 'income' && (
                                                <span className="block truncate">
                                                    Wallet: {tx.wallet_to.name}
                                                </span>
                                            )}
                                        {tx.type === 'transfer' &&
                                            tx.wallet_from &&
                                            tx.wallet_to && (
                                                <span className="block truncate">
                                                    {tx.wallet_from.name} &rarr;{' '}
                                                    {tx.wallet_to.name}
                                                </span>
                                            )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <Button
                                            type="button"
                                            onClick={() => handleOpenEdit(tx)}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-2.5 text-xs"
                                        >
                                            <Edit2 className="mr-1 size-3.5" />{' '}
                                            Edit
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
                                    <p className="text-muted-foreground bg-muted/60 rounded-lg p-2 text-xs break-words italic">
                                        "{tx.note}"
                                    </p>
                                )}
                            </Card>
                        ))
                    ) : (
                        <Card className="text-muted-foreground p-6 text-center text-sm">
                            Tidak ada transaksi ditemukan.
                        </Card>
                    )}
                </div>

                {/* Dialog Add Transaction */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Catat Transaksi Baru</DialogTitle>
                        </DialogHeader>

                        {/* Type Tabs */}
                        <div className="bg-muted grid grid-cols-3 gap-2 rounded-xl p-1">
                            <button
                                type="button"
                                onClick={() =>
                                    addForm.setData('type', 'expense')
                                }
                                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                                    addForm.data.type === 'expense'
                                        ? 'bg-rose-500 text-white shadow-xs'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                Pengeluaran
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    addForm.setData('type', 'income')
                                }
                                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                                    addForm.data.type === 'income'
                                        ? 'bg-blue-500 text-white shadow-xs'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                Pemasukan
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    addForm.setData('type', 'transfer')
                                }
                                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                                    addForm.data.type === 'transfer'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                Transfer
                            </button>
                        </div>

                        <form
                            onSubmit={handleAddSubmit}
                            className="space-y-4 pt-2"
                        >
                            <div>
                                <Label>Jumlah Transaksi</Label>
                                <CurrencyInput
                                    placeholder="0"
                                    value={addForm.data.amount}
                                    onChangeValue={(val) =>
                                        addForm.setData('amount', val)
                                    }
                                    className="mt-1 text-lg font-bold"
                                    required
                                />
                            </div>

                            {addForm.data.type !== 'transfer' && (
                                <div>
                                    <Label>Kategori</Label>
                                    <select
                                        value={addForm.data.category_id}
                                        onChange={(e) =>
                                            addForm.setData(
                                                'category_id',
                                                e.target.value,
                                            )
                                        }
                                        className="bg-background border-input text-foreground focus:ring-ring mt-1 w-full rounded-md border p-2.5 text-sm focus:ring-2"
                                        required
                                    >
                                        <option value="">
                                            -- Pilih Kategori --
                                        </option>
                                        {categories
                                            .filter(
                                                (c) =>
                                                    c.type ===
                                                    addForm.data.type,
                                            )
                                            .map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {(addForm.data.type === 'expense' ||
                                    addForm.data.type === 'transfer') && (
                                    <div>
                                        <Label>Wallet Asal</Label>
                                        <select
                                            value={addForm.data.wallet_from_id}
                                            onChange={(e) =>
                                                addForm.setData(
                                                    'wallet_from_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-background border-input text-foreground mt-1 w-full rounded-md border p-2.5 text-sm"
                                            required
                                        >
                                            <option value="">
                                                -- Pilih Wallet --
                                            </option>
                                            {wallets.map((w) => (
                                                <option key={w.id} value={w.id}>
                                                    {w.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {(addForm.data.type === 'income' ||
                                    addForm.data.type === 'transfer') && (
                                    <div>
                                        <Label>Wallet Tujuan</Label>
                                        <select
                                            value={addForm.data.wallet_to_id}
                                            onChange={(e) =>
                                                addForm.setData(
                                                    'wallet_to_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-background border-input text-foreground mt-1 w-full rounded-md border p-2.5 text-sm"
                                            required
                                        >
                                            <option value="">
                                                -- Pilih Wallet --
                                            </option>
                                            {wallets.map((w) => (
                                                <option key={w.id} value={w.id}>
                                                    {w.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>Siapa Yang Membayar?</Label>
                                    <select
                                        value={addForm.data.paid_by}
                                        onChange={(e) =>
                                            addForm.setData(
                                                'paid_by',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="bg-background border-input text-foreground mt-1 w-full rounded-md border p-2.5 text-sm"
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
                                        onChange={(e) =>
                                            addForm.setData(
                                                'transaction_date',
                                                e.target.value,
                                            )
                                        }
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
                                    onChange={(e) =>
                                        addForm.setData('note', e.target.value)
                                    }
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
                                <Button
                                    type="submit"
                                    disabled={addForm.processing}
                                    className="font-bold"
                                >
                                    Simpan Transaksi
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog Edit Transaction */}
                {editingTx && (
                    <Dialog
                        open={!!editingTx}
                        onOpenChange={() => setEditingTx(null)}
                    >
                        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Transaksi</DialogTitle>
                            </DialogHeader>

                            <form
                                onSubmit={handleEditSubmit}
                                className="space-y-4 pt-2"
                            >
                                <div>
                                    <Label>Jumlah Transaksi</Label>
                                    <CurrencyInput
                                        value={editForm.data.amount}
                                        onChangeValue={(val) =>
                                            editForm.setData('amount', val)
                                        }
                                        className="mt-1 text-lg font-bold"
                                        required
                                    />
                                </div>

                                {editForm.data.type !== 'transfer' && (
                                    <div>
                                        <Label>Kategori</Label>
                                        <select
                                            value={editForm.data.category_id}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'category_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-background border-input text-foreground mt-1 w-full rounded-md border p-2.5 text-sm"
                                            required
                                        >
                                            <option value="">
                                                -- Pilih Kategori --
                                            </option>
                                            {categories
                                                .filter(
                                                    (c) =>
                                                        c.type ===
                                                        editForm.data.type,
                                                )
                                                .map((c) => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Siapa Yang Membayar?</Label>
                                        <select
                                            value={editForm.data.paid_by}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'paid_by',
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-background border-input text-foreground mt-1 w-full rounded-md border p-2.5 text-sm"
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
                                            value={
                                                editForm.data.transaction_date
                                            }
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'transaction_date',
                                                    e.target.value,
                                                )
                                            }
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
                                        onChange={(e) =>
                                            editForm.setData(
                                                'note',
                                                e.target.value,
                                            )
                                        }
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
                                    <Button
                                        type="submit"
                                        disabled={editForm.processing}
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
