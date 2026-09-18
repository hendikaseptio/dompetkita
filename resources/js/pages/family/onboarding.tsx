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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Gradient Blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold mb-4 shadow-lg shadow-emerald-500/20">
                        <Home className="size-7" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Selamat Datang di DompetKita!</h1>
                    <p className="text-sm text-slate-400 mt-2">
                        Halo, <span className="font-semibold text-slate-200">{auth?.user?.name}</span>. Mari hubungkan atau buat grup keuangan keluarga Anda.
                    </p>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-1 rounded-xl mb-6 border border-slate-700/50">
                    <button
                        type="button"
                        onClick={() => setMode('create')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            mode === 'create'
                                ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <PlusCircle className="size-4" />
                        Buat Keluarga
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('join')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            mode === 'join'
                                ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
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
                            <Label htmlFor="family-name" className="text-slate-300">Nama Keluarga / Rumah Tangga</Label>
                            <Input
                                id="family-name"
                                type="text"
                                placeholder="Contoh: Keluarga Budi & Siti"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                className="bg-slate-800/80 border-slate-700 text-white mt-1.5 focus:border-emerald-500"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="text-xs text-rose-400 mt-1">{createForm.errors.name}</p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={createForm.processing}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 shadow-lg shadow-emerald-500/20"
                        >
                            {createForm.processing ? 'Memproses...' : 'Buat Keluarga Baru'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleJoinSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="family-code" className="text-slate-300">Kode Unik Keluarga</Label>
                            <Input
                                id="family-code"
                                type="text"
                                placeholder="Contoh: DK-ABC123"
                                value={joinForm.data.code}
                                onChange={(e) => joinForm.setData('code', e.target.value.toUpperCase())}
                                className="bg-slate-800/80 border-slate-700 text-white mt-1.5 focus:border-emerald-500 uppercase tracking-widest font-mono"
                                required
                            />
                            {joinForm.errors.code && (
                                <p className="text-xs text-rose-400 mt-1">{joinForm.errors.code}</p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={joinForm.processing}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 shadow-lg shadow-emerald-500/20"
                        >
                            {joinForm.processing ? 'Memproses...' : 'Gabung Keluarga'}
                        </Button>
                    </form>
                )}

                <div className="mt-8 pt-4 border-t border-slate-800 text-center">
                    <a
                        href="/logout"
                        className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 transition-colors gap-1.5"
                    >
                        <LogOut className="size-3.5" />
                        Keluar Akun
                    </a>
                </div>
            </div>
        </div>
    );
}
