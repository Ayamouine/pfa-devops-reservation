import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function RegisterPage() {
  const { register, showToast } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', role: 'USER', adminCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      showToast(`Compte créé pour ${data.username}.`, 'success');
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
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Inscrivez-vous pour réserver des salles et ressources.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input id="username" type="text" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="role">Type de compte</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
          {form.role === 'ADMIN' && (
            <div className="field">
              <label htmlFor="adminCode">Code administrateur</label>
              <input
                id="adminCode"
                type="password"
                name="adminCode"
                placeholder="Requis pour créer un compte administrateur"
                value={form.adminCode}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <button type="submit" className="btn btn-accent btn-block" disabled={loading}>
            {loading ? 'Création…' : 'Créer le compte'}
          </button>
        </form>

        {error && <p className="message error">{error}</p>}

        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}