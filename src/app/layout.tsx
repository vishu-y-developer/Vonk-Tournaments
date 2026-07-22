import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { WalletProvider } from '@/providers/WalletProvider';
import { TournamentProvider } from '@/providers/TournamentProvider';
import { TeamProvider } from '@/providers/TeamProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { DisputeProvider } from '@/providers/DisputeProvider';
import { RegistrationProvider } from '@/providers/RegistrationProvider';
import { ResultProvider } from '@/providers/ResultProvider';
import { OrganizerProvider } from '@/providers/OrganizerProvider';
import { AdminProvider } from '@/providers/AdminProvider';
import { SupportProvider } from '@/providers/SupportProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import Navbar from '@/components/layout/Navbar';
import MobileHeader from '@/components/layout/MobileHeader';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';
import RoleSwitcher from '@/components/layout/RoleSwitcher';
import SkipToContent from '@/components/layout/SkipToContent';
import FirstRunOnboarding from '@/components/layout/FirstRunOnboarding';

export const metadata: Metadata = {
  title: 'VONK Tournaments — Compete. Conquer. Win.',
  description:
    'Discover and join competitive custom-room esports tournaments, manage teams, track results and climb the VONK rankings.',
  applicationName: 'VONK Tournaments',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VONK',
  },
};

export const viewport: Viewport = {
  themeColor: '#08080c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground select-none">
        <AuthProvider>
          <WalletProvider>
            <TournamentProvider>
              <TeamProvider>
                <NotificationProvider>
                  <DisputeProvider>
                    <RegistrationProvider>
                      <ResultProvider>
                        <OrganizerProvider>
                          <AdminProvider>
                            <SupportProvider>
                              <SettingsProvider>
                                <SkipToContent />
                                <FirstRunOnboarding />
                                {/* Navigation layout wrappers */}
                                <Navbar />
                                <MobileHeader />

                                {/* Main content viewport */}
                                <main id="main-content" className="flex-1 flex flex-col w-full mx-auto max-w-7xl px-0 md:px-6">
                                  {children}
                                </main>

                          {/* Mobile bottom navigation tab bar */}
                          <MobileNav />

                          {/* Footer */}
                          <Footer />

                          {/* Dev/Demo Tool Role Switcher */}
                          <RoleSwitcher />
                              </SettingsProvider>
                            </SupportProvider>
                          </AdminProvider>
                        </OrganizerProvider>
                      </ResultProvider>
                    </RegistrationProvider>
                  </DisputeProvider>
                </NotificationProvider>
              </TeamProvider>
            </TournamentProvider>
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
