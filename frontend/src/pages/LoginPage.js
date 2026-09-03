import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const { login, showToast } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      showToast(`Connecté(e) en tant que ${data.username}.`, 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <p className="eyebrow">Plateforme DevOps &middot; Microservices</p>
        <h1 className="auth-title">Connexion</h1>
        <p className="auth-subtitle">Accédez à votre espace de réservation.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input id="username" type="text" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        {error && <p className="message error">{error}</p>}

        <p className="auth-switch">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}