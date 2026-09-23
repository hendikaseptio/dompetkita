import { Download, Check, Share, PlusSquare } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check standalone / installed status
        const isStandaloneMode =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as unknown as { standalone?: boolean })
                .standalone === true;
        setIsStandalone(isStandaloneMode);

        // Check iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIos(isIosDevice);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt,
        );
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const triggerInstall = async (onIosPrompt?: () => void) => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                setIsInstalled(true);
            }
            setDeferredPrompt(null);
        } else if (isIos) {
            onIosPrompt?.();
        }
    };

    return {
        canInstall: Boolean(deferredPrompt) || (isIos && !isStandalone),
        isStandalone: isStandalone || isInstalled,
        isIos,
        triggerInstall,
    };
}

export function PwaInstallMenuItem({ onAction }: { onAction?: () => void }) {
    const { isStandalone, isIos, triggerInstall } = usePwaInstall();
    const [showIosModal, setShowIosModal] = useState(false);

    if (isStandalone) {
        return (
            <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-5" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold">
                        Aplikasi Terpasang
                    </h4>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                        Berjalan dalam mode aplikasi mobile
                    </p>
                </div>
            </div>
        );
    }

    const handleClick = () => {
        void triggerInstall(() => {
            setShowIosModal(true);
        });
        onAction?.();
    };

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border p-3 text-left transition-all"
            >
                <div className="bg-primary text-primary-foreground rounded-xl p-2.5">
                    <Download className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold">
                        Pasang Aplikasi DompetKita
                    </h4>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                        {isIos
                            ? 'Install di iPhone/iPad ke Layar Utama'
                            : 'Install ke smartphone untuk akses cepat'}
                    </p>
                </div>
            </button>

            {/* iOS Installation Instruction Dialog */}
            <Dialog open={showIosModal} onOpenChange={setShowIosModal}>
                <DialogContent className="max-w-sm rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <Download className="text-primary size-5" />
                            Pasang di iOS / Safari
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-1 text-sm">
                            Ikuti langkah mudah ini untuk memasang DompetKita di
                            layar utama iPhone/iPad Anda:
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-2 space-y-4 text-sm">
                        <div className="bg-muted/60 border-border flex items-start gap-3 rounded-2xl border p-3">
                            <div className="bg-background border-border text-foreground shrink-0 rounded-xl border p-2">
                                <Share className="text-primary size-4" />
                            </div>
                            <div>
                                <p className="text-foreground font-medium">
                                    1. Ketuk tombol Bagikan (Share)
                                </p>
                                <p className="text-muted-foreground mt-0.5 text-xs">
                                    Terletak di bilah bawah Safari ponsel Anda.
                                </p>
                            </div>
                        </div>

                        <div className="bg-muted/60 border-border flex items-start gap-3 rounded-2xl border p-3">
                            <div className="bg-background border-border text-foreground shrink-0 rounded-xl border p-2">
                                <PlusSquare className="text-primary size-4" />
                            </div>
                            <div>
                                <p className="text-foreground font-medium">
                                    2. Pilih "Tambah ke Layar Utama"
                                </p>
                                <p className="text-muted-foreground mt-0.5 text-xs">
                                    Gulir ke bawah dan ketuk opsi{' '}
                                    <strong>Add to Home Screen</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowIosModal(false)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                    >
                        Saya Mengerti
                    </button>
                </DialogContent>
            </Dialog>
        </>
    );
}
