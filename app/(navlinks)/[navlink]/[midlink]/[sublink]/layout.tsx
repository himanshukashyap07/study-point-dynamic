import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ navlink: string; midlink: string; sublink: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const nav = resolvedParams.navlink.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const mid = resolvedParams.midlink.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const sub = resolvedParams.sublink.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${sub} - ${mid} | ${nav}`,
    description: `Detailed and comprehensive resources for ${sub} (${mid}) covered under ${nav}. Essential for strong preparation at StudyPoint.`,
    alternates: {
      canonical: `/${resolvedParams.navlink}/${resolvedParams.midlink}/${resolvedParams.sublink}`,
    },
    openGraph: {
      title: `${sub} study notes for ${mid} — StudyPoint`,
      description: `Complete ${sub} material covering precisely what you need for ${nav} mastery.`,
      url: `/${resolvedParams.navlink}/${resolvedParams.midlink}/${resolvedParams.sublink}`,
      type: 'article',
    }
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
