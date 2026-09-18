<?php

namespace App\Models;

use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory;

    protected $fillable = [
        'family_id',
        'created_by',
        'paid_by',
        'type',
        'category_id',
        'amount',
        'wallet_from_id',
        'wallet_to_id',
        'transaction_date',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'transaction_date' => 'date',
        ];
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function walletFrom(): BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'wallet_from_id');
    }

    public function walletTo(): BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'wallet_to_id');
    }
}
