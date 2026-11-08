import React from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';

// Public Components
import { TopUtilityBar } from './components/TopUtilityBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeatureCards } from './components/FeatureCards';
import { ServicesGrid } from './components/ServicesGrid';
import { AboutSection } from './components/AboutSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PreFooterCTA } from './components/PreFooterCTA';
import { Footer } from './components/Footer';
import { StickyMobileBar } from './components/StickyMobileBar';
import { AppointmentModal } from './components/AppointmentModal';

// Context Providers
import { BookingModalProvider } from './context/BookingModalContext';
import { AuthProvider } from './context/AuthContext';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminAppointments } from './components/admin/AdminAppointments';
import { AdminServices } from './components/admin/AdminServices';
import { AdminSettings } from './components/admin/AdminSettings';

/**
 * Root Route: wraps all pages in Providers, Global Modals, and Outlet
 */
const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <BookingModalProvider>
        <div className="min-h-screen flex flex-col bg-white">
          <Outlet />
          <AppointmentModal />
        </div>
      </BookingModalProvider>
    </AuthProvider>
  ),
});

/**
 * Public Landing Page View (matches reference layout)
 */
const PublicLandingPage: React.FC = () => {
  return (
    <>
      <TopUtilityBar />
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <HeroSection />
        <FeatureCards />
        <ServicesGrid />
        <AboutSection />
        <TestimonialsSection />
        <PreFooterCTA />
      </main>
      <Footer />
      <StickyMobileBar />
    </>
  );
};

// 1. Public Home Route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PublicLandingPage,
});

// 2. Admin Parent Route
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin',
  component: AdminLayout,
});

// 3. Admin Child Routes
const adminOverviewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: AdminOverview,
});

const adminAppointmentsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'appointments',
  component: AdminAppointments,
});

const adminServicesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'services',
  component: AdminServices,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'settings',
  component: AdminSettings,
});

// Build the Route Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRoute.addChildren([
    adminOverviewRoute,
    adminAppointmentsRoute,
    adminServicesRoute,
    adminSettingsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register router type for strict type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
