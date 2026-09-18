import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { CLUBS, FILIERES_GROUPES, REGISTRATION_CODES, ROLE_LABELS } from '../api';

const ROLES = [
  { value: 'ETUDIANT', label: 'Étudiant' },
  { value: 'PROF', label: 'Professeur' },
  { value: 'CHEF_FILIERE', label: 'Chef de filière' },
  { value: 'DOYEN', label: 'Doyen' },
  { value: 'CLUB', label: 'Club' },
  { value: 'ADMIN', label: 'Administrateur' },
];

const LOGO = 'https://www.fsts.ac.ma/images/fsts_logo.png';

const INSTITUTIONAL_EMAIL = /^[\w.+-]+@uhp\.ac\.ma$/i;

export default function RegisterPage() {
  const { register, showToast } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'ETUDIANT',
    adminCode: '',
    firstName: '',
    lastName: '',
    filiere: '',
    club: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'role') setError('');
  };

  const needsCode = ['PROF', 'CHEF_FILIERE', 'DOYEN', 'CLUB', 'ADMIN'].includes(form.role);
  const needsFiliere = ['PROF', 'CHEF_FILIERE', 'ETUDIANT'].includes(form.role);
  const needsClub = form.role === 'CLUB';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!INSTITUTIONAL_EMAIL.test(form.email)) {
      setError("Email institutionnel invalide (format attendu : prenom.nom.fst@uhp.ac.ma)");
      return;
    }
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
            <label htmlFor="email">Email institutionnel</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="prenom.nom.fst@uhp.ac.ma"
              value={form.email}
              onChange={handleChange}
              required
            />
            <p className="small-muted" style={{ marginTop: 5 }}>
              Sert d’identifiant de connexion et de récupération du mot de passe.
            </p>
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
                {FILIERES_GROUPES.map((g) => (
                  <optgroup key={g.groupe} label={g.groupe}>
                    {g.filieres.map((f) => <option value={f} key={f}>{f}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
          {needsClub && (
            <div className="field">
              <label htmlFor="club">Club</label>
              <select id="club" name="club" value={form.club} onChange={handleChange} required>
                <option value="">— Choisir le club —</option>
                {CLUBS.map((c) => <option value={c} key={c}>{c}</option>)}
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