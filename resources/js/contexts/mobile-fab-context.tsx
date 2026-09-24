import React, { createContext, useContext, useState, useCallback } from 'react';

export interface FabAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    /** Optional color accent for the icon bg, e.g. 'purple', 'blue' */
    color?: 'purple' | 'blue' | 'emerald' | 'rose' | 'amber' | 'default';
}

interface MobileFabContextValue {
    actions: FabAction[];
    setActions: (actions: FabAction[]) => void;
    clearActions: () => void;
}

const MobileFabContext = createContext<MobileFabContextValue | null>(null);

export function MobileFabProvider({ children }: { children: React.ReactNode }) {
    const [actions, setActionsState] = useState<FabAction[]>([]);

    const setActions = useCallback((newActions: FabAction[]) => {
        setActionsState(newActions);
    }, []);

    const clearActions = useCallback(() => {
        setActionsState([]);
    }, []);

    return (
        <MobileFabContext.Provider
            value={{
                actions,
                setActions,
                clearActions,
            }}
        >
            {children}
        </MobileFabContext.Provider>
    );
}

export function useMobileFab() {
    const ctx = useContext(MobileFabContext);
    if (!ctx) {
        throw new Error('useMobileFab must be used within MobileFabProvider');
    }
    return ctx;
}
