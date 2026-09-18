import { Head } from '@inertiajs/react';
import { Activity, Clock, User } from 'lucide-react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';

interface LogItem {
    id: number;
    action: string;
    description: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface ActivityLogProps {
    logs: {
        data: LogItem[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}

export default function ActivityLogIndex({ logs }: ActivityLogProps) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Activity Log', href: '/activity-log' }]}>
            <Head title="Riwayat Aktivitas Keuangan" />

            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Activity className="size-6 text-emerald-400" />
                        Riwayat & Log Aktivitas Keluarga
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Catatan audit transparan setiap perubahan data keuangan yang dilakukan oleh anggota keluarga.
                    </p>
                </div>

                {/* Log Timeline */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
                    <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
                        {logs.data.length > 0 ? (
                            logs.data.map((log) => (
                                <div key={log.id} className="relative flex items-start gap-4 pl-8 group">
                                    {/* Circle Icon */}
                                    <div className="absolute left-1.5 top-1 size-5 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-md group-hover:scale-110 transition-transform">
                                        <div className="size-1.5 bg-emerald-400 rounded-full" />
                                    </div>

                                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex-1 hover:border-slate-600 transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                            <span className="font-semibold text-white text-sm flex items-center gap-1.5">
                                                <User className="size-3.5 text-emerald-400" />
                                                {log.user?.name || 'Sistem'}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {new Date(log.created_at).toLocaleString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        <p className="text-slate-300 text-sm">{log.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-slate-400 text-sm">
                                Belum ada catatan aktivitas tercatat.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
