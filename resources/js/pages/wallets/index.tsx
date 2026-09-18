import { Head, useForm } from '@inertiajs/react';
import { CreditCard, DollarSign, Edit2, Landmark, Plus, Smartphone, Trash2, Wallet as WalletIcon } from 'lucide-react';
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

            <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
                {/* Top Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <WalletIcon className="size-6 text-emerald-500" />
                            Dompet & Akun Keuangan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola seluruh sumber uang (Tunai, E-Wallet, Rekening Bank, Tabungan Keluarga).
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="font-bold gap-2 shadow-sm"
                    >
                        <Plus className="size-4" />
                        Tambah Dompet Baru
                    </Button>
                </div>

                {/* Total Balance Card */}
                <Card className="shadow-sm border-border p-6 flex flex-row items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Saldo Seluruh Wallet</span>
                        <div className="text-3xl font-black text-emerald-500 mt-1">{formatRp(totalBalance)}</div>
                    </div>
                    <Badge variant="outline" className="text-xs px-3 py-1 font-semibold">
                        {wallets.length} Dompet Aktif
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

                            <div className="pt-4 border-t border-border flex items-end justify-between">
                                <span className="text-xs text-muted-foreground">Saldo Saat Ini</span>
                                <span className="text-xl font-bold font-mono text-foreground">{formatRp(Number(w.balance))}</span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Dialog Add Wallet */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="max-w-md">
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
                                <select
                                    value={addForm.data.type}
                                    onChange={(e) => addForm.setData('type', e.target.value as any)}
                                    className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 text-sm focus:ring-2 focus:ring-ring"
                                >
                                    <option value="cash">Tunai (Cash)</option>
                                    <option value="digital">Digital / E-Wallet (GoPay, OVO, ShopeePay)</option>
                                    <option value="bank">Rekening Bank (BCA, Mandiri, BRI, dll)</option>
                                    <option value="saving">Tabungan Khusus (Tabungan Nikah, Pendidikan)</option>
                                </select>
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
                        <DialogContent className="max-w-md">
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
                                    <select
                                        value={editForm.data.type}
                                        onChange={(e) => editForm.setData('type', e.target.value as any)}
                                        className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 text-sm"
                                    >
                                        <option value="cash">Tunai (Cash)</option>
                                        <option value="digital">Digital / E-Wallet</option>
                                        <option value="bank">Rekening Bank</option>
                                        <option value="saving">Tabungan Khusus</option>
                                    </select>
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
