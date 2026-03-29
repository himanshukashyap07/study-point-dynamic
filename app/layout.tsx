import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthProvider from '@/context/authProvider';

export const metadata: Metadata = {
  title: 'StudyPoint — Your Learning Destination',
  description: 'Access study material, notes, PDFs and video links for JEE, School, Job Exams and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AuthProvider>
        <body>
          <Navbar />
          <main className="main-content">{children}</main>
          <Footer />
        </body>
      </AuthProvider>
    </html>
  );
}
