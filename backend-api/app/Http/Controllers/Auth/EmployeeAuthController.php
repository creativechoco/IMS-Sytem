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
        $normalized = $this->normalizeName($fullName);

        $record = DB::table('registration_users')
            ->select('id', 'full_name')
            ->whereRaw('LOWER(TRIM(REGEXP_REPLACE(full_name, "[^A-Za-z0-9 ]", ""))) = ?', [$normalized])
            ->first();

        if (! $record) {
            return response()->json([
                'success' => false,
                'message' => 'Full name not found in the masterlist.',
            ], 401);
        }

        $employee = $this->findEmployeeByName($normalized);

        return response()->json([
            'success' => true,
            'token' => bin2hex(random_bytes(16)),
            'user' => [
                'id' => $record->id,
                'full_name' => $record->full_name,
            ],
            'employee' => $employee,
        ]);
    }

    private function normalizeName(string $name): string
    {
        $ascii = Str::of($name)->ascii()->lower();
        $clean = preg_replace('/[^a-z0-9]+/i', ' ', $ascii);
        return trim(preg_replace('/\s+/', ' ', $clean));
    }

    private function findEmployeeByName(string $normalizedName): ?array
    {
        $employees = DB::table('employees')->get();

        $match = $employees->first(function ($emp) use ($normalizedName) {
            $full = implode(' ', array_filter([
                $emp->last_name,
                $emp->first_name,
                $emp->middle_name,
            ]));

            return $this->normalizeName($full) === $normalizedName;
        });

        if (! $match) {
            return null;
        }

        return [
            'id' => $match->id,
            'id_number' => $match->id_number,
            'first_name' => $match->first_name,
            'middle_name' => $match->middle_name,
            'last_name' => $match->last_name,
            'position' => $match->position,
            'department' => $match->department,
            'home_address' => $match->home_address,
            'contact_number' => $match->contact_number,
            'date_of_birth' => $match->date_of_birth,
            'blood_type' => $match->blood_type,
            'sss_number' => $match->sss_number,
            'pagibig_number' => $match->pagibig_number,
            'tin_number' => $match->tin_number,
            'philhealth_number' => $match->philhealth_number,
            'emergency_name' => $match->emergency_name,
            'emergency_contact' => $match->emergency_contact,
            'emergency_relationship' => $match->emergency_relationship,
            'photo_url' => $this->proxyMediaUrl($match->photo_url),
            'signature_url' => $this->proxyMediaUrl($match->signature_url),
        ];
    }

    private function proxyMediaUrl(?string $url): ?string
    {
        if (! $url) return null;

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return Str::replaceFirst('/storage/', '/media/', $url);
        }

        $clean = ltrim($url, '/');
        if (str_starts_with($clean, 'storage/')) {
            return url('/media/' . Str::replaceFirst('storage/', '', $clean));
        }

        return url('/' . $clean);
    }
}
