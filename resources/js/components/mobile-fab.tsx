import { ChevronUp, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMobileFab, type FabAction } from '@/contexts/mobile-fab-context';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const colorMap: Record<NonNullable<FabAction['color']>, string> = {
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30 hover:bg-purple-500/25 shadow-purple-500/10',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25 shadow-blue-500/10',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 shadow-emerald-500/10',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25 shadow-rose-500/10',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25 shadow-amber-500/10',
    default: 'bg-muted/60 text-muted-foreground border-border hover:bg-muted',
};

interface MobileFabProps {
    actions: FabAction[];
}

/**
 * Register page-level FAB actions. Renders nothing itself — actions are
 * displayed by the FAB overlay rendered in the layout.
 */
export function MobileFab({ actions }: MobileFabProps) {
    const { setActions, clearActions } = useMobileFab();
    const actionKey = useMemo(
        () => actions.map((a) => a.id).join(','),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [actions.length],
    );

    useEffect(() => {
        setActions(actions);
        return () => clearActions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actionKey]);

    return null;
}

/**
 * The actual floating buttons, rendered inside the layout.
 * Single action → one icon FAB with tooltip.
 * Multiple actions → speed-dial: main FAB expands sub-action icon buttons.
 */
export function MobileFabButtons() {
    const { actions } = useMobileFab();
    const [isExpanded, setIsExpanded] = useState(false);
    const prevActionsLength = useRef(actions.length);

    // Collapse when actions change (page navigation)
    useEffect(() => {
        if (actions.length !== prevActionsLength.current) {
            setIsExpanded(false);
            prevActionsLength.current = actions.length;
        }
    }, [actions.length]);

    if (!actions.length) return null;

    if (actions.length === 1) {
        const action = actions[0];
        return (
            <div className="fixed right-4 z-40 md:hidden" style={{ bottom: '5.5rem' }}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={action.onClick}
                            aria-label={action.label}
                            className={`flex size-13 items-center justify-center rounded-full border shadow-lg backdrop-blur-xl transition-all duration-200 active:scale-95 ${colorMap[action.color ?? 'default']}`}
                        >
                            {action.icon}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs font-semibold">
                        {action.label}
                    </TooltipContent>
                </Tooltip>
            </div>
        );
    }

    // Multiple actions — speed-dial FAB
    return (
        <div className="fixed right-4 z-40 flex flex-col items-center gap-2.5 md:hidden" style={{ bottom: '5.5rem' }}>
            {/* Sub-action icon buttons — expand upward */}
            <div
                className={`flex flex-col items-center gap-2.5 transition-all duration-300 ${
                    isExpanded
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-4 opacity-0'
                }`}
            >
                {actions.map((action) => (
                    <Tooltip key={action.id}>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsExpanded(false);
                                    action.onClick();
                                }}
                                aria-label={action.label}
                                className={`flex size-11 items-center justify-center rounded-full border shadow-md backdrop-blur-xl transition-all duration-200 active:scale-95 ${colorMap[action.color ?? 'default']}`}
                            >
                                {action.icon}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs font-semibold">
                            {action.label}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>

            {/* Main FAB trigger */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        aria-label={isExpanded ? 'Tutup aksi' : 'Buka aksi'}
                        className={`flex size-13 items-center justify-center rounded-full border shadow-xl backdrop-blur-xl transition-all duration-300 active:scale-95 ${
                            isExpanded
                                ? 'bg-foreground/10 border-foreground/20 text-foreground rotate-45'
                                : 'bg-primary border-primary/30 text-primary-foreground shadow-primary/25'
                        }`}
                    >
                        {isExpanded ? (
                            <X className="size-5 transition-transform duration-300" />
                        ) : (
                            <ChevronUp className="size-5 transition-transform duration-300" />
                        )}
                    </button>
                </TooltipTrigger>
                {!isExpanded && (
                    <TooltipContent side="left" className="text-xs font-semibold">
                        Aksi
                    </TooltipContent>
                )}
            </Tooltip>
        </div>
    );
}
