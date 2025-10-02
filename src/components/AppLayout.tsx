import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { SidebarTrigger } from './ui/sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-love-coral/20 p-4 lg:hidden">
          <SidebarTrigger />
        </header>
        {children}
      </main>
    </div>
  );
};
