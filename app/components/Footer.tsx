'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '3rem',
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
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Study Materials</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link href="/jee-main">JEE Main Resources</Link></li>
              <li><Link href="/jee-advanced">JEE Advanced</Link></li>
              <li><Link href="/neet">NEET Preparation</Link></li>
              <li><Link href="/cbse-boards">CBSE Board Exam</Link></li>
              <li><Link href="/foundation-courses">Foundation Courses</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Support</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div className="footer__col">
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Get in Touch</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>
              Questions? Reach out to our academic counselors for guidance.
            </p>
            <div className="footer__social" style={{ display: 'flex', gap: '1rem' }}>
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
