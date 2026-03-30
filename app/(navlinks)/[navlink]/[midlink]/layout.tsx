import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ navlink: string; midlink: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const nav = resolvedParams.navlink.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const mid = resolvedParams.midlink.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${mid} | ${nav}`,
    description: `Access premium ${mid} topics and resources for ${nav} at StudyPoint. Download PDFs, notes, and expert guidance.`,
    alternates: {
      canonical: `/${resolvedParams.navlink}/${resolvedParams.midlink}`,
    },
    openGraph: {
      title: `${mid} Resources for ${nav} — StudyPoint`,
      description: `Complete study material covering ${mid} topics for ${nav}. Click to boost your exam scores.`,
      url: `/${resolvedParams.navlink}/${resolvedParams.midlink}`,
      type: 'article',
    }
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
