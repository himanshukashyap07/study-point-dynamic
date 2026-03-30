import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthProvider from '@/context/authProvider';
import { Analytics } from "@vercel/analytics/next"


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://studypoint.com'),
  title: {
    default: 'StudyPointcoaching — Your Learning Destination',
    template: '%s | StudyPoint',
  },
  description: 'Access premium study material, notes, PDFs and video lectures for BCOM, GovExam, School, and Job Exams.',
  applicationName: 'StudyPointCoaching',
  keywords: ['Study Material', 'BCOM Notes', 'GovExam Prep', 'School PDFs', 'Video Lectures', 'Exam Preparation'],
  authors: [{ name: 'StudyPoint Team' }],
  publisher: 'StudyPoint Edutech',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'StudyPointcoaching — Your Learning Destination',
    description: 'Access premium study material, notes, PDFs and video lectures for BCOM, GovExam, School, and Job Exams.',
    url: '/',
    siteName: 'StudyPoint',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'StudyPoint Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyPoint — Your Learning Destination',
    description: 'Access premium study material, notes, PDFs and video lectures for JEE, NEET, School, and Job Exams.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        <Analytics />
      </AuthProvider>
    </html>
  );
}
