import { Head } from '@inertiajs/react';
import { Activity, Clock, User } from 'lucide-react';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateHuman } from '@/lib/formatters';

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
        <>
            <Head title="Riwayat Aktivitas Keuangan" />

            <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Activity className="size-6 text-emerald-500" />
                        Riwayat & Log Aktivitas Keluarga
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Catatan audit transparan setiap perubahan data keuangan yang dilakukan oleh anggota keluarga.
                    </p>
                </div>

                {/* Log Timeline */}
                <Card className="shadow-sm border-border p-6 relative">
                    <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-border">
                        {logs.data.length > 0 ? (
                            logs.data.map((log) => (
                                <div key={log.id} className="relative flex items-start gap-4 pl-8 group">
                                    {/* Circle Icon */}
                                    <div className="absolute left-1.5 top-1 size-5 rounded-full bg-background border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                                        <div className="size-1.5 bg-emerald-500 rounded-full" />
                                    </div>

                                    <div className="bg-muted/50 border border-border rounded-xl p-4 flex-1 hover:border-accent transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                            <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                                                <User className="size-3.5 text-emerald-500" />
                                                {log.user?.name || 'Sistem'}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {formatDateHuman(log.created_at, true)}, {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <p className="text-foreground text-sm">{log.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                Belum ada catatan aktivitas tercatat.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </>
    );
}
