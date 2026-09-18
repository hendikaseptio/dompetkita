import React from 'react';
import { Input } from '@/components/ui/input';

export interface CurrencyInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: string | number;
    onChangeValue: (value: string) => void;
    prefix?: string;
}

export function CurrencyInput({
    value,
    onChangeValue,
    prefix = 'Rp ',
    className,
    placeholder = '0',
    ...props
}: CurrencyInputProps) {
    const formatNumber = (val: string | number) => {
        if (val === '' || val === null || val === undefined) return '';
        const numStr = String(val).replace(/\D/g, '');
        if (!numStr) return '';
        return new Intl.NumberFormat('id-ID').format(Number(numStr));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawDigits = e.target.value.replace(/\D/g, '');
        onChangeValue(rawDigits);
    };

    const displayValue = value ? formatNumber(value) : '';

    return (
        <div className="relative flex items-center">
            {prefix && (
                <span className="absolute left-3 text-slate-400 font-bold text-sm pointer-events-none select-none">
                    {prefix}
                </span>
            )}
            <Input
                {...props}
                type="text"
                inputMode="numeric"
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
                className={`${prefix ? 'pl-9' : ''} ${className || ''}`}
            />
        </div>
    );
}
