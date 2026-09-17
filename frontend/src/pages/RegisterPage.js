import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FILIERES, REGISTRATION_CODES, ROLE_LABELS } from '../api';

const ROLES = [
  { value: 'ETUDIANT', label: 'Étudiant' },
  { value: 'PROF', label: 'Professeur' },
  { value: 'CHEF_FILIERE', label: 'Chef de filière' },
  { value: 'DOYEN', label: 'Doyen' },
  { value: 'ADMIN', label: 'Administrateur' },
];

const LOGO = 'https://www.fsts.ac.ma/images/fsts_logo.png';

export default function RegisterPage() {
  const { register, showToast } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'ETUDIANT',
    adminCode: '',
    firstName: '',
    lastName: '',
    filiere: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'role') setError('');
  };

  const needsCode = ['PROF', 'CHEF_FILIERE', 'DOYEN', 'ADMIN'].includes(form.role);
  const needsFiliere = ['PROF', 'CHEF_FILIERE', 'DOYEN', 'ETUDIANT'].includes(form.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      showToast(`Bienvenue ${data.firstName || data.username} !`, 'success');
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">
          <img src={LOGO} alt="Logo FST Settat" />
        </div>
        <p className="auth-eyebrow">FST Settat · Réservation des salles</p>
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">
          Choisissez votre rôle : le code d’inscription est requis pour le personnel.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="firstName">Prénom</label>
              <input id="firstName" type="text" name="firstName" value={form.firstName} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="lastName">Nom</label>
              <input id="lastName" type="text" name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="username">Nom d’utilisateur</label>
            <input id="username" type="text" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="role">Type de compte</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              {ROLES.map((r) => <option value={r.value} key={r.value}>{r.label}</option>)}
            </select>
          </div>
          {needsFiliere && (
            <div className="field">
              <label htmlFor="filiere">Filière</label>
              <select id="filiere" name="filiere" value={form.filiere} onChange={handleChange} required={form.role === 'CHEF_FILIERE'}>
                <option value="">— Choisir la filière —</option>
                {FILIERES.map((f) => <option value={f} key={f}>{f}</option>)}
              </select>
            </div>
          )}
          {needsCode && (
            <div className="field">
              <label htmlFor="adminCode">Code d’inscription ({ROLE_LABELS[form.role]})</label>
              <input
                id="adminCode"
                type="password"
                name="adminCode"
                placeholder={REGISTRATION_CODES[form.role] || 'Code requis'}
                value={form.adminCode}
                onChange={handleChange}
                required
              />
              <p className="small-muted" style={{ marginTop: 5 }}>
                Démo : <code>{REGISTRATION_CODES[form.role]}</code>
              </p>
            </div>
          )}
          <button type="submit" className="btn btn-accent btn-block" disabled={loading}>
            {loading ? 'Création…' : 'Créer le compte'}
          </button>
        </form>

        {error && <p className="message error">{error}</p>}

        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link> ·{' '}
          <Link to="/">Retour à l’accueil</Link>
        </p>
      </div>
    </div>
  );
}