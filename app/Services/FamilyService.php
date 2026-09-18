<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\User;
use Illuminate\Support\Str;

class FamilyService
{
    /**
     * Create a new family for the given user.
     */
    public function createFamily(User $user, string $name): Family
    {
        $code = 'DK-'.strtoupper(Str::random(6));
        while (Family::where('code', $code)->exists()) {
            $code = 'DK-'.strtoupper(Str::random(6));
        }

        $family = Family::create([
            'name' => $name,
            'code' => $code,
        ]);

        FamilyMember::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'nickname' => $user->name,
        ]);

        $user->update([
            'current_family_id' => $family->id,
        ]);

        $this->seedDefaultCategories($family);

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'family_created',
            'description' => "{$user->name} membuat keluarga {$family->name}",
        ]);

        return $family;
    }

    /**
     * Join an existing family via invite code.
     */
    public function joinFamilyByCode(User $user, string $code): Family
    {
        $family = Family::where('code', strtoupper(trim($code)))->firstOrFail();

        $existingMember = FamilyMember::where('family_id', $family->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $existingMember) {
            FamilyMember::create([
                'family_id' => $family->id,
                'user_id' => $user->id,
                'role' => 'member',
                'nickname' => $user->name,
            ]);

            ActivityLog::create([
                'family_id' => $family->id,
                'user_id' => $user->id,
                'action' => 'member_joined',
                'description' => "{$user->name} bergabung ke dalam keluarga",
            ]);
        }

        $user->update([
            'current_family_id' => $family->id,
        ]);

        return $family;
    }

    /**
     * Seed default income and expense categories for a family.
     */
    public function seedDefaultCategories(Family $family): void
    {
        $defaultCategories = [
            // Income
            ['name' => 'Gaji', 'type' => 'income', 'icon' => 'banknote', 'color' => '#10B981'],
            ['name' => 'Jualan Web', 'type' => 'income', 'icon' => 'globe', 'color' => '#3B82F6'],
            ['name' => 'Dikasih Orang', 'type' => 'income', 'icon' => 'gift', 'color' => '#8B5CF6'],
            ['name' => 'Lain-lain', 'type' => 'income', 'icon' => 'coins', 'color' => '#6B7280'],

            // Expense
            ['name' => 'Belanja Bulanan', 'type' => 'expense', 'icon' => 'shopping-cart', 'color' => '#EC4899'],
            ['name' => 'Makan', 'type' => 'expense', 'icon' => 'utensils', 'color' => '#F59E0B'],
            ['name' => 'Bensin', 'type' => 'expense', 'icon' => 'fuel', 'color' => '#EF4444'],
            ['name' => 'Jajan', 'type' => 'expense', 'icon' => 'coffee', 'color' => '#10B981'],
            ['name' => 'Jalan-jalan', 'type' => 'expense', 'icon' => 'plane', 'color' => '#06B6D4'],
            ['name' => 'Perawatan Motor', 'type' => 'expense', 'icon' => 'wrench', 'color' => '#6366F1'],
            ['name' => 'Langganan', 'type' => 'expense', 'icon' => 'credit-card', 'color' => '#8B5CF6'],
            ['name' => 'Lain-lain', 'type' => 'expense', 'icon' => 'more-horizontal', 'color' => '#6B7280'],
        ];

        foreach ($defaultCategories as $cat) {
            Category::firstOrCreate([
                'family_id' => $family->id,
                'name' => $cat['name'],
                'type' => $cat['type'],
            ], [
                'icon' => $cat['icon'],
                'color' => $cat['color'],
                'is_default' => true,
            ]);
        }
    }
}
