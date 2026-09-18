<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $query = Transaction::with(['creator', 'payer', 'category', 'walletFrom', 'walletTo'])
            ->where('family_id', $family->id);

        if ($request->filled('type') && in_array($request->type, ['income', 'expense', 'transfer'])) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('wallet_id')) {
            $walletId = $request->wallet_id;
            $query->where(function ($q) use ($walletId) {
                $q->where('wallet_from_id', $walletId)
                    ->orWhere('wallet_to_id', $walletId);
            });
        }

        if ($request->filled('month') && $request->filled('year')) {
            $query->whereYear('transaction_date', $request->year)
                ->whereMonth('transaction_date', $request->month);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('note', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($catQuery) use ($search) {
                        $catQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();

        $wallets = Wallet::where('family_id', $family->id)->get();
        $categories = Category::where('family_id', $family->id)->get();
        $members = $family->users()->get();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'wallets' => $wallets,
            'categories' => $categories,
            'members' => $members,
            'filters' => $request->only(['type', 'category_id', 'wallet_id', 'month', 'year', 'search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $validated = $request->validate([
            'type' => ['required', 'in:income,expense,transfer'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'paid_by' => ['required', 'exists:users,id'],
            'transaction_date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],
            'category_id' => ['required_if:type,income,expense', 'nullable', 'exists:categories,id'],
            'wallet_from_id' => ['required_if:type,expense,transfer', 'nullable', 'exists:wallets,id'],
            'wallet_to_id' => ['required_if:type,income,transfer', 'nullable', 'exists:wallets,id'],
        ]);

        DB::transaction(function () use ($user, $family, $validated) {
            $transaction = Transaction::create([
                'family_id' => $family->id,
                'created_by' => $user->id,
                'paid_by' => $validated['paid_by'],
                'type' => $validated['type'],
                'category_id' => $validated['category_id'] ?? null,
                'amount' => $validated['amount'],
                'wallet_from_id' => $validated['wallet_from_id'] ?? null,
                'wallet_to_id' => $validated['wallet_to_id'] ?? null,
                'transaction_date' => $validated['transaction_date'],
                'note' => $validated['note'] ?? null,
            ]);

            $amount = (float) $validated['amount'];

            if ($validated['type'] === 'income' && ! empty($validated['wallet_to_id'])) {
                Wallet::where('id', $validated['wallet_to_id'])->increment('balance', $amount);
            } elseif ($validated['type'] === 'expense' && ! empty($validated['wallet_from_id'])) {
                Wallet::where('id', $validated['wallet_from_id'])->decrement('balance', $amount);
            } elseif ($validated['type'] === 'transfer') {
                if (! empty($validated['wallet_from_id'])) {
                    Wallet::where('id', $validated['wallet_from_id'])->decrement('balance', $amount);
                }
                if (! empty($validated['wallet_to_id'])) {
                    Wallet::where('id', $validated['wallet_to_id'])->increment('balance', $amount);
                }
            }

            $typeLabel = match ($validated['type']) {
                'income' => 'pemasukan',
                'expense' => 'pengeluaran',
                'transfer' => 'transfer',
            };

            ActivityLog::create([
                'family_id' => $family->id,
                'user_id' => $user->id,
                'action' => 'transaction_created',
                'description' => "{$user->name} mencatat {$typeLabel} sebesar Rp ".number_format($amount, 0, ',', '.'),
            ]);
        });

        return back()->with('success', 'Transaksi berhasil ditambahkan!');
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        if ($transaction->family_id !== $family->id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => ['required', 'in:income,expense,transfer'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'paid_by' => ['required', 'exists:users,id'],
            'transaction_date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],
            'category_id' => ['required_if:type,income,expense', 'nullable', 'exists:categories,id'],
            'wallet_from_id' => ['required_if:type,expense,transfer', 'nullable', 'exists:wallets,id'],
            'wallet_to_id' => ['required_if:type,income,transfer', 'nullable', 'exists:wallets,id'],
        ]);

        DB::transaction(function () use ($user, $family, $transaction, $validated) {
            // Revert old transaction balances
            $oldAmount = (float) $transaction->amount;
            if ($transaction->type === 'income' && $transaction->wallet_to_id) {
                Wallet::where('id', $transaction->wallet_to_id)->decrement('balance', $oldAmount);
            } elseif ($transaction->type === 'expense' && $transaction->wallet_from_id) {
                Wallet::where('id', $transaction->wallet_from_id)->increment('balance', $oldAmount);
            } elseif ($transaction->type === 'transfer') {
                if ($transaction->wallet_from_id) {
                    Wallet::where('id', $transaction->wallet_from_id)->increment('balance', $oldAmount);
                }
                if ($transaction->wallet_to_id) {
                    Wallet::where('id', $transaction->wallet_to_id)->decrement('balance', $oldAmount);
                }
            }

            // Update transaction fields
            $transaction->update([
                'paid_by' => $validated['paid_by'],
                'type' => $validated['type'],
                'category_id' => $validated['category_id'] ?? null,
                'amount' => $validated['amount'],
                'wallet_from_id' => $validated['wallet_from_id'] ?? null,
                'wallet_to_id' => $validated['wallet_to_id'] ?? null,
                'transaction_date' => $validated['transaction_date'],
                'note' => $validated['note'] ?? null,
            ]);

            // Apply new transaction balances
            $newAmount = (float) $validated['amount'];
            if ($validated['type'] === 'income' && ! empty($validated['wallet_to_id'])) {
                Wallet::where('id', $validated['wallet_to_id'])->increment('balance', $newAmount);
            } elseif ($validated['type'] === 'expense' && ! empty($validated['wallet_from_id'])) {
                Wallet::where('id', $validated['wallet_from_id'])->decrement('balance', $newAmount);
            } elseif ($validated['type'] === 'transfer') {
                if (! empty($validated['wallet_from_id'])) {
                    Wallet::where('id', $validated['wallet_from_id'])->decrement('balance', $newAmount);
                }
                if (! empty($validated['wallet_to_id'])) {
                    Wallet::where('id', $validated['wallet_to_id'])->increment('balance', $newAmount);
                }
            }

            ActivityLog::create([
                'family_id' => $family->id,
                'user_id' => $user->id,
                'action' => 'transaction_updated',
                'description' => "{$user->name} memperbarui transaksi #{$transaction->id}",
            ]);
        });

        return back()->with('success', 'Transaksi berhasil diperbarui.');
    }

    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        if ($transaction->family_id !== $family->id) {
            abort(403);
        }

        DB::transaction(function () use ($user, $family, $transaction) {
            $amount = (float) $transaction->amount;

            // Revert balances
            if ($transaction->type === 'income' && $transaction->wallet_to_id) {
                Wallet::where('id', $transaction->wallet_to_id)->decrement('balance', $amount);
            } elseif ($transaction->type === 'expense' && $transaction->wallet_from_id) {
                Wallet::where('id', $transaction->wallet_from_id)->increment('balance', $amount);
            } elseif ($transaction->type === 'transfer') {
                if ($transaction->wallet_from_id) {
                    Wallet::where('id', $transaction->wallet_from_id)->increment('balance', $amount);
                }
                if ($transaction->wallet_to_id) {
                    Wallet::where('id', $transaction->wallet_to_id)->decrement('balance', $amount);
                }
            }

            $transaction->delete();

            ActivityLog::create([
                'family_id' => $family->id,
                'user_id' => $user->id,
                'action' => 'transaction_deleted',
                'description' => "{$user->name} menghapus transaksi #{$transaction->id}",
            ]);
        });

        return back()->with('success', 'Transaksi berhasil dihapus.');
    }
}
