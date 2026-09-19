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

  const linkCls = ({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}` as const;
  const linkCls = ({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`;
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
        <NavLink to="/" className={linkCls}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          Tableau de bord
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <strong>{fullName}</strong>
          <span className="role-tag">{ROLE_LABELS[role] || role}</span>
        </div>
        <button className="btn btn-ghost btn-block" onClick={logout} type="button">
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
