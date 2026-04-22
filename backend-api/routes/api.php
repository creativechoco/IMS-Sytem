<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\EmployeeAuthController;

Route::middleware('api')->group(function () {
    Route::post('/employee/login', [EmployeeAuthController::class, 'login']);
});
