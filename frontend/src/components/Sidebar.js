import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Sidebar() {
  const { currentUser, isAdmin, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-eyebrow">Plateforme DevOps</span>
        <span className="sidebar-title">Guichet</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          Tableau de bord
        </NavLink>
        <NavLink to="/reservations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          Mes réservations
        </NavLink>
        <NavLink to="/ressources" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          Ressources
        </NavLink>
        <NavLink to="/profil" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          Mon profil
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            Administration
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <strong>{currentUser?.username}</strong>
          <span className="role-tag">{currentUser?.role}</span>
        </div>
        <button className="btn btn-ghost btn-block" onClick={logout} type="button">
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}