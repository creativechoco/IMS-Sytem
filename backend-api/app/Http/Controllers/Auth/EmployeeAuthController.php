<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmployeeAuthController extends Controller
{
    /**
     * Handle employee login by checking the registration masterlist.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string'],
        ]);

        $fullName = Str::squish($validated['full_name']);
        $normalized = Str::lower($fullName);

        $record = DB::table('registration_users')
            ->select('id', 'full_name')
            ->whereRaw('LOWER(TRIM(full_name)) = ?', [$normalized])
            ->first();

        if (! $record) {
            return response()->json([
                'success' => false,
                'message' => 'Full name not found in the masterlist.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'token' => bin2hex(random_bytes(16)),
            'user' => [
                'id' => $record->id,
                'full_name' => $record->full_name,
            ],
        ]);
    }
}
