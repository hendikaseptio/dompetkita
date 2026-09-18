import { Head, useForm } from '@inertiajs/react';
import { Check, Copy, Crown, Home, Shield, Trash2, UserPlus, Users } from 'lucide-react';
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
        <>
            <Head title="Pengaturan Keluarga" />

            <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
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
                    <Card className="shadow-sm border-border p-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-foreground">Ganti Keluarga</h3>
                            <p className="text-xs text-muted-foreground">Anda terdaftar di beberapa grup keluarga.</p>
                        </div>
                        <div className="flex gap-2">
                            {allFamilies.map((f) => (
                                <Button
                                    key={f.id}
                                    type="button"
                                    onClick={() => handleSwitchFamily(f.id)}
                                    variant={f.id === family.id ? 'default' : 'outline'}
                                    size="sm"
                                >
                                    {f.name}
                                </Button>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Members List */}
                <Card className="shadow-sm border-border p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Anggota Keluarga</h2>
                                <p className="text-xs text-muted-foreground">{family.members.length} Anggota Terdaftar</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {family.members.map((member) => (
                            <div
                                key={member.id}
                                className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between hover:border-accent transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-border">
                                        {(member.nickname || member.user.name).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">
                                                {member.nickname || member.user.name}
                                            </span>
                                            {member.role === 'owner' ? (
                                                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1">
                                                    <Crown className="size-3" /> Owner
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px] gap-1">
                                                    <Shield className="size-3" /> Member
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{member.user.email}</p>
                                    </div>
                                </div>

                                {userRole === 'owner' && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => handleOpenEdit(member)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Edit
                                        </Button>
                                        {member.role !== 'owner' && (
                                            <Button
                                                type="button"
                                                onClick={() => handleRemoveMember(member.id)}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Dialog Edit Member */}
                {editingMember && (
                    <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Edit Anggota Keluarga</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleUpdateMember} className="space-y-4 pt-2">
                                <div>
                                    <Label>Panggilan / Nickname</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.nickname}
                                        onChange={(e) => editForm.setData('nickname', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Peran Dalam Keluarga</Label>
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) => editForm.setData('role', e.target.value as any)}
                                        className="w-full bg-background border border-input text-foreground rounded-md p-2.5 mt-1 text-sm focus:ring-2 focus:ring-ring"
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
