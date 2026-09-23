<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;

test('users can redirect to google auth provider', function () {
    $response = $this->get(route('auth.google'));

    $response->assertRedirect();
});

test('users can authenticate using google account', function () {
    $abstractUser = Mockery::mock(Laravel\Socialite\Two\User::class);
    $abstractUser->shouldReceive('getId')->andReturn('1234567890');
    $abstractUser->shouldReceive('getName')->andReturn('Test Google User');
    $abstractUser->shouldReceive('getNickname')->andReturn('testuser');
    $abstractUser->shouldReceive('getEmail')->andReturn('googleuser@example.com');
    $abstractUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/a/avatar.jpg');

    $provider = Mockery::mock(GoogleProvider::class);
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('email', 'googleuser@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->google_id)->toBe('1234567890');
});
