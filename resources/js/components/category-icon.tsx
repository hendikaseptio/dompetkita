import React from 'react';
import {
    Baby,
    BookOpen,
    Briefcase,
    Building,
    Bus,
    Car,
    CircleDollarSign,
    Coffee,
    CreditCard,
    Dog,
    DollarSign,
    Dumbbell,
    Film,
    Flame,
    Fuel,
    Gamepad2,
    Gift,
    GraduationCap,
    Heart,
    HeartPulse,
    Home,
    Key,
    Landmark,
    Laptop,
    Music,
    Package,
    PiggyBank,
    Plane,
    Receipt,
    ShieldCheck,
    Shirt,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Smile,
    Sparkles,
    Stethoscope,
    Tag,
    TrendingUp,
    Tv,
    Utensils,
    Wallet,
    Wrench,
    Zap,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    ShoppingBag,
    ShoppingCart,
    Utensils,
    Coffee,
    Car,
    Bus,
    Fuel,
    Home,
    Building,
    HeartPulse,
    Stethoscope,
    Dumbbell,
    Gamepad2,
    Tv,
    Film,
    Music,
    GraduationCap,
    BookOpen,
    Plane,
    Receipt,
    Shirt,
    Zap,
    Flame,
    Briefcase,
    TrendingUp,
    DollarSign,
    CircleDollarSign,
    Gift,
    PiggyBank,
    CreditCard,
    Wallet,
    Smartphone,
    Laptop,
    Baby,
    Dog,
    Wrench,
    Key,
    ShieldCheck,
    Tag,
    Package,
    Landmark,
    Sparkles,
    Smile,
    Heart,
};

interface CategoryIconProps {
    name?: string | null;
    className?: string;
    color?: string | null;
    style?: React.CSSProperties;
}

export function CategoryIcon({ name, className = 'size-4', color, style }: CategoryIconProps) {
    const IconComponent = (name && CATEGORY_ICONS[name]) || Tag;
    const combinedStyle = color ? { color, ...style } : style;

    return (
        <IconComponent
            className={className}
            style={combinedStyle}
        />
    );
}
