'use client';

import { useState, type FormEvent } from 'react';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Authentication request submitted');

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' ? { email, password } : { name, email, password };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      setMessage(`${mode === 'login' ? 'Logged in' : 'Registered'} successfully`);
    } else {
      setMessage('Authentication failed');
    }
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '3rem auto',
        padding: '2rem',
        border: '1px solid #ddd',
        borderRadius: 12,
      }}
    >
      <h1>LinkedOut Auth</h1>
      <p>Authentication UI placeholder wired to the auth API.</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button type="button" onClick={() => setMode('login')}>
          Login
        </button>
        <button type="button" onClick={() => setMode('register')}>
          Register
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div style={{ marginBottom: '0.75rem' }}>
            <label>Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{ display: 'block', width: '100%' }}
            />
          </div>
        )}
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{ display: 'block', width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ display: 'block', width: '100%' }}
          />
        </div>
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
