import { Head, useForm } from '@inertiajs/react';
import {
    CreditCard,
    DollarSign,
    Edit2,
    Landmark,
    Plus,
    Smartphone,
    Trash2,
    Wallet as WalletIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import { MobileFab } from '@/components/mobile-fab';
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
        if (
            confirm(
                `Hapus dompet "${name}"? Seluruh histori transaksi akan tetap tersimpan.`,
            )
        ) {
            deleteForm.delete(`/wallets/${id}`);
        }
    };

    return (
        <>
            <Head title="Manajemen Wallet" />

            {/* Mobile FAB */}
            <MobileFab
                actions={[
                    {
                        id: 'add-wallet',
                        label: 'Tambah',
                        icon: <Plus className="size-4" />,
                        onClick: () => setIsAddModalOpen(true),
                        color: 'black',
                    },
                ]}
            />

            <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 md:p-6 md:pb-8">
                {/* Top Banner */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h1 className="text-foreground flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
                                <WalletIcon className="size-5 shrink-0 text-emerald-500 sm:size-6" />
                                <span>Dompet &amp; Akun Keuangan</span>
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm leading-snug">
                                Kelola seluruh sumber uang (Tunai, E-Wallet,
                                Rekening Bank, Tabungan Keluarga).
                            </p>
                        </div>

                        <Button
                            type="button"
                            onClick={() => setIsAddModalOpen(true)}
                            className="shrink-0 gap-1.5 text-sm font-bold shadow-sm"
                            size="sm"
                        >
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">
                                Tambah Dompet Baru
                            </span>
                            <span className="sm:hidden">Tambah</span>
                        </Button>
                    </div>
                </div>

                {/* Total Balance Card */}
                <Card className="border-border flex flex-row items-center justify-between gap-3 p-5 shadow-sm">
                    <div className="min-w-0">
                        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Total Saldo Seluruh Wallet
                        </span>
                        <div className="mt-1 truncate text-2xl font-black text-emerald-500 sm:text-3xl">
                            {formatRp(totalBalance)}
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className="shrink-0 px-2.5 py-1 text-xs font-semibold"
                    >
                        {wallets.length} Dompet
                    </Badge>
                </Card>

                {/* Wallets Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {wallets.map((w) => (
                        <Card
                            key={w.id}
                            className="border-border hover:border-accent flex flex-col justify-between space-y-4 rounded-2xl p-5 shadow-sm transition-all"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted border-border rounded-xl border p-3">
                                            {getTypeIcon(w.type)}
                                        </div>
                                        <div>
                                            <h3 className="text-foreground text-lg font-bold">
                                                {w.name}
                                            </h3>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-semibold uppercase"
                                            >
                                                {w.type === 'cash'
                                                    ? 'Tunai / Cash'
                                                    : w.type === 'digital'
                                                        ? 'E-Wallet'
                                                        : w.type === 'bank'
                                                            ? 'Bank'
                                                            : 'Tabungan'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            onClick={() => handleOpenEdit(w)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-foreground h-auto p-1.5"
                                        >
                                            <Edit2 className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(w.id, w.name)
                                            }
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-1.5 text-rose-500 hover:text-rose-600"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>

                                {w.account_number && (
                                    <p className="text-muted-foreground mt-2 font-mono text-xs">
                                        No. Rek/Akun: {w.account_number}
                                    </p>
                                )}
                            </div>

                            <div className="border-border flex items-end justify-between gap-2 border-t pt-4">
                                <span className="text-muted-foreground shrink-0 text-xs">
                                    Saldo Saat Ini
                                </span>
                                <span className="text-foreground truncate text-right font-mono text-base font-bold sm:text-xl">
                                    {formatRp(Number(w.balance))}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Dialog Add Wallet */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Tambah Dompet Baru</DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleAddSubmit}
                            className="space-y-4 pt-2"
                        >
                            <div>
                                <Label>Nama Dompet</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Dompet Fisik, GoPay, Bank BCA"
                                    value={addForm.data.name}
                                    onChange={(e) =>
                                        addForm.setData('name', e.target.value)
                                    }
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Jenis Dompet</Label>
                                <Select
                                    value={addForm.data.type}
                                    onValueChange={(val) =>
                                        addForm.setData('type', val as any)
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Pilih jenis dompet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">
                                            Tunai (Cash)
                                        </SelectItem>
                                        <SelectItem value="digital">
                                            Digital / E-Wallet (GoPay, OVO,
                                            ShopeePay)
                                        </SelectItem>
                                        <SelectItem value="bank">
                                            Rekening Bank (BCA, Mandiri, BRI,
                                            dll)
                                        </SelectItem>
                                        <SelectItem value="saving">
                                            Tabungan Khusus (Tabungan Nikah,
                                            Pendidikan)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Saldo Awal</Label>
                                <CurrencyInput
                                    placeholder="0"
                                    value={addForm.data.balance}
                                    onChangeValue={(val) =>
                                        addForm.setData('balance', val)
                                    }
                                    className="mt-1 text-lg font-bold"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Nomor Rekening / Akun (Opsional)</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: 1234567890"
                                    value={addForm.data.account_number}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'account_number',
                                            e.target.value,
                                        )
                                    }
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
                                <Button
                                    type="submit"
                                    disabled={addForm.processing}
                                    className="font-bold"
                                >
                                    Simpan Dompet
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog Edit Wallet */}
                {editingWallet && (
                    <Dialog
                        open={!!editingWallet}
                        onOpenChange={() => setEditingWallet(null)}
                    >
                        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Dompet</DialogTitle>
                            </DialogHeader>

                            <form
                                onSubmit={handleEditSubmit}
                                className="space-y-4 pt-2"
                            >
                                <div>
                                    <Label>Nama Dompet</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Jenis Dompet</Label>
                                    <Select
                                        value={editForm.data.type}
                                        onValueChange={(val) =>
                                            editForm.setData('type', val as any)
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih jenis dompet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">
                                                Tunai (Cash)
                                            </SelectItem>
                                            <SelectItem value="digital">
                                                Digital / E-Wallet
                                            </SelectItem>
                                            <SelectItem value="bank">
                                                Rekening Bank
                                            </SelectItem>
                                            <SelectItem value="saving">
                                                Tabungan Khusus
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Nomor Rekening / Akun</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.account_number}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'account_number',
                                                e.target.value,
                                            )
                                        }
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
