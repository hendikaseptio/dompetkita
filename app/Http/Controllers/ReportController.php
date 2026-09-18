<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function monthly(Request $request): Response
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $month = (int) ($request->month ?? now()->month);
        $year = (int) ($request->year ?? now()->year);

        // Summary
        $totalIncome = (float) Transaction::where('family_id', $family->id)
            ->where('type', 'income')
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->sum('amount');

        $totalExpense = (float) Transaction::where('family_id', $family->id)
            ->where('type', 'expense')
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->sum('amount');

        $netCashFlow = $totalIncome - $totalExpense;

        // Income Breakdown
        $incomeBreakdown = Transaction::where('transactions.family_id', $family->id)
            ->where('transactions.type', 'income')
            ->whereMonth('transactions.transaction_date', $month)
            ->whereYear('transactions.transaction_date', $year)
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->selectRaw('categories.name as category, categories.color as color, SUM(transactions.amount) as total')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->orderBy('total', 'desc')
            ->get()
            ->map(fn ($item) => [
                'category' => $item->category,
                'color' => $item->color ?? '#10B981',
                'total' => (float) $item->total,
                'percentage' => $totalIncome > 0 ? round(($item->total / $totalIncome) * 100, 1) : 0,
            ]);

        // Expense Breakdown
        $expenseBreakdown = Transaction::where('transactions.family_id', $family->id)
            ->where('transactions.type', 'expense')
            ->whereMonth('transactions.transaction_date', $month)
            ->whereYear('transactions.transaction_date', $year)
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->selectRaw('categories.name as category, categories.color as color, SUM(transactions.amount) as total')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->orderBy('total', 'desc')
            ->get()
            ->map(fn ($item) => [
                'category' => $item->category,
                'color' => $item->color ?? '#EF4444',
                'total' => (float) $item->total,
                'percentage' => $totalExpense > 0 ? round(($item->total / $totalExpense) * 100, 1) : 0,
            ]);

        // Wallet Summary
        $wallets = Wallet::where('family_id', $family->id)->get();

        // Member Activity (Expenses paid by each member)
        $memberActivity = Transaction::where('transactions.family_id', $family->id)
            ->where('transactions.type', 'expense')
            ->whereMonth('transactions.transaction_date', $month)
            ->whereYear('transactions.transaction_date', $year)
            ->join('users', 'users.id', '=', 'transactions.paid_by')
            ->selectRaw('users.id as user_id, users.name as user_name, SUM(transactions.amount) as total_spent, COUNT(transactions.id) as count')
            ->groupBy('users.id', 'users.name')
            ->orderBy('total_spent', 'desc')
            ->get()
            ->map(fn ($item) => [
                'user_name' => $item->user_name,
                'total_spent' => (float) $item->total_spent,
                'count' => (int) $item->count,
                'percentage' => $totalExpense > 0 ? round(($item->total_spent / $totalExpense) * 100, 1) : 0,
            ]);

        return Inertia::render('reports/monthly', [
            'month' => $month,
            'year' => $year,
            'summary' => [
                'totalIncome' => $totalIncome,
                'totalExpense' => $totalExpense,
                'netCashFlow' => $netCashFlow,
            ],
            'incomeBreakdown' => $incomeBreakdown,
            'expenseBreakdown' => $expenseBreakdown,
            'wallets' => $wallets,
            'memberActivity' => $memberActivity,
        ]);
    }
}
