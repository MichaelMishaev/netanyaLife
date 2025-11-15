/**
 * Login page layout - bypasses the parent admin layout authentication
 * This prevents redirect loops when accessing the login page
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
