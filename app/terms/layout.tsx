import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Review the rules, guidelines, and terms of service for using StudyPoint resources and educational platforms.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
