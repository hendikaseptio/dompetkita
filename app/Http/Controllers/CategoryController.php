<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $categories = Category::where('family_id', $family->id)
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:income,expense'],
            'icon' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $category = Category::create([
            'family_id' => $family->id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'icon' => $validated['icon'] ?? 'tag',
            'color' => $validated['color'] ?? '#6B7280',
            'is_default' => false,
        ]);

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'category_created',
            'description' => "{$user->name} membuat kategori baru: {$category->name} ({$category->type})",
        ]);

        return back()->with('success', "Kategori {$category->name} berhasil ditambahkan!");
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        if ($category->family_id !== $family->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $category->update($validated);

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'category_updated',
            'description' => "{$user->name} memperbarui kategori {$category->name}",
        ]);

        return back()->with('success', "Kategori {$category->name} berhasil diperbarui.");
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        if ($category->family_id !== $family->id) {
            abort(403);
        }

        $catName = $category->name;
        $category->delete();

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'category_deleted',
            'description' => "{$user->name} menghapus kategori {$catName}",
        ]);

        return back()->with('success', "Kategori {$catName} berhasil dihapus.");
    }
}
