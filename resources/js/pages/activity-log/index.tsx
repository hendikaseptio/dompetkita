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

            <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Activity className="size-6 text-emerald-500" />
                        Riwayat & Log Aktivitas Keluarga
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Catatan audit transparan setiap perubahan data keuangan
                        yang dilakukan oleh anggota keluarga.
                    </p>
                </div>

                {/* Log Timeline */}
                <Card className="border-border relative p-6 shadow-sm">
                    <div className="before:bg-border relative space-y-6 before:absolute before:inset-0 before:left-4 before:w-0.5">
                        {logs.data.length > 0 ? (
                            logs.data.map((log) => (
                                <div
                                    key={log.id}
                                    className="group relative flex items-start gap-4 pl-8"
                                >
                                    {/* Circle Icon */}
                                    <div className="bg-background absolute top-1 left-1.5 flex size-5 items-center justify-center rounded-full border-2 border-emerald-500 text-emerald-500 shadow-sm transition-transform group-hover:scale-110">
                                        <div className="size-1.5 rounded-full bg-emerald-500" />
                                    </div>

                                    <div className="bg-muted/50 border-border hover:border-accent flex-1 rounded-xl border p-4 transition-all">
                                        <div className="mb-1 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                                            <span className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                                                <User className="size-3.5 text-emerald-500" />
                                                {log.user?.name || 'Sistem'}
                                            </span>
                                            <span className="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
                                                <Clock className="size-3" />
                                                {formatDateHuman(
                                                    log.created_at,
                                                    true,
                                                )}
                                                ,{' '}
                                                {new Date(
                                                    log.created_at,
                                                ).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        <p className="text-foreground text-sm">
                                            {log.description}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-muted-foreground py-12 text-center text-sm">
                                Belum ada catatan aktivitas tercatat.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </>
    );
}
