import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about StudyPoint, our dedicated educators, and our mission to provide high-quality study materials for students worldwide.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
