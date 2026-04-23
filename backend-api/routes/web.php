<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Proxy storage files with CORS headers so frontend exports (html-to-image) can read photos
Route::get('/media/{path}', function (string $path) {
    $relative = ltrim($path, '/');

    if (!Storage::disk('public')->exists($relative)) {
        abort(404);
    }

    $mime = Storage::disk('public')->mimeType($relative) ?? 'application/octet-stream';
    $contents = Storage::disk('public')->get($relative);

    return response($contents, 200)
        ->header('Content-Type', $mime)
        ->header('Access-Control-Allow-Origin', '*');
})->where('path', '.*');
