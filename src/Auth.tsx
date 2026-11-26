import { useState, type FormEvent } from 'react'
import { supabase } from './lib/supabase'

type AuthMode = 'login' | 'signup' | 'forgot'

type AuthProps = {
  initialMode?: 'login' | 'signup'
  onBack?: () => void
}

export default function Auth({ initialMode = 'login', onBack }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

        if (error) throw error

        setMessage(
          data.session
            ? 'Your account has been created successfully.'
            : 'Account created. Please check your email for a confirmation link.'
        )
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) throw error
        setMessage('Login successful.')
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim()
        )

        if (error) throw error
        setMessage('If an account exists for this email, a password reset link has been sent.')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">P</span>
          <span>Profit<span className="brand-light">Pilot</span></span>
        </div>

        {onBack && (
          <button
            type="button"
            className="auth-back-button"
            onClick={onBack}
          >
            ← Back to website
          </button>
        )}

        <div className="auth-heading">
          <span className="eyebrow">YOUR BUSINESS WORKSPACE</span>
          <h1>
            {mode === 'signup'
              ? 'Create your account'
              : mode === 'forgot'
                ? 'Reset your password'
                : 'Welcome back'}
          </h1>
          <p>
            {mode === 'signup'
              ? 'Create an account to start managing your business.'
              : mode === 'forgot'
                ? 'Enter your email address to request a reset link.'
                : 'Sign in to access your ProfitPilot workspace.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          {mode !== 'forgot' && (
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={8}
                required
              />
            </label>
          )}

          {mode === 'login' && (
            <button
              type="button"
              className="auth-text-button"
              onClick={() => {
                setMode('forgot')
                setMessage('')
                setError('')
              }}
            >
              Forgot password?
            </button>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'signup'
                ? 'Create account'
                : mode === 'forgot'
                  ? 'Send reset link'
                  : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => {
                setMode('signup')
                setMessage('')
                setError('')
              }}>
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => {
                setMode('login')
                setMessage('')
                setError('')
              }}>
                Sign in
              </button>
            </>
          )}
        </div>

        {mode === 'forgot' && (
          <button
            className="auth-back-button"
            onClick={() => {
              setMode('login')
              setMessage('')
              setError('')
            }}
          >
            Back to login
          </button>
        )}

        <p className="auth-footer">
          Secure account authentication powered by Supabase.
        </p>
      </section>
    </main>
  )
}
