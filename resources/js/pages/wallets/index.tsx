import { Head, useForm } from '@inertiajs/react';
import { CreditCard, DollarSign, Landmark, Plus, Smartphone, Trash2, Wallet as WalletIcon, Edit2 } from 'lucide-react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

    const formatRp = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'digital':
                return <Smartphone className="size-5 text-cyan-400" />;
            case 'bank':
                return <Landmark className="size-5 text-blue-400" />;
            case 'saving':
                return <CreditCard className="size-5 text-purple-400" />;
            default:
                return <DollarSign className="size-5 text-emerald-400" />;
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
        if (confirm(`Hapus dompet "${name}"? Seluruh histori akan tetap ada.`)) {
            deleteForm.delete(`/wallets/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dompet & Akun', href: '/wallets' }]}>
            <Head title="Manajemen Wallet" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Top Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <WalletIcon className="size-6 text-emerald-400" />
                            Dompet & Akun Keuangan
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Kelola seluruh sumber uang (Tunai, E-Wallet, Rekening Bank, Tabungan Keluarga).
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="size-4" />
                        Tambah Dompet Baru
                    </Button>
                </div>

                {/* Total Balance Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Harta Uang Keluarga</span>
                        <div className="text-3xl font-black text-emerald-400 mt-1">{formatRp(totalBalance)}</div>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                        {wallets.length} Dompet Aktif
                    </div>
                </div>

                {/* Wallets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wallets.map((w) => (
                        <div
                            key={w.id}
                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-lg space-y-4 flex flex-col justify-between transition-all"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                                            {getTypeIcon(w.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{w.name}</h3>
                                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                {w.type === 'cash' ? 'Tunai / Cash' : w.type === 'digital' ? 'E-Wallet' : w.type === 'bank' ? 'Bank' : 'Tabungan'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            onClick={() => handleOpenEdit(w)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Edit2 className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleDelete(w.id, w.name)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>

                                {w.account_number && (
                                    <p className="text-xs text-slate-400 mt-2 font-mono">
                                        No. Rek/Akun: {w.account_number}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-800/80 flex items-end justify-between">
                                <span className="text-xs text-slate-400">Saldo Saat Ini</span>
                                <span className="text-xl font-bold font-mono text-white">{formatRp(Number(w.balance))}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Add Wallet */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
                            <h3 className="text-lg font-bold text-white">Tambah Dompet Baru</h3>
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">Nama Dompet</Label>
                                    <Input
                                        type="text"
                                        placeholder="Contoh: Dompet Fisik, GoPay, Bank BCA"
                                        value={addForm.data.name}
                                        onChange={(e) => addForm.setData('name', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-300">Jenis Dompet</Label>
                                    <select
                                        value={addForm.data.type}
                                        onChange={(e) => addForm.setData('type', e.target.value as any)}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="cash">Tunai (Cash)</option>
                                        <option value="digital">Digital / E-Wallet (GoPay, OVO, ShopeePay)</option>
                                        <option value="bank">Rekening Bank (BCA, Mandiri, BRI, dll)</option>
                                        <option value="saving">Tabungan Khusus (Tabungan Nikah, Pendidikan)</option>
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-slate-300">Saldo Awal (Rp)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={addForm.data.balance}
                                        onChange={(e) => addForm.setData('balance', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-300">Nomor Rekening / Akun (Opsional)</Label>
                                    <Input
                                        type="text"
                                        placeholder="Contoh: 1234567890"
                                        value={addForm.data.account_number}
                                        onChange={(e) => addForm.setData('account_number', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        variant="outline"
                                        className="border-slate-700 text-slate-300"
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={addForm.processing} className="bg-emerald-500 text-slate-950 font-bold">
                                        Simpan Dompet
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Edit Wallet */}
                {editingWallet && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
                            <h3 className="text-lg font-bold text-white">Edit Dompet</h3>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">Nama Dompet</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-300">Jenis Dompet</Label>
                                    <select
                                        value={editForm.data.type}
                                        onChange={(e) => editForm.setData('type', e.target.value as any)}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="cash">Tunai (Cash)</option>
                                        <option value="digital">Digital / E-Wallet</option>
                                        <option value="bank">Rekening Bank</option>
                                        <option value="saving">Tabungan Khusus</option>
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-slate-300">Nomor Rekening / Akun</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.account_number}
                                        onChange={(e) => editForm.setData('account_number', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setEditingWallet(null)}
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
