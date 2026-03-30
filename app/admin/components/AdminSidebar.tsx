'use client';

import Link from 'next/link';
import { useState } from 'react';

interface SubLink { _id: string; slug: string; label: string; }
interface MidLink { _id: string; slug: string; label: string; subLinks: SubLink[]; }
interface NavLink { _id: string; slug: string; label: string; midLinks: MidLink[]; }

interface Props {
  navLinks: NavLink[];
  selected: string;
  onSelect: (key: string) => void;
}

const STATIC_PAGES = ['home', 'about', 'contact', 'privacy-policy', 'terms'];

export default function AdminSidebar({ navLinks, selected, onSelect }: Props) {
  const [expandedNav, setExpandedNav] = useState<Record<string, boolean>>({});
  const [expandedMid, setExpandedMid] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleNav = (id: string) => setExpandedNav((p) => ({ ...p, [id]: !p[id] }));
  const toggleMid = (id: string) => setExpandedMid((p) => ({ ...p, [id]: !p[id] }));

  const handleSelect = (key: string) => {
    onSelect(key);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle Sidebar"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      {mobileOpen && <div className="admin-sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`admin-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        {/* Header */}
        <div className="admin-sidebar__header">
          <img src="/logo.png" alt="logo" className="site-logo" />
        </div>

        {/* Quick links */}
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" style={{ fontSize: '0.8rem', color: 'var(--blue-300)' }}>← View Site</Link>
        </div>

        {/* Manage NavLinks */}
        <button
          className={`admin-sidebar__item${selected === '__navlinks__' ? ' active' : ''}`}
          onClick={() => handleSelect('__navlinks__')}
          style={{ fontWeight: 700 }}
        >
          🔗 Manage Navigation
        </button>

        {/* Static pages */}
        <div className="admin-sidebar__section">Static Pages</div>
        {STATIC_PAGES.map((slug) => (
          <button
            key={slug}
            className={`admin-sidebar__item${selected === slug ? ' active' : ''}`}
            onClick={() => handleSelect(slug)}
          >
            {slug === 'home' ? '🏠' : slug === 'about' ? '👤' : slug === 'contact' ? '📧' : '📄'}{' '}
            {slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}

        {/* Dynamic nav link tree */}
        {navLinks.length > 0 && (
          <>
            <div className="admin-sidebar__section">Nav Link Content</div>
            {navLinks.map((nl) => (
              <div key={nl._id}>
                <button
                  className={`admin-sidebar__item${selected === `nav:${nl._id}` ? ' active' : ''}`}
                  onClick={() => { handleSelect(`nav:${nl._id}`); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span onClick={() => handleSelect(`nav:${nl._id}`)}>{nl.label}</span>
                  <span
                    style={{ fontSize: '0.7rem', marginLeft: 'auto', paddingLeft: '0.5rem' }}
                    onClick={(e) => { e.stopPropagation(); toggleNav(nl._id); }}
                  >
                    {expandedNav[nl._id] ? '▲' : '▼'}
                  </span>
                </button>

                {expandedNav[nl._id] && nl.midLinks.map((ml) => (
                  <div key={ml._id}>
                    <button
                      className={`admin-sidebar__item admin-sidebar__item--mid${selected === `mid:${nl._id}:${ml._id}` ? ' active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onClick={() => handleSelect(`mid:${nl._id}:${ml._id}`)}
                    >
                      <span>{ml.label}</span>
                      <span
                        style={{ fontSize: '0.7rem', paddingLeft: '0.5rem' }}
                        onClick={(e) => { e.stopPropagation(); toggleMid(ml._id); }}
                      >
                        {expandedMid[ml._id] ? '▲' : '▼'}
                      </span>
                    </button>

                    {expandedMid[ml._id] && ml.subLinks.map((sl) => (
                      <button
                        key={sl._id}
                        className={`admin-sidebar__item admin-sidebar__item--sub${selected === `sub:${nl._id}:${ml._id}:${sl._id}` ? ' active' : ''}`}
                        onClick={() => handleSelect(`sub:${nl._id}:${ml._id}:${sl._id}`)}
                      >
                        └ {sl.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </aside>
    </>
  );
}
