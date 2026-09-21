import { Head, useForm } from '@inertiajs/react';
import { CreditCard, DollarSign, Edit2, Landmark, Plus, Smartphone, Trash2, Wallet as WalletIcon } from 'lucide-react';
import React, { useState } from 'react';
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

interface Wallet {
    id: number;
    name: string;
    type: 'cash' | 'digital' | 'saving' | 'bank';
    balance: string;
    account_number: string | null;
}

interface WalletsProps {
    wallets: Wallet[];
    totalBalance: number;
}

export default function WalletsIndex({ wallets, totalBalance }: WalletsProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

    const addForm = useForm({
        name: '',
        type: 'cash' as 'cash' | 'digital' | 'saving' | 'bank',
        balance: '0',
        account_number: '',
    });

    const editForm = useForm({
        name: '',
        type: 'cash' as 'cash' | 'digital' | 'saving' | 'bank',
        account_number: '',
    });

    const deleteForm = useForm({});

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'digital':
                return <Smartphone className="size-5 text-cyan-500" />;
            case 'bank':
                return <Landmark className="size-5 text-blue-500" />;
            case 'saving':
                return <CreditCard className="size-5 text-purple-500" />;
            default:
                return <DollarSign className="size-5 text-emerald-500" />;
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/wallets', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
            },
        });
    };

    const handleOpenEdit = (wallet: Wallet) => {
        setEditingWallet(wallet);
        editForm.setData({
            name: wallet.name,
            type: wallet.type,
            account_number: wallet.account_number || '',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingWallet) return;
        editForm.put(`/wallets/${editingWallet.id}`, {
            onSuccess: () => setEditingWallet(null),
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Hapus dompet "${name}"? Seluruh histori transaksi akan tetap tersimpan.`)) {
            deleteForm.delete(`/wallets/${id}`);
        }
    };

    return (
        <>
            <Head title="Manajemen Wallet" />

            <div className="p-4 md:p-6 pb-28 md:pb-8 space-y-6 max-w-7xl mx-auto">
                {/* Top Banner */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 flex-wrap">
                                <WalletIcon className="size-5 sm:size-6 text-emerald-500 shrink-0" />
                                <span>Dompet &amp; Akun Keuangan</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1 leading-snug">
                                Kelola seluruh sumber uang (Tunai, E-Wallet, Rekening Bank, Tabungan Keluarga).
                            </p>
                        </div>

                        <Button
                            type="button"
                            onClick={() => setIsAddModalOpen(true)}
                            className="font-bold gap-1.5 shadow-sm shrink-0 text-sm"
                            size="sm"
                        >
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">Tambah Dompet Baru</span>
                            <span className="sm:hidden">Tambah</span>
                        </Button>
                    </div>
                </div>

                {/* Total Balance Card */}
                <Card className="shadow-sm border-border p-5 flex flex-row items-center justify-between gap-3">
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Saldo Seluruh Wallet</span>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1 truncate">{formatRp(totalBalance)}</div>
                    </div>
                    <Badge variant="outline" className="text-xs px-2.5 py-1 font-semibold shrink-0">
                        {wallets.length} Dompet
                    </Badge>
                </Card>

                {/* Wallets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wallets.map((w) => (
                        <Card
                            key={w.id}
                            className="shadow-sm border-border hover:border-accent rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-muted rounded-xl border border-border">
                                            {getTypeIcon(w.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground text-lg">{w.name}</h3>
                                            <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                                                {w.type === 'cash' ? 'Tunai / Cash' : w.type === 'digital' ? 'E-Wallet' : w.type === 'bank' ? 'Bank' : 'Tabungan'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            onClick={() => handleOpenEdit(w)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-foreground p-1.5 h-auto"
                                        >
                                            <Edit2 className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleDelete(w.id, w.name)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-rose-500 hover:text-rose-600 p-1.5 h-auto"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>

                                {w.account_number && (
                                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                                        No. Rek/Akun: {w.account_number}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-border flex items-end justify-between gap-2">
                                <span className="text-xs text-muted-foreground shrink-0">Saldo Saat Ini</span>
                                <span className="text-base sm:text-xl font-bold font-mono text-foreground truncate text-right">{formatRp(Number(w.balance))}</span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Dialog Add Wallet */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Tambah Dompet Baru</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
                            <div>
                                <Label>Nama Dompet</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Dompet Fisik, GoPay, Bank BCA"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Jenis Dompet</Label>
                                <Select
                                    value={addForm.data.type}
                                    onValueChange={(val) => addForm.setData('type', val as any)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Pilih jenis dompet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Tunai (Cash)</SelectItem>
                                        <SelectItem value="digital">Digital / E-Wallet (GoPay, OVO, ShopeePay)</SelectItem>
                                        <SelectItem value="bank">Rekening Bank (BCA, Mandiri, BRI, dll)</SelectItem>
                                        <SelectItem value="saving">Tabungan Khusus (Tabungan Nikah, Pendidikan)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Saldo Awal</Label>
                                <CurrencyInput
                                    placeholder="0"
                                    value={addForm.data.balance}
                                    onChangeValue={(val) => addForm.setData('balance', val)}
                                    className="mt-1 font-bold text-lg"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Nomor Rekening / Akun (Opsional)</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: 1234567890"
                                    value={addForm.data.account_number}
                                    onChange={(e) => addForm.setData('account_number', e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    variant="outline"
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={addForm.processing} className="font-bold">
                                    Simpan Dompet
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog Edit Wallet */}
                {editingWallet && (
                    <Dialog open={!!editingWallet} onOpenChange={() => setEditingWallet(null)}>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Dompet</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                                <div>
                                    <Label>Nama Dompet</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Jenis Dompet</Label>
                                    <Select
                                        value={editForm.data.type}
                                        onValueChange={(val) => editForm.setData('type', val as any)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih jenis dompet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Tunai (Cash)</SelectItem>
                                            <SelectItem value="digital">Digital / E-Wallet</SelectItem>
                                            <SelectItem value="bank">Rekening Bank</SelectItem>
                                            <SelectItem value="saving">Tabungan Khusus</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Nomor Rekening / Akun</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.account_number}
                                        onChange={(e) => editForm.setData('account_number', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setEditingWallet(null)}
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
