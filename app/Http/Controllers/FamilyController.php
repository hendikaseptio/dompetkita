<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Services\FamilyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FamilyController extends Controller
{
    public function __construct(protected FamilyService $familyService) {}

    public function onboarding(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        if ($user->current_family_id || $user->families()->exists()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('family/onboarding');
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $family = $user->currentFamily()->with(['members.user'])->firstOrFail();

        $allFamilies = $user->families()->get();

        return Inertia::render('family/index', [
            'family' => $family,
            'allFamilies' => $allFamilies,
            'userRole' => $family->members->where('user_id', $user->id)->first()?->role ?? 'member',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $family = $this->familyService->createFamily($request->user(), $validated['name']);

        return redirect()->route('dashboard')->with('success', "Keluarga {$family->name} berhasil dibuat!");
    }

    public function join(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        try {
            $family = $this->familyService->joinFamilyByCode($request->user(), $validated['code']);

            return redirect()->route('dashboard')->with('success', "Berhasil bergabung dengan keluarga {$family->name}!");
        } catch (\Exception $e) {
            return back()->withErrors(['code' => 'Kode keluarga tidak valid atau tidak ditemukan.']);
        }
    }

    public function updateMember(Request $request, FamilyMember $member): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        if ($member->family_id !== $family->id) {
            abort(403);
        }

        $validated = $request->validate([
            'nickname' => ['nullable', 'string', 'max:100'],
            'role' => ['required', 'in:owner,member'],
        ]);

        $member->update($validated);

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'member_updated',
            'description' => "{$user->name} memperbarui informasi anggota {$member->user->name}",
        ]);

        return back()->with('success', 'Anggota keluarga berhasil diperbarui.');
    }

    public function removeMember(Request $request, FamilyMember $member): RedirectResponse
    {
        $user = $request->user();
        $family = $user->currentFamily;

        if ($member->family_id !== $family->id) {
            abort(403);
        }

        if ($member->user_id === $user->id) {
            return back()->withErrors(['member' => 'Anda tidak bisa menghapus diri sendiri dari keluarga.']);
        }

        $memberUser = $member->user;
        $member->delete();

        if ($memberUser->current_family_id === $family->id) {
            $memberUser->update(['current_family_id' => null]);
        }

        ActivityLog::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'action' => 'member_removed',
            'description' => "{$user->name} menghapus {$memberUser->name} dari keluarga",
        ]);

        return back()->with('success', 'Anggota keluarga berhasil dihapus.');
    }

    public function switchFamily(Request $request, Family $family): RedirectResponse
    {
        $user = $request->user();

        if (! $user->families()->where('families.id', $family->id)->exists()) {
            abort(403);
        }

        $user->update(['current_family_id' => $family->id]);

        return back()->with('success', "Beralih ke keluarga {$family->name}.");
    }
}
