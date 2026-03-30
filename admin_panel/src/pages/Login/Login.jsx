import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from './hooks/useTelegramAuth';
import LoginCard from './components/LoginCard/LoginCard';
import TelegramWidget from './components/TelegramWidget/TelegramWidget';
import { authAPI } from '../../services/api';
import './Login.css';

const Login = () => {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [loginValue, setLoginValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerLogin, setRegisterLogin] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [devUserId, setDevUserId] = useState('1');
    const [devSecret, setDevSecret] = useState('dev');
    const [devLoading, setDevLoading] = useState(false);
    const [devError, setDevError] = useState(null);

    useTelegramAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setAuthLoading(true);
        setAuthError(null);

        try {
            const response = mode === 'register'
                ? await authAPI.register({
                    name: registerName,
                    login: registerLogin,
                    password: registerPassword
                })
                : await authAPI.login({
                    login: loginValue,
                    password: passwordValue
                });

            if (response?.data?.token && response?.data?.user) {
                login(response.data.token, response.data.user);
            } else {
                setAuthError(`Invalid response from ${mode}.`);
            }
        } catch (error) {
            setAuthError(
                error.response?.data?.message
                || error.message
                || (mode === 'register' ? 'Registration failed.' : 'Login failed.')
            );
        } finally {
            setAuthLoading(false);
        }
    };

    const handleDevLogin = async (event) => {
        event.preventDefault();
        setDevLoading(true);
        setDevError(null);
        try {
            const payload = {
                userId: devUserId ? Number(devUserId) : null,
                secret: devSecret
            };
            const response = await authAPI.devLogin(payload);
            if (response?.data?.token && response?.data?.user) {
                login(response.data.token, response.data.user);
            } else {
                setDevError('Invalid response from dev login.');
            }
        } catch (error) {
            setDevError(error.response?.data?.message || error.message || 'Dev login failed.');
        } finally {
            setDevLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <LoginCard>
            <div className="login-content">
                <h2>Вход в систему</h2>
                <p>Для доступа к панели управления войдите удобным способом</p>

                <div className="auth-mode-switch" role="tablist" aria-label="Auth mode switch">
                    <button
                        type="button"
                        className={`auth-mode-button ${mode === 'login' ? 'is-active' : ''}`}
                        onClick={() => {
                            setMode('login');
                            setAuthError(null);
                        }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={`auth-mode-button ${mode === 'register' ? 'is-active' : ''}`}
                        onClick={() => {
                            setMode('register');
                            setAuthError(null);
                        }}
                    >
                        Register
                    </button>
                </div>

                <form className="password-login-form" onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <>
                            <label htmlFor="register-name">Name</label>
                            <input
                                id="register-name"
                                type="text"
                                value={registerName}
                                onChange={(event) => setRegisterName(event.target.value)}
                                autoComplete="name"
                            />
                        </>
                    )}

                    <label htmlFor="auth-login">{mode === 'register' ? 'Login' : 'Login'}</label>
                    <input
                        id="auth-login"
                        type="text"
                        value={mode === 'register' ? registerLogin : loginValue}
                        onChange={(event) => (
                            mode === 'register'
                                ? setRegisterLogin(event.target.value)
                                : setLoginValue(event.target.value)
                        )}
                        autoComplete="username"
                    />

                    <label htmlFor="auth-password">Password</label>
                    <input
                        id="auth-password"
                        type="password"
                        value={mode === 'register' ? registerPassword : passwordValue}
                        onChange={(event) => (
                            mode === 'register'
                                ? setRegisterPassword(event.target.value)
                                : setPasswordValue(event.target.value)
                        )}
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    />

                    {authError && <div className="dev-login-error">{authError}</div>}
                    <button type="submit" disabled={authLoading}>
                        {authLoading
                            ? (mode === 'register' ? 'Registering...' : 'Logging in...')
                            : (mode === 'register' ? 'Create account' : 'Login with password')}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>или</span>
                </div>

                <TelegramWidget />

                <form className="dev-login-form" onSubmit={handleDevLogin}>
                    <h3>Dev login</h3>
                    <label htmlFor="dev-user-id">User ID</label>
                    <input
                        id="dev-user-id"
                        type="number"
                        min="1"
                        value={devUserId}
                        onChange={(event) => setDevUserId(event.target.value)}
                    />
                    <label htmlFor="dev-secret">Secret</label>
                    <input
                        id="dev-secret"
                        type="password"
                        value={devSecret}
                        onChange={(event) => setDevSecret(event.target.value)}
                    />
                    {devError && <div className="dev-login-error">{devError}</div>}
                    <button type="submit" disabled={devLoading}>
                        {devLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </LoginCard>
    );
};

export default Login;
