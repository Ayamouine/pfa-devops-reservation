import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LOGO = 'https://www.fsts.ac.ma/images/fsts_logo.png';
const HERO_PHOTO = 'https://www.fsts.ac.ma/images/fst_hero_img.jpg';
const PRESENTATION_PHOTO =
  'https://www.fsts.ac.ma/storage/presentation-faculte/hero/Jx9BaRnIzDgYre0nrRJHOsPLxVFzpyWHrnEOwpXH.jpg';

const GALERIE = [
  'https://www.fsts.ac.ma/storage/presentation-faculte/images/EqURqXxI6dPW55enAAwjuA6fvUIOvnJueiRmD8Ue.jpg',
  'https://www.fsts.ac.ma/storage/presentation-faculte/images/t6NsBFSTW5xhgxDYATALrQ1Qh3VmdvDDb1qel5A0.jpg',
  'https://www.fsts.ac.ma/storage/presentation-faculte/images/q8dLCUIRCn0ocYBNOteeKhGXy9wWg0buvH2xKrVi.jpg',
  'https://www.fsts.ac.ma/storage/presentation-faculte/images/zI0qLTDOcE01wCf5uzj2ctnF6eIQlPdCbPHaUmDs.jpg',
  'https://www.fsts.ac.ma/storage/presentation-faculte/images/fCfLr8OIM3NOcGNoZjofALUbU3Me7rEJweuJeV0c.jpg',
  'https://www.fsts.ac.ma/storage/presentation-faculte/images/ml2OqHsZiuhT4f3iHBvw2vOfZe1WTnSXbnt61qDM.jpg',
];

const ACTUALITES = [
  {
    date: '17 sept. 2026',
    tag: 'Soutenances',
    title: 'Avis de Soutenance de Doctorat',
    text: 'Madame OUBELKAS Farah soutiendra sa thèse de Doctorat intitulée « Self supervised learning for multimedia data analysis ».',
    link: 'https://www.fsts.ac.ma/actualites/avis-de-soutenance-de-doctorat-4',
  },
  {
    date: '16 sept. 2026',
    tag: 'Actualité',
    title: 'Début de la rentrée universitaire 2026/2027',
    text: 'Le début des cours a lieu le Lundi 21 Septembre 2026. Consultez les emplois du temps en ligne avant la reprise.',
    link: 'https://www.fsts.ac.ma/actualites/debut-de-la-rentree-universitaire-20262027-emplois-du-temps',
  },
  {
    date: '14 sept. 2026',
    tag: 'Actualité',
    title: 'Accès Via Passerelles au 5ème semestre des Licences',
    text: 'La FSTS lance un appel à candidature pour l’inscription en S5 des Licences en Sciences et Techniques.',
    link: 'https://www.fsts.ac.ma/actualites/acces-via-passerelles-au-5eme-semestre-des-licences-en-sciences-et-techniques',
  },
  {
    date: '11 sept. 2026',
    tag: 'Concours',
    title: 'Résultats du concours d’accès au Master en Sciences et Techniques',
    text: 'Consultez la liste des candidats admis au concours d’accès au MST MTE et les modalités d’inscription.',
    link: 'https://www.fsts.ac.ma/actualites/annonce-resultats-du-concours-dacces-au-master-en-sciences-et-techniques',
  },
  {
    date: '9 sept. 2026',
    tag: 'Inscription',
    title: 'Inscription des bacheliers admis à la FST — 2ème Itération',
    text: 'Les étudiants admis à s’inscrire à la FST sont invités à se présenter les 10-11 Septembre 2026 de 09h30 à 16h00.',
    link: 'https://www.fsts.ac.ma/actualites/important-inscription-des-bacheliers-admis-a-la-fst-de-settat-2eme-iteration',
  },
  {
    date: '4 sept. 2026',
    tag: 'Concours',
    title: 'Résultats de présélection du concours d’accès au Master MTE',
    text: 'Liste des candidats présélectionnés pour le concours écrit du 08 Septembre 2026 à 10H00, dossier à préparer.',
    link: 'https://www.fsts.ac.ma/actualites/important-resultats-de-preselection-pour-passer-le-concours-ecrit-dacces-au-master-en-sciences-et-techniques-mathematiques-et-technologies-emergentes-date-du-concours-mardi-08-septembre-2026-a-10h00',
  },
];

const FORMATIONS = [
  {
    title: 'Tronc commun',
    text: 'Une base solide en sciences fondamentales pour réussir sa poursuite d’études.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    title: 'Licence (LST)',
    text: 'Licences en Sciences et Techniques alliant théorie et pratique professionnalisante.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 10L12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
      </svg>
    ),
  },
  {
    title: 'Master (MST)',
    text: 'Masters en Sciences et Techniques pour une spécialisation avancée et la recherche.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Cycle Ingénieur',
    text: 'Cycle d’ingénieur d’État orienté vers l’innovation et l’opérationnel.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
      </svg>
    ),
  },
];

