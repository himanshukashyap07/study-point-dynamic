import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ navlink: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const navlink = resolvedParams.navlink;
  const formattedTitle = navlink.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return {
    title: `${formattedTitle} Study Material`,
    description: `Explore comprehensive study resources, notes, video lectures, and previous year papers for ${formattedTitle} at StudyPoint.`,
    alternates: {
      canonical: `/${navlink}`,
    },
    openGraph: {
      title: `${formattedTitle} Study Material — StudyPoint`,
      description: `Premium educational content tailored for ${formattedTitle}. Click to access PDFs, notes, and expert guidance.`,
      url: `/${navlink}`,
      type: 'website',
    }
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
