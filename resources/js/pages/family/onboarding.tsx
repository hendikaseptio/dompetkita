import { useForm, usePage } from '@inertiajs/react';
import { Home, LogOut, PlusCircle, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Onboarding() {
    const { auth } = usePage().props as any;
    const [mode, setMode] = useState<'create' | 'join'>('create');

    const createForm = useForm({
        name: '',
    });

    const joinForm = useForm({
        code: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/family/store');
    };

    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        joinForm.post('/family/join');
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 text-slate-100">
            {/* Ambient Background Gradient Blobs */}
            <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
                        <Home className="size-7" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Selamat Datang di DompetKita!
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Halo,{' '}
                        <span className="font-semibold text-slate-200">
                            {auth?.user?.name}
                        </span>
                        . Mari hubungkan atau buat grup keuangan keluarga Anda.
                    </p>
                </div>

                {/* Mode Selector */}
                <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-slate-700/50 bg-slate-800/60 p-1">
                    <button
                        type="button"
                        onClick={() => setMode('create')}
                        className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                            mode === 'create'
                                ? 'bg-emerald-500 font-semibold text-slate-950 shadow'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <PlusCircle className="size-4" />
                        Buat Keluarga
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('join')}
                        className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                            mode === 'join'
                                ? 'bg-emerald-500 font-semibold text-slate-950 shadow'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Users className="size-4" />
                        Gabung Kode
                    </button>
                </div>

                {mode === 'create' ? (
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div>
                            <Label
                                htmlFor="family-name"
                                className="text-slate-300"
                            >
                                Nama Keluarga / Rumah Tangga
                            </Label>
                            <Input
                                id="family-name"
                                type="text"
                                placeholder="Contoh: Keluarga Budi & Siti"
                                value={createForm.data.name}
                                onChange={(e) =>
                                    createForm.setData('name', e.target.value)
                                }
                                className="mt-1.5 border-slate-700 bg-slate-800/80 text-white focus:border-emerald-500"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="mt-1 text-xs text-rose-400">
                                    {createForm.errors.name}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={createForm.processing}
                            className="w-full bg-emerald-500 py-2.5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                        >
                            {createForm.processing
                                ? 'Memproses...'
                                : 'Buat Keluarga Baru'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleJoinSubmit} className="space-y-4">
                        <div>
                            <Label
                                htmlFor="family-code"
                                className="text-slate-300"
                            >
                                Kode Unik Keluarga
                            </Label>
                            <Input
                                id="family-code"
                                type="text"
                                placeholder="Contoh: DK-ABC123"
                                value={joinForm.data.code}
                                onChange={(e) =>
                                    joinForm.setData(
                                        'code',
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                className="mt-1.5 border-slate-700 bg-slate-800/80 font-mono tracking-widest text-white uppercase focus:border-emerald-500"
                                required
                            />
                            {joinForm.errors.code && (
                                <p className="mt-1 text-xs text-rose-400">
                                    {joinForm.errors.code}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={joinForm.processing}
                            className="w-full bg-emerald-500 py-2.5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                        >
                            {joinForm.processing
                                ? 'Memproses...'
                                : 'Gabung Keluarga'}
                        </Button>
                    </form>
                )}

                <div className="mt-8 border-t border-slate-800 pt-4 text-center">
                    <a
                        href="/logout"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-200"
                    >
                        <LogOut className="size-3.5" />
                        Keluar Akun
                    </a>
                </div>
            </div>
        </div>
    );
}
