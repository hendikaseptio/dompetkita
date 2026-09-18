<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FamilyController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use App\Http\Middleware\EnsureHasFamily;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Family Onboarding & Join routes (accessible before family is assigned)
    Route::get('/family/onboarding', [FamilyController::class, 'onboarding'])->name('family.onboarding');
    Route::post('/family/store', [FamilyController::class, 'store'])->name('family.store');
    Route::post('/family/join', [FamilyController::class, 'join'])->name('family.join');
    Route::post('/family/switch/{family}', [FamilyController::class, 'switchFamily'])->name('family.switch');

    // Main App routes (enforced by EnsureHasFamily)
    Route::middleware(EnsureHasFamily::class)->group(function () {
        Route::get('/dashboard', DashboardController::class)->name('dashboard');

        // Family management
        Route::get('/family', [FamilyController::class, 'index'])->name('family.index');
        Route::put('/family/members/{member}', [FamilyController::class, 'updateMember'])->name('family.members.update');
        Route::delete('/family/members/{member}', [FamilyController::class, 'removeMember'])->name('family.members.destroy');

        // Transactions
        Route::resource('transactions', TransactionController::class)->only(['index', 'store', 'update', 'destroy']);

        // Wallets
        Route::resource('wallets', WalletController::class)->only(['index', 'store', 'update', 'destroy']);

        // Categories
        Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);

        // Budgets
        Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');
        Route::post('/budgets', [BudgetController::class, 'store'])->name('budgets.store');
        Route::delete('/budgets/{budget}', [BudgetController::class, 'destroy'])->name('budgets.destroy');

        // Reports
        Route::get('/reports/monthly', [ReportController::class, 'monthly'])->name('reports.monthly');

        // Activity Log
        Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    });
});

require __DIR__.'/settings.php';
