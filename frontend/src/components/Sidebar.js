import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ROLE_LABELS, ROLE_MENUS, unreadCount } from '../api';

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

  const iconFor = (name) => {
    const svg = (paths) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {paths}
      </svg>
    );
    const p = (d) => <path d={d} />;
    const r = (x, y, w, h, rx = 1) => <rect x={x} y={y} width={w} height={h} rx={rx} />;
    const icons = {
      dashboard: (
        <g>
          {r(3, 3, 7, 9)} {r(14, 3, 7, 5)} {r(14, 12, 7, 9)} {r(3, 16, 7, 5)}
        </g>
      ),
      bookings: (
        <g>
          {r(5, 3, 14, 18, 2)} {p('M8 3v4M16 3v4')} {p('M5 11h14M12 15h.01M12 18h.01')}
        </g>
      ),
      resources: (
        <g>
          {r(3, 3, 18, 12, 2)} {p('M3 9h18M7 7h.01M10 7h.01')}
        </g>
      ),
      calendar: (
        <g>
          {r(4, 4, 16, 17, 2)} {p('M8 2v5M16 2v5M4 10h16')}
        </g>
      ),
      notifications: (
        <g>
          <path d="M12 3a5 5 0 0 0-5 5v3l-2 3h14l-2-3V8a5 5 0 0 0-5-5z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </g>
      ),
      profile: (
        <g>
          <circle cx="12" cy="9" r="4" />
          <path d="M4 21c1-3 4-5 8-5s7 2 8 5" />
        </g>
      ),
      approvals: (
        <g>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 12l2 2 4-4" />
        </g>
      ),
      admin: (
        <g>
          <path d="M12 3l9 4v5c0 5-3.5 8.5-9 10-5.5-1.5-9-5-9-10V7l9-4z" />
          <path d="M12 8v5M12 16h.01" />
        </g>
      ),
      users: (
        <g>
          <circle cx="9" cy="9" r="3" />
          <path d="M3 20c1-3 3-4 6-4s5 1 6 4" />
          <path d="M16 7a3 3 0 1 1 0 6M18 16c1 1 1.5 2 2 4" />
        </g>
      ),
      request: (
        <g>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </g>
      ),
      club: (
        <g>
          <path d="M12 21c-4-2-7-6-7-10V6l7-3 7 3v5c0 4-3 8-7 10z" />
          <path d="M12 8v6M9 11h6" />
        </g>
      ),
    };
    return svg(icons[name] || null);
  };

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
        {(ROLE_MENUS[role] || ROLE_MENUS.ETUDIANT).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end !== false}
            className={linkCls}
          >
            {iconFor(item.icon)}
            <span>{item.label}</span>
            {item.badge === 'unread' && nbUnread > 0 && (
              <span className="sidebar-badge">{nbUnread}</span>
            )}
          </NavLink>
        ))}
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
