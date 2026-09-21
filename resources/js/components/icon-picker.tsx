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
        key.toLowerCase().includes(search.toLowerCase())
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
                    className="h-6 text-xs text-primary hover:text-primary/80 px-2"
                >
                    {isExpanded ? 'Tutup Icon Grid' : 'Pilih Icon'}
                </Button>
            </div>

            {/* Selected Icon Preview button */}
            <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 h-10 border-border bg-card"
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className="size-7 rounded-lg flex items-center justify-center border border-border"
                        style={{
                            backgroundColor: color ? `${color}20` : 'var(--muted)',
                            borderColor: color ? `${color}40` : 'var(--border)',
                        }}
                    >
                        <CategoryIcon name={value} className="size-4" color={color} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{value || 'Tag (Default)'}</span>
                </div>
                <span className="text-xs text-muted-foreground font-normal">
                    {isExpanded ? 'Sembunyikan' : 'Ganti'}
                </span>
            </Button>

            {/* Expandable Icon Grid */}
            {isExpanded && (
                <div className="p-3 border border-border rounded-xl bg-muted/40 space-y-3 animate-in fade-in-50 duration-200">
                    <div className="relative">
                        <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                        <Input
                            placeholder="Cari icon (e.g. Shopping, Car, Utensils)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 text-xs h-8 bg-card"
                        />
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 max-h-48 overflow-y-auto p-1 bg-card rounded-lg border border-border">
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
                                    className={`size-8 rounded-lg flex items-center justify-center transition-all ${
                                        isSelected
                                            ? 'bg-primary text-primary-foreground font-bold shadow-sm ring-2 ring-primary ring-offset-1'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <CategoryIcon name={key} className="size-4" color={isSelected ? undefined : color} />
                                </button>
                            );
                        })}
                        {filteredIcons.length === 0 && (
                            <p className="col-span-7 sm:col-span-9 text-center text-xs text-muted-foreground py-4">
                                Icon tidak ditemukan
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
