<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Wallet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $wallets = Wallet::where('family_id', $family->id)
            ->orderBy('name')
            ->get();

        $totalBalance = $wallets->sum('balance');

        return Inertia::render('wallets/index', [
            'wallets' => $wallets,
            'totalBalance' => (float) $totalBalance,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:cash,digital,saving,bank'],
            'balance' => ['required', 'numeric', 'min:0'],
            'account_number' => ['nullable', 'string', 'max:100'],
        ]);

        $wallet = Wallet::create([
            'family_id' => $family->id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'balance' => $validated['balance'],
            'account_number' => $validated['account_number'],
        ]);

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'wallet_created',
            'description' => "{$user->name} menambahkan dompet baru: {$wallet->name} (Saldo: Rp ".number_format($wallet->balance, 0, ',', '.').')',
        ]);

        return back()->with('success', "Dompet {$wallet->name} berhasil ditambahkan!");
    }

    public function update(Request $request, Wallet $wallet): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        if ($wallet->family_id !== $family->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:cash,digital,saving,bank'],
            'account_number' => ['nullable', 'string', 'max:100'],
        ]);

        $wallet->update($validated);

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'wallet_updated',
            'description' => "{$user->name} memperbarui dompet {$wallet->name}",
        ]);

        return back()->with('success', "Dompet {$wallet->name} berhasil diperbarui.");
    }

    public function destroy(Request $request, Wallet $wallet): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        if ($wallet->family_id !== $family->id) {
            abort(403);
        }

        $walletName = $wallet->name;
        $wallet->delete();

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'wallet_deleted',
            'description' => "{$user->name} menghapus dompet {$walletName}",
        ]);

        return back()->with('success', "Dompet {$walletName} berhasil dihapus.");
    }
}
