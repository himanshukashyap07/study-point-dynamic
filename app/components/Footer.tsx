'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Footer() {
  const pathname = usePathname();
  const [navLinks, setNavLinks] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/navlinks')
      .then((r) => r.json())
      .then((d) => setNavLinks(d.data || []))
      .catch(() => { });
  }, []);

  if (pathname?.startsWith('/admin')) return null;
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          <div className="footer__col">
            <div className="footer__brand" style={{ 
              color: 'var(--white)',
              fontSize: '1.75rem',
              fontWeight: 800,
              marginBottom: '1.25rem',
              display: 'inline-block'
            }}>
              Study<span style={{ opacity: 0.7, fontWeight: 400 }}>Point</span>
            </div>
            <p className="footer__desc" style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--gray-400)' }}>
              Empowering students with premium educational resources for JEE, NEET, and Board Exams. 
              Quality learning simplified for the next generation of achievers.
            </p>
          </div>
          
          <div className="footer__col">
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Sitemap Navigation</h4>
            <ul className="footer__sitemap-grid" style={{ 
              listStyle: 'none', 
              padding: 0, 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
              gap: '0.75rem 1.5rem', 
              fontSize: '0.9rem' 
            }}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              {navLinks.map((nl: any) => (
                <li key={nl._id}><Link href={`/${nl.slug}`}>{nl.label}</Link></li>
              ))}
              <li><Link href="/contact">Support</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link href="/privacy-policy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
            </ul>
          </div>
          
          <div className="footer__col" style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Get in Touch</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-400)', marginBottom: '1rem', maxWidth: '300px' }}>
              Questions? Reach out to our academic counselors for guidance.
            </p>
            <div className="footer__social" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#" className="social-footer-link">Twitter</a>
              <a href="#" className="social-footer-link">YouTube</a>
              <a href="#" className="social-footer-link">LinkedIn</a>
            </div>
          </div>
        </div>
        
        <div className="footer__bottom" style={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          paddingTop: '2rem', 
          textAlign: 'center', 
          fontSize: '0.85rem', 
          color: 'var(--gray-500)' 
        }}>
          <p>&copy; {new Date().getFullYear()} StudyPoint Edutech. All rights reserved. Designed for Excellence.</p>
        </div>
      </div>
    </footer>
  );
}
