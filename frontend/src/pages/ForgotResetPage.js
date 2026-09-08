import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

export default function ForgotResetPage() {
  const { forgot, reset, verify, showToast } = useAuth();
  const [mode, setMode] = useState('forgot'); // forgot | reset | verify
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      const res = await forgot(username);
      showToast('Token de réinitialisation généré (demo).', 'success');
      setToken(res.resetToken || res.resetToken);
      setMode('reset');
    } catch (err) {
      showToast(err.message || 'Erreur', 'error');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await reset(token, newPassword);
      showToast('Mot de passe réinitialisé.', 'success');
      setMode('forgot');
      setUsername(''); setToken(''); setNewPassword('');
    } catch (err) {
      showToast(err.message || 'Erreur', 'error');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verify(token);
      showToast('Compte vérifié.', 'success');
    } catch (err) {
      showToast(err.message || 'Erreur', 'error');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mot de passe oublié / Vérification</h1>
      </header>

      <section className="card">
        {mode === 'forgot' && (
          <form onSubmit={handleForgot}>
            <div className="field">
              <label>Nom d'utilisateur</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <button className="btn btn-primary">Demander réinitialisation</button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleReset}>
            <div className="field">
              <label>Token</label>
              <input value={token} onChange={(e) => setToken(e.target.value)} required />
            </div>
            <div className="field">
              <label>Nouveau mot de passe</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary">Réinitialiser</button>
          </form>
        )}

        <hr />
        <form onSubmit={handleVerify}>
          <div className="field">
            <label>Token de vérification</label>
            <input value={token} onChange={(e) => setToken(e.target.value)} />
          </div>
          <button className="btn">Vérifier compte</button>
        </form>
      </section>
    </div>
  );
}
