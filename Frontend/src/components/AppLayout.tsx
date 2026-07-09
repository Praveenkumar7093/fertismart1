import AppHeader from "@/components/AppHeader";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => (
  <div className="min-h-screen gradient-hero">
    <AppHeader />
    {children}
  </div>
);

export default AppLayout;
