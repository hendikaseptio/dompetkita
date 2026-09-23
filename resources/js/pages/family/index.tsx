import { Head, useForm } from '@inertiajs/react';
import {
    Check,
    Copy,
    Crown,
    Home,
    Shield,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react';
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

export default function FamilyIndex({
    family,
    allFamilies,
    userRole,
}: FamilyProps) {
    const [copied, setCopied] = useState(false);
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(
        null,
    );

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
        if (
            confirm(
                'Apakah Anda yakin ingin menghapus anggota ini dari keluarga?',
            )
        ) {
            switchForm.delete(`/family/members/${memberId}`);
        }
    };

    const handleSwitchFamily = (familyId: number) => {
        switchForm.post(`/family/switch/${familyId}`);
    };

    return (
        <>
            <Head title="Pengaturan Keluarga" />

            <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                                <Home className="size-3.5" />
                                Family Household
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight">
                                {family.name}
                            </h1>
                            <p className="mt-1 text-sm text-emerald-100">
                                Kelola anggota keluarga, peran, dan undang
                                pasangan untuk mengelola keuangan bersama.
                            </p>
                        </div>

                        {/* Invite Code Box */}
                        <div className="flex flex-col items-start gap-2 rounded-xl border border-white/20 bg-slate-900/60 p-4 backdrop-blur-md">
                            <span className="text-xs font-medium tracking-wider text-emerald-200 uppercase">
                                Kode Undangan Pasangan
                            </span>
                            <div className="flex items-center gap-2">
                                <code className="rounded-lg bg-slate-950 px-3 py-1.5 font-mono text-lg font-bold tracking-wider text-emerald-400">
                                    {family.code}
                                </code>
                                <Button
                                    type="button"
                                    onClick={handleCopyCode}
                                    size="sm"
                                    className="bg-emerald-500 font-bold text-slate-950 hover:bg-emerald-400"
                                >
                                    {copied ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Multiple Families Switcher if user belongs to more than 1 */}
                {allFamilies.length > 1 && (
                    <Card className="border-border flex items-center justify-between p-4 shadow-sm">
                        <div>
                            <h3 className="text-foreground font-semibold">
                                Ganti Keluarga
                            </h3>
                            <p className="text-muted-foreground text-xs">
                                Anda terdaftar di beberapa grup keluarga.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {allFamilies.map((f) => (
                                <Button
                                    key={f.id}
                                    type="button"
                                    onClick={() => handleSwitchFamily(f.id)}
                                    variant={
                                        f.id === family.id
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                >
                                    {f.name}
                                </Button>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Members List */}
                <Card className="border-border space-y-4 p-6 shadow-sm">
                    <div className="border-border flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-foreground text-lg font-bold">
                                    Anggota Keluarga
                                </h2>
                                <p className="text-muted-foreground text-xs">
                                    {family.members.length} Anggota Terdaftar
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {family.members.map((member) => (
                            <div
                                key={member.id}
                                className="bg-muted/50 border-border hover:border-accent flex items-center justify-between rounded-xl border p-4 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 text-primary border-border flex size-11 items-center justify-center rounded-full border text-lg font-bold">
                                        {(member.nickname || member.user.name)
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-foreground font-semibold">
                                                {member.nickname ||
                                                    member.user.name}
                                            </span>
                                            {member.role === 'owner' ? (
                                                <Badge
                                                    variant="outline"
                                                    className="gap-1 border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-500"
                                                >
                                                    <Crown className="size-3" />{' '}
                                                    Owner
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="gap-1 text-[10px]"
                                                >
                                                    <Shield className="size-3" />{' '}
                                                    Member
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground mt-0.5 text-xs">
                                            {member.user.email}
                                        </p>
                                    </div>
                                </div>

                                {userRole === 'owner' && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                handleOpenEdit(member)
                                            }
                                            variant="outline"
                                            size="sm"
                                        >
                                            Edit
                                        </Button>
                                        {member.role !== 'owner' && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveMember(
                                                        member.id,
                                                    )
                                                }
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
                    <Dialog
                        open={!!editingMember}
                        onOpenChange={() => setEditingMember(null)}
                    >
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Edit Anggota Keluarga</DialogTitle>
                            </DialogHeader>

                            <form
                                onSubmit={handleUpdateMember}
                                className="space-y-4 pt-2"
                            >
                                <div>
                                    <Label>Panggilan / Nickname</Label>
                                    <Input
                                        type="text"
                                        value={editForm.data.nickname}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'nickname',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Peran Dalam Keluarga</Label>
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'role',
                                                e.target.value as any,
                                            )
                                        }
                                        className="bg-background border-input text-foreground focus:ring-ring mt-1 w-full rounded-md border p-2.5 text-sm focus:ring-2"
                                    >
                                        <option value="owner">
                                            Owner (Pengelola Utama)
                                        </option>
                                        <option value="member">
                                            Member (Anggota Keluarga)
                                        </option>
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
