<?php

use App\Models\Category;
use App\Models\User;
use App\Models\Wallet;
use App\Services\FamilyService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can create family and seed default categories', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('family.store'), [
        'name' => 'Keluarga Bahagia',
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertDatabaseHas('families', ['name' => 'Keluarga Bahagia']);

    $user->refresh();
    expect($user->current_family_id)->not->toBeNull();

    $categoriesCount = Category::where('family_id', $user->current_family_id)->count();
    expect($categoriesCount)->toBeGreaterThan(0);
});

test('income transaction increases wallet balance', function () {
    $user = User::factory()->create();
    $family = app(FamilyService::class)->createFamily($user, 'Keluarga Test');

    $wallet = Wallet::create([
        'family_id' => $family->id,
        'name' => 'Bank BCA',
        'type' => 'bank',
        'balance' => 1000000,
    ]);

    $category = Category::where('family_id', $family->id)->where('type', 'income')->first();

    $response = $this->actingAs($user)->post(route('transactions.store'), [
        'type' => 'income',
        'amount' => 5000000,
        'paid_by' => $user->id,
        'transaction_date' => now()->toDateString(),
        'category_id' => $category->id,
        'wallet_to_id' => $wallet->id,
        'note' => 'Gaji Bulanan',
    ]);

    $response->assertStatus(302);
    expect($wallet->fresh()->balance)->toBe('6000000.00');
});

test('expense transaction decreases wallet balance', function () {
    $user = User::factory()->create();
    $family = app(FamilyService::class)->createFamily($user, 'Keluarga Test');

    $wallet = Wallet::create([
        'family_id' => $family->id,
        'name' => 'Dompet Fisik',
        'type' => 'cash',
        'balance' => 500000,
    ]);

    $category = Category::where('family_id', $family->id)->where('type', 'expense')->first();

    $response = $this->actingAs($user)->post(route('transactions.store'), [
        'type' => 'expense',
        'amount' => 50000,
        'paid_by' => $user->id,
        'transaction_date' => now()->toDateString(),
        'category_id' => $category->id,
        'wallet_from_id' => $wallet->id,
        'note' => 'Beli Bensin',
    ]);

    $response->assertStatus(302);
    expect($wallet->fresh()->balance)->toBe('450000.00');
});

test('transfer moves balance between wallets without affecting net flow', function () {
    $user = User::factory()->create();
    $family = app(FamilyService::class)->createFamily($user, 'Keluarga Test');

    $walletCash = Wallet::create([
        'family_id' => $family->id,
        'name' => 'Dompet',
        'type' => 'cash',
        'balance' => 500000,
    ]);

    $walletDigital = Wallet::create([
        'family_id' => $family->id,
        'name' => 'GoPay',
        'type' => 'digital',
        'balance' => 100000,
    ]);

    $response = $this->actingAs($user)->post(route('transactions.store'), [
        'type' => 'transfer',
        'amount' => 200000,
        'paid_by' => $user->id,
        'transaction_date' => now()->toDateString(),
        'wallet_from_id' => $walletCash->id,
        'wallet_to_id' => $walletDigital->id,
        'note' => 'Topup GoPay',
    ]);

    $response->assertStatus(302);
    expect($walletCash->fresh()->balance)->toBe('300000.00');
    expect($walletDigital->fresh()->balance)->toBe('300000.00');
});

test('unbudgeted expense category is tracked properly', function () {
    $user = User::factory()->create();
    $family = app(FamilyService::class)->createFamily($user, 'Keluarga Test');

    $wallet = Wallet::create([
        'family_id' => $family->id,
        'name' => 'Dompet',
        'type' => 'cash',
        'balance' => 1000000,
    ]);

    $unbudgetedCat = Category::create([
        'family_id' => $family->id,
        'name' => 'Belanja Bulanan Variabel',
        'type' => 'expense',
    ]);

    $this->actingAs($user)->post(route('transactions.store'), [
        'type' => 'expense',
        'amount' => 250000,
        'paid_by' => $user->id,
        'transaction_date' => now()->toDateString(),
        'category_id' => $unbudgetedCat->id,
        'wallet_from_id' => $wallet->id,
        'note' => 'Belanja Supermarket',
    ]);

    $response = $this->actingAs($user)->get(route('budgets.index'));
    $response->assertOk();

    $unbudgetedItems = $response->viewData('page')['props']['unbudgetedItems'];
    $found = collect($unbudgetedItems)->firstWhere('category_id', $unbudgetedCat->id);

    expect($found)->not->toBeNull();
    expect($found['spent'])->toBe(250000.0);
});
