// Admin pages use their own minimal layout (no global Navbar/Footer)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
