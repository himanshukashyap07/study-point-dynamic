import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Support',
  description: 'Reach out to the StudyPoint team for guidance, academic support, and inquiry resolution.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
