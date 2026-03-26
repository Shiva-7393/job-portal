import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import './LoginForm.css'

function LoginForm({ onLogin, onGoogleLogin, onRegister, statusMessage, statusType }) {
    const [mode, setMode] = useState('login')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
    })

    const handleChange = (event) => {
        setFormData((previous) => ({
            ...previous,
            [event.target.name]: event.target.value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (mode === 'register') {
            await onRegister(formData)
            setFormData((previous) => ({
                ...previous,
                password: '',
            }))
            return
        }

        const loginSuccess = await onLogin({
            email: formData.email,
            password: formData.password,
            role: formData.role,
        })

        setFormData((previous) => ({
            ...previous,
            email: '',
            password: '',
        }))

        if (loginSuccess) {
            setMode('login')
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        if (!credentialResponse?.credential || !onGoogleLogin) {
            return
        }

        await onGoogleLogin({
            credential: credentialResponse.credential,
            role: formData.role,
        })
    }

    const isGoogleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

    return (
        <section className="auth-layout">
            <aside className="auth-visual">
                <div className="auth-visual-overlay">
                    <h2>Build Your Career Journey</h2>
                    <p>
                        Connect students with internships and jobs, and help recruiters hire the right
                        talent faster.
                    </p>
                </div>
            </aside>

            <section className="auth-panel">
                <nav className="auth-navbar">
                    <span className="auth-logo">Student Job Portal</span>
                </nav>

                <div className="auth-card">
                    <h3>{mode === 'login' ? 'Welcome Back' : 'Create Your Account'}</h3>
                    <p className="sub">
                        {mode === 'login'
                            ? 'Login to explore jobs and opportunities.'
                            : 'Register to start applying or posting jobs.'}
                    </p>

                    {statusMessage && <p className={`auth-message ${statusType}`}>{statusMessage}</p>}

                    <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                        {mode === 'register' && (
                            <>
                                <label htmlFor="name">Full Name</label>
                                <div className="input-group">
                                    <span className="input-icon">👤</span>
                                    <input
                                        id="name"
                                        name="name"
                                        autoComplete="off"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <label htmlFor="email">Email</label>
                        <div className="input-group">
                            <span className="input-icon">✉️</span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="off"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <label htmlFor="password">Password</label>
                        <div className="input-group">
                            <span className="input-icon">🔒</span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {mode === 'login' && (
                            <>
                                <label htmlFor="login-role">Login As</label>
                                <div className="input-group role-select-group">
                                    <span className="input-icon">🎯</span>
                                    <select
                                        id="login-role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="student">Student</option>
                                        <option value="recruiter">Recruiter</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {mode === 'register' && (
                            <>
                                <label htmlFor="role">Role</label>
                                <div className="input-group role-select-group">
                                    <span className="input-icon">🎯</span>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="student">Student</option>
                                        <option value="recruiter">Recruiter</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <button type="submit" className="login-submit-btn">
                            {mode === 'login' ? 'Login' : 'Create Account'}
                        </button>

                        {mode === 'login' && (
                            <div className="google-login-wrap">
                                {isGoogleConfigured ? (
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => { }}
                                    />
                                ) : (
                                    <p className="google-login-hint">
                                        Google login not configured. Set VITE_GOOGLE_CLIENT_ID in frontend .env
                                    </p>
                                )}
                            </div>
                        )}
                    </form>

                    <p className="auth-switch-text">
                        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                        <button
                            type="button"
                            className="auth-link-btn"
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        >
                            {mode === 'login' ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </section>
        </section>
    )
}

export default LoginForm
