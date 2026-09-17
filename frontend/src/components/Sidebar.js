import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ROLE_LABELS, unreadCount } from '../api';

export default function Sidebar() {
  const { currentUser, role, fullName, logout, token } = useAuth();
  const [nbUnread, setNbUnread] = useState(0);

  useEffect(() => {
    let active = true;
    if (!currentUser) return undefined;
    unreadCount(token)
      .then((d) => active && setNbUnread(Number(d.count) || 0))
      .catch(() => active && setNbUnread(0));
    const t = setInterval(() => {
      unreadCount(token)
        .then((d) => active && setNbUnread(Number(d.count) || 0))
        .catch(() => {});
    }, 20000);
    return () => { active = false; clearInterval(t); };
  }, [currentUser, token]);

  if (!currentUser) return null;

  const linkCls = ({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-sub">FST Settat</span>
        <span className="sidebar-brand-title">Réservation des salles</span>
      </div>

      <div className="role-banner">
        <span className="role-icon">
          <span className="role-dot" />
          {ROLE_LABELS[role] || role}
        </span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/app" end className={linkCls}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          Tableau de bord
        </NavLink>

        {(role === 'PROF' || role === 'CHEF_FILIERE' || role === 'DOYEN' || role === 'ADMIN') && (
          <NavLink to="/reservations" className={linkCls}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Mes demandes
          </NavLink>
        )}

        {(role === 'CHEF_FILIERE' || role === 'DOYEN' || role === 'ADMIN') && (
          <NavLink to="/validations" className={linkCls}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 11l3 3 8-8" />
              <path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
            </svg>
            {role === 'DOYEN' ? 'Cachet du doyen' : 'Validations'}
          </NavLink>
        )}

        <NavLink to="/ressources" className={linkCls}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M14 9h1M14 13h1M9 17h1M14 17h1" />
          </svg>
          Salles &amp; ressources
        </NavLink>

        <NavLink to="/calendar" className={linkCls}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M8 2v4M16 2v4M3 10h18" />
            <path d="M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" />
          </svg>
          Emploi du temps
        </NavLink>

        <NavLink to="/notifications" className={linkCls}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          Notifications
          {nbUnread > 0 && <span className="sb-badge">{nbUnread}</span>}
        </NavLink>

        <NavLink to="/profil" className={linkCls}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
          </svg>
          Mon profil
        </NavLink>

        {role === 'ADMIN' && (
          <>
            <div className="sidebar-section-label">Administration</div>
            <NavLink to="/admin" className={linkCls}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z" />
              </svg>
              Supervision
            </NavLink>
            <NavLink to="/admin/ressources" className={linkCls}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1" />
              </svg>
              Gestion des salles
            </NavLink>
            <NavLink to="/admin/utilisateurs" className={linkCls}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="7" r="4" />
                <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2M16 3.13a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87" />
              </svg>
              Comptes &amp; filières
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <strong>{fullName || currentUser.username}</strong>
          <span className="role-tag">{ROLE_LABELS[role] || role}</span>
        </div>
        <button className="btn btn-ghost btn-block" onClick={logout} type="button">
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}