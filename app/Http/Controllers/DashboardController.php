<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $now = now();
        $month = $now->month;
        $year = $now->year;

        // Wallets & total balance
        $wallets = Wallet::where('family_id', $family->id)
            ->orderBy('name')
            ->get();
        $totalBalance = (float) $wallets->sum('balance');

        // Monthly Income & Expense
        $monthlyIncome = (float) Transaction::where('family_id', $family->id)
            ->where('type', 'income')
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->sum('amount');

        $monthlyExpense = (float) Transaction::where('family_id', $family->id)
            ->where('type', 'expense')
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->sum('amount');

        // Budget summary
        $totalBudgetLimit = (float) Budget::where('family_id', $family->id)
            ->where('month', $month)
            ->where('year', $year)
            ->sum('monthly_limit');

        $remainingBudget = max(0, $totalBudgetLimit - $monthlyExpense);

        // Recent Transactions
        $recentTransactions = Transaction::with(['creator', 'payer', 'category', 'walletFrom', 'walletTo'])
            ->where('family_id', $family->id)
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(6)
            ->get();

        // Chart 1: Expense by Category
        $expenseByCategory = Transaction::where('transactions.family_id', $family->id)
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
                'color' => $item->color ?? '#3B82F6',
                'total' => (float) $item->total,
                'percentage' => $monthlyExpense > 0 ? round(($item->total / $monthlyExpense) * 100, 1) : 0,
            ]);

        // Chart 2: Income vs Expense (Last 6 Months)
        $incomeVsExpense = [];
        for ($i = 5; $i >= 0; $i--) {
            $dt = now()->subMonths($i);
            $m = $dt->month;
            $y = $dt->year;

            $inc = (float) Transaction::where('family_id', $family->id)
                ->where('type', 'income')
                ->whereMonth('transaction_date', $m)
                ->whereYear('transaction_date', $y)
                ->sum('amount');

            $exp = (float) Transaction::where('family_id', $family->id)
                ->where('type', 'expense')
                ->whereMonth('transaction_date', $m)
                ->whereYear('transaction_date', $y)
                ->sum('amount');

            $incomeVsExpense[] = [
                'month' => $dt->translatedFormat('M Y'),
                'income' => $inc,
                'expense' => $exp,
            ];
        }

        // Chart 3: Daily Expense for Current Month
        $dailyExpense = Transaction::where('family_id', $family->id)
            ->where('type', 'expense')
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->selectRaw('DATE(transaction_date) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(fn ($item) => [
                'date' => date('d M', strtotime($item->date)),
                'total' => (float) $item->total,
            ]);

        return Inertia::render('dashboard', [
            'family' => $family,
            'totalBalance' => $totalBalance,
            'monthlyIncome' => $monthlyIncome,
            'monthlyExpense' => $monthlyExpense,
            'totalBudgetLimit' => $totalBudgetLimit,
            'remainingBudget' => $remainingBudget,
            'wallets' => $wallets,
            'recentTransactions' => $recentTransactions,
            'charts' => [
                'expenseByCategory' => $expenseByCategory,
                'incomeVsExpense' => $incomeVsExpense,
                'dailyExpense' => $dailyExpense,
            ],
        ]);
    }
}
