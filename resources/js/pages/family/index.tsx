import { Head, useForm } from '@inertiajs/react';
import { Copy, Check, Crown, Home, Shield, Trash2, UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FamilyMember {
    id: number;
    family_id: number;
    user_id: number;
    role: 'owner' | 'member';
    nickname: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface FamilyProps {
    family: {
        id: number;
        name: string;
        code: string;
        members: FamilyMember[];
    };
    allFamilies: {
        id: number;
        name: string;
        code: string;
    }[];
    userRole: 'owner' | 'member';
}

export default function FamilyIndex({ family, allFamilies, userRole }: FamilyProps) {
    const [copied, setCopied] = useState(false);
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

    const editForm = useForm({
        nickname: '',
        role: 'member' as 'owner' | 'member',
    });

    const switchForm = useForm({});

    const handleCopyCode = () => {
        navigator.clipboard.writeText(family.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenEdit = (member: FamilyMember) => {
        setEditingMember(member);
        editForm.setData({
            nickname: member.nickname || member.user.name,
            role: member.role,
        });
    };

    const handleUpdateMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;
        editForm.put(`/family/members/${editingMember.id}`, {
            onSuccess: () => setEditingMember(null),
        });
    };

    const handleRemoveMember = (memberId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus anggota ini dari keluarga?')) {
            switchForm.delete(`/family/members/${memberId}`);
        }
    };

    const handleSwitchFamily = (familyId: number) => {
        switchForm.post(`/family/switch/${familyId}`);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Keluarga Kita', href: '/family' }]}>
            <Head title="Pengaturan Keluarga" />

            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2">
                                <Home className="size-3.5" />
                                Family Household
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight">{family.name}</h1>
                            <p className="text-emerald-100 text-sm mt-1">
                                Kelola anggota keluarga, peran, dan undang pasangan untuk mengelola keuangan bersama.
                            </p>
                        </div>

                        {/* Invite Code Box */}
                        <div className="bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col items-start gap-2">
                            <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider">Kode Undangan Pasangan</span>
                            <div className="flex items-center gap-2">
                                <code className="bg-slate-950 px-3 py-1.5 rounded-lg text-lg font-mono font-bold text-emerald-400 tracking-wider">
                                    {family.code}
                                </code>
                                <Button
                                    type="button"
                                    onClick={handleCopyCode}
                                    size="sm"
                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                                >
                                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Multiple Families Switcher if user belongs to more than 1 */}
                {allFamilies.length > 1 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-white">Ganti Keluarga</h3>
                            <p className="text-xs text-slate-400">Anda terdaftar di beberapa grup keluarga.</p>
                        </div>
                        <div className="flex gap-2">
                            {allFamilies.map((f) => (
                                <Button
                                    key={f.id}
                                    type="button"
                                    onClick={() => handleSwitchFamily(f.id)}
                                    variant={f.id === family.id ? 'default' : 'outline'}
                                    size="sm"
                                    className={f.id === family.id ? 'bg-emerald-600 text-white' : ''}
                                >
                                    {f.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Members List */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Anggota Keluarga</h2>
                                <p className="text-xs text-slate-400">{family.members.length} Anggota Terdaftar</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {family.members.map((member) => (
                            <div
                                key={member.id}
                                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white text-lg border border-slate-600">
                                        {(member.nickname || member.user.name).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-white">
                                                {member.nickname || member.user.name}
                                            </span>
                                            {member.role === 'owner' ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                                    <Crown className="size-3" /> Owner
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                                                    <Shield className="size-3" /> Member
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">{member.user.email}</p>
                                    </div>
                                </div>

                                {userRole === 'owner' && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => handleOpenEdit(member)}
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-700 text-slate-300 hover:text-white"
                                        >
                                            Edit
                                        </Button>
                                        {member.role !== 'owner' && (
                                            <Button
                                                type="button"
                                                onClick={() => handleRemoveMember(member.id)}
                                                variant="destructive"
                                                size="sm"
                                                className="bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal Edit Member */}
                {editingMember && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
                            <h3 className="text-lg font-bold text-white">Edit Anggota Keluarga</h3>
                            <form onSubmit={handleUpdateMember} className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">Panggilan / Panggilan Kustom</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.nickname}
                                        onChange={(e) => editForm.setData('nickname', e.target.value)}
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">Peran Dalam Keluarga</Label>
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) => editForm.setData('role', e.target.value as any)}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="owner">Owner (Pengelola Utama)</option>
                                        <option value="member">Member (Anggota Keluarga)</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setEditingMember(null)}
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
