<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $month = (int) ($request->month ?? now()->month);
        $year = (int) ($request->year ?? now()->year);

        $expenseCategories = Category::where('family_id', $family->id)
            ->where('type', 'expense')
            ->orderBy('name')
            ->get();

        $allCategories = Category::where('family_id', $family->id)
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        $budgets = Budget::where('family_id', $family->id)
            ->where('month', $month)
            ->where('year', $year)
            ->get()
            ->keyBy('category_id');

        $expensesGrouped = Transaction::where('family_id', $family->id)
            ->where('type', 'expense')
            ->whereYear('transaction_date', $year)
            ->whereMonth('transaction_date', $month)
            ->selectRaw('category_id, SUM(amount) as total_spent')
            ->groupBy('category_id')
            ->pluck('total_spent', 'category_id');

        $budgetedItems = [];
        $unbudgetedItems = [];

        foreach ($expenseCategories as $category) {
            $spent = (float) ($expensesGrouped->get($category->id) ?? 0);
            $budget = $budgets->get($category->id);

            if ($budget) {
                $limit = (float) $budget->monthly_limit;
                $remaining = $limit - $spent;
                $percentage = $limit > 0 ? round(($spent / $limit) * 100, 1) : 0;

                $budgetedItems[] = [
                    'id' => $budget->id,
                    'category_id' => $category->id,
                    'category' => $category,
                    'monthly_limit' => $limit,
                    'spent' => $spent,
                    'remaining' => $remaining,
                    'percentage' => min(100, $percentage),
                    'is_over_budget' => $spent > $limit,
                ];
            } else {
                $unbudgetedItems[] = [
                    'category_id' => $category->id,
                    'category' => $category,
                    'spent' => $spent,
                ];
            }
        }

        $totalBudgetLimit = array_sum(array_column($budgetedItems, 'monthly_limit'));
        $totalBudgetedSpent = array_sum(array_column($budgetedItems, 'spent'));
        $totalUnbudgetedSpent = array_sum(array_column($unbudgetedItems, 'spent'));

        return Inertia::render('budgets/index', [
            'budgetedItems' => $budgetedItems,
            'unbudgetedItems' => $unbudgetedItems,
            'month' => $month,
            'year' => $year,
            'expenseCategories' => $expenseCategories,
            'allCategories' => $allCategories,
            'summary' => [
                'totalLimit' => $totalBudgetLimit,
                'totalBudgetedSpent' => $totalBudgetedSpent,
                'totalUnbudgetedSpent' => $totalUnbudgetedSpent,
                'totalExpense' => $totalBudgetedSpent + $totalUnbudgetedSpent,
                'remainingBudget' => $totalBudgetLimit - $totalBudgetedSpent,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'monthly_limit' => ['required', 'numeric', 'gte:0'],
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'min:2020'],
        ]);

        $category = Category::where('family_id', $family->id)->findOrFail($validated['category_id']);

        $budget = Budget::updateOrCreate([
            'family_id' => $family->id,
            'category_id' => $category->id,
            'month' => $validated['month'],
            'year' => $validated['year'],
        ], [
            'monthly_limit' => $validated['monthly_limit'],
        ]);

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'budget_updated',
            'description' => "{$user->name} mengatur budget {$category->name} menjadi Rp ".number_format($validated['monthly_limit'], 0, ',', '.'),
        ]);

        return back()->with('success', "Budget untuk {$category->name} berhasil diperbarui.");
    }

    public function destroy(Request $request, Budget $budget): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        if ($budget->family_id !== $family->id) {
            abort(403);
        }

        $categoryName = $budget->category->name ?? 'Kategori';
        $budget->delete();

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'budget_deleted',
            'description' => "{$user->name} menghapus limit budget untuk {$categoryName}",
        ]);

        return back()->with('success', "Budget untuk {$categoryName} telah dihapus.");
    }
}
