import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { CATEGORY_ICONS, CategoryIcon } from '@/components/category-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IconPickerProps {
    value?: string | null;
    onChange: (iconName: string) => void;
    color?: string | null;
}

export function IconPicker({ value, onChange, color }: IconPickerProps) {
    const [search, setSearch] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const iconKeys = Object.keys(CATEGORY_ICONS);
    const filteredIcons = iconKeys.filter((key) =>
        key.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Icon Kategori</Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-primary hover:text-primary/80 h-6 px-2 text-xs"
                >
                    {isExpanded ? 'Tutup Icon Grid' : 'Pilih Icon'}
                </Button>
            </div>

            {/* Selected Icon Preview button */}
            <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="border-border bg-card flex h-10 w-full items-center justify-between gap-2 px-3 py-2"
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className="border-border flex size-7 items-center justify-center rounded-lg border"
                        style={{
                            backgroundColor: color
                                ? `${color}20`
                                : 'var(--muted)',
                            borderColor: color ? `${color}40` : 'var(--border)',
                        }}
                    >
                        <CategoryIcon
                            name={value}
                            className="size-4"
                            color={color}
                        />
                    </div>
                    <span className="text-foreground text-sm font-medium">
                        {value || 'Tag (Default)'}
                    </span>
                </div>
                <span className="text-muted-foreground text-xs font-normal">
                    {isExpanded ? 'Sembunyikan' : 'Ganti'}
                </span>
            </Button>

            {/* Expandable Icon Grid */}
            {isExpanded && (
                <div className="border-border bg-muted/40 animate-in fade-in-50 space-y-3 rounded-xl border p-3 duration-200">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
                        <Input
                            placeholder="Cari icon (e.g. Shopping, Car, Utensils)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-card h-8 pl-8 text-xs"
                        />
                    </div>

                    <div className="bg-card border-border grid max-h-48 grid-cols-7 gap-1.5 overflow-y-auto rounded-lg border p-1 sm:grid-cols-9">
                        {filteredIcons.map((key) => {
                            const isSelected = value === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                        onChange(key);
                                    }}
                                    title={key}
                                    className={`flex size-8 items-center justify-center rounded-lg transition-all ${
                                        isSelected
                                            ? 'bg-primary text-primary-foreground ring-primary font-bold shadow-sm ring-2 ring-offset-1'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <CategoryIcon
                                        name={key}
                                        className="size-4"
                                        color={isSelected ? undefined : color}
                                    />
                                </button>
                            );
                        })}
                        {filteredIcons.length === 0 && (
                            <p className="text-muted-foreground col-span-7 py-4 text-center text-xs sm:col-span-9">
                                Icon tidak ditemukan
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
