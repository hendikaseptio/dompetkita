<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasFamily
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if (! $user->current_family_id) {
            $firstFamily = $user->families()->first();
            if ($firstFamily) {
                $user->update(['current_family_id' => $firstFamily->id]);
            } else {
                if (! $request->routeIs('family.onboarding*') && ! $request->routeIs('family.store') && ! $request->routeIs('family.join')) {
                    return redirect()->route('family.onboarding');
                }
            }
        }

        return $next($request);
    }
}
