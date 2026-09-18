<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $family = $user->currentFamily;

        $logs = ActivityLog::with('user')
            ->where('family_id', $family->id)
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        return Inertia::render('activity-log/index', [
            'logs' => $logs,
        ]);
    }
}