const DOMAINES = [
  'Informatique',
  'Génie mécanique',
  'Électronique',
  'Chimie',
  'Biologie',
  'Environnement',
  'Sciences des matériaux',
];

const ATOUTS = [
  {
    title: 'Corps professoral qualifié',
    text: 'Des enseignants-chercheurs engagés et reconnus dans leurs disciplines.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
  },
  {
    title: 'Formation savoir & savoir-faire',
    text: 'Une pédagogie alliant savoir, savoir-faire et savoir-être.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Environnement moderne',
    text: 'Des laboratoires spécialisés et un environnement pédagogique moderne.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 2v7.5L4.5 21a2 2 0 0 0 1.8 2.9h11.4a2 2 0 0 0 1.8-2.9L14 9.5V2" />
        <path d="M8 2h8M7 15h10" />
      </svg>
    ),
  },
  {
    title: 'Insertion professionnelle',
    text: 'Une bonne insertion des diplômés dans le tissu économique régional et national.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const { currentUser } = useAuth();

  return (
    <div className="public-home">
      <div className="site-topbar">
        <div className="site-topbar-inner">
          <div>Université Hassan 1er — Rue d’Établissement Public</div>
          <div>
            +212 523 40 12 00 ·{' '}
            <a href="mailto:contact_fsts@uhp.ac.ma">contact_fsts@uhp.ac.ma</a>
          </div>
        </div>
      </div>

      <nav className="site-nav">
        <div className="site-nav-inner">
          <div className="site-nav-logo">
            <img src={LOGO} alt="Logo FSTS" />
            <div className="site-nav-title">
              <b>FST Settat</b>
              <span>Université Hassan 1er</span>
            </div>
          </div>
          <div className="site-nav-links">
            <a href="#accueil">Accueil</a>
            <a href="#faculte">La Faculté</a>
            <a href="#formations">Formations</a>
            <a href="#actualites">Actualités</a>
            <a href="#galerie">Galerie</a>
            <a href="#contact">Contact</a>
          </div>
          {!currentUser ? (
            <div className="hero-cta">
              <Link className="btn btn-outline" to="/login">
                Connexion
              </Link>
              <Link className="btn btn-accent" to="/register">
                S’inscrire
              </Link>
            </div>
          ) : (
            <Link className="btn btn-accent" to="/app">
              Tableau de bord
            </Link>
          )}
        </div>
      </nav>

      <header className="hero-section" id="accueil">
        <div className="hero-copy">
          <div className="hero-eyebrow">Université Hassan 1er · FST Settat</div>
          <h1 className="hero-title">
            L’Excellence <em>Scientifique</em> au Service du Progrès
          </h1>
          <p className="hero-text">
            La Faculté des Sciences et Techniques de Settat forme les ingénieurs et chercheurs de
            demain dans un environnement académique d’excellence, au cœur du Maroc industriel.
            Créée en 1994, elle est rattachée au réseau national des Facultés des Sciences et
            Techniques.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to={currentUser ? '/app' : '/register'}>
              Accéder à la plateforme de réservation
            </Link>
            <a className="btn btn-ghost" href="#actualites">
              Voir les actualités
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo">
            <img src={HERO_PHOTO} alt="Vue du campus de la FST Settat" />
          </div>
          <div className="hero-badge">
            <div>
              <div className="nb">1994</div>
              <div className="nb-label">Année de création</div>
            </div>
          </div>
        </div>
      </header>

      <section className="site-section" id="faculte">
        <div className="site-section-header">
          <div className="eyebrow">La Faculté</div>
          <h2 className="site-section-title">Présentation de l’établissement</h2>
          <div className="gold-bar" />
        </div>
        <div className="faculte-grid">
          <img className="faculte-photo" src={PRESENTATION_PHOTO} alt="La FST Settat" />
          <div>
            <p className="hero-text" style={{ maxWidth: 'none' }}>
              La Faculté des Sciences et Techniques de Settat (FSTS) est un établissement public
              d’enseignement supérieur relevant de l’Université Hassan 1er. Créée en 1994, elle
              fait partie du réseau national des Facultés des Sciences et Techniques, spécialisées
              dans la formation scientifique, technologique et l’ingénierie. Située dans une région
              stratégique reliant Casablanca, Settat et Berrechid, la FSTS contribue activement au
              développement socio-économique en formant des cadres et des ingénieurs hautement
              qualifiés.
            </p>
            <div className="domaines-row">
              {DOMAINES.map((d) => (
                <span key={d} className="domaine-chip">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-section" id="chiffres">
        <div className="site-section-header">
          <div className="eyebrow">La FSTS en chiffres</div>
          <h2 className="site-section-title">Un pôle d’excellence</h2>
          <div className="gold-bar" />
        </div>
        <div className="chiffres-row">
          <div className="chiffre">
            <div className="num">1994</div>
            <div className="lbl">Année de création</div>
          </div>
          <div className="chiffre">
            <div className="num">4</div>
            <div className="lbl">Cycles de formation</div>
          </div>
          <div className="chiffre">
            <div className="num">7</div>
            <div className="lbl">Domaines couverts</div>
          </div>
          <div className="chiffre">
            <div className="num">1</div>
            <div className="lbl">Université Hassan 1er</div>
          </div>
        </div>
      </section>

      <section className="site-section" id="formations">
        <div className="site-section-header">
          <div className="eyebrow">Formation initiale</div>
          <h2 className="site-section-title">Choisissez votre parcours</h2>
          <div className="gold-bar" />
        </div>
        <div className="news-grid">
          {FORMATIONS.map((f) => (
            <div className="formation-card" key={f.title}>
              {f.icon}
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-section alt" id="atouts">
        <div className="site-section-header">
          <div className="eyebrow">Nos atouts</div>
          <h2 className="site-section-title">Pourquoi choisir la FSTS ?</h2>
          <div className="gold-bar" />
        </div>
        <div className="news-grid">
          {ATOUTS.map((a) => (
            <div className="formation-card" key={a.title}>
              {a.icon}
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-section" id="actualites">
        <div className="site-section-header">
          <div className="eyebrow">Restez informés</div>
          <h2 className="site-section-title">Actualités récentes</h2>
          <div className="gold-bar" />
        </div>
        <div className="news-grid">
          {ACTUALITES.map((a) => (
            <article className="news-card" key={a.title}>
              <img src={HERO_PHOTO} alt="" />
              <div className="news-card-date">
                {a.tag} · {a.date}
              </div>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <a
                className="news-card-link"
                href={a.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Lire la suite →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section alt" id="galerie">
        <div className="site-section-header">
          <div className="eyebrow">Galerie</div>
          <h2 className="site-section-title">Le campus en images</h2>
          <div className="gold-bar" />
        </div>
        <div className="photos-grid">
          {GALERIE.map((src) => (
            <a href={src} target="_blank" rel="noopener noreferrer" key={src}>
              <img src={src} alt="Photo de la FST Settat" />
            </a>
          ))}
        </div>
      </section>

      <section className="site-section" id="contact">
        <div className="site-section-header">
          <div className="eyebrow">Nous contacter</div>
          <h2 className="site-section-title">Informations pratiques</h2>
          <div className="gold-bar" />
        </div>
        <div className="contact-grid">
          <div className="contact-item">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div>
              <b>Adresse</b>
              <p>Avenue de l’Université, Km 3, Route de Casablanca, Settat 26000, Maroc</p>
            </div>
          </div>
          <div className="contact-item">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <div>
              <b>Téléphone</b>
              <p>+212 523 40 12 00 · +212 523 40 12 01</p>
            </div>
          </div>
          <div className="contact-item">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 6L2 7" />
            </svg>
            <div>
              <b>Email</b>
              <p>
                <a href="mailto:contact_fsts@uhp.ac.ma">contact_fsts@uhp.ac.ma</a>
              </p>
            </div>
          </div>
          <div className="contact-item">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <div>
              <b>Horaires</b>
              <p>Lundi – Vendredi · 08h30 – 16h30</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <h4>FST Settat</h4>
            <p style={{ fontSize: '0.88rem', maxWidth: 340 }}>
              Établissement public d’enseignement supérieur scientifique et technique, rattaché à
              l’Université Hassan 1er de Settat. Pôle d’excellence au service du développement
              national.
            </p>
          </div>
          <div>
            <h4>Navigation</h4>
            <a href="#accueil">Accueil</a>
            <a href="#faculte">La Faculté</a>
            <a href="#formations">Formations</a>
            <a href="#actualites">Actualités</a>
            <a href="#contact">Contact</a>
          </div>
          <div>
            <h4>Liens utiles</h4>
            <a href="https://www.uh1.ac.ma/" target="_blank" rel="noopener noreferrer">
              Université Hassan 1er
            </a>
            <a href="https://www.enssup.gov.ma/" target="_blank" rel="noopener noreferrer">
              Ministère de l’Enseignement Supérieur
            </a>
            <a href="https://www.cnrst.ma/" target="_blank" rel="noopener noreferrer">
              CNRST
            </a>
          </div>
        </div>
        <div className="site-footer-bottom">
          © 2026 Faculté des Sciences et Techniques Settat — Université Hassan 1er. Tous droits
          réservés.
        </div>
      </footer>
    </div>
  );
}