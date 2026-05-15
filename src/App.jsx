import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const ADMIN_PAGES = new Set([
  'AdminHome',
  'Orders',
  'NewOrder',
  'OrderDetail',
  'Kitchen',
  'Customers',
  'Reports',
  'Stock',
  'Settings',
  'MenuManagement',
  'UserManagement',
  'DeliveryDashboard'
]);

const AccessDenied = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
      <ShieldAlert className="w-14 h-14 text-slate-400 mx-auto mb-4" />
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Acesso restrito</h1>
      <p className="text-slate-600 mb-6">Esta área exige permissão administrativa.</p>
      <div className="flex flex-col gap-2">
        <Button onClick={() => window.location.assign('/Login')} className="bg-slate-900">Fazer Login</Button>
        <Button variant="ghost" onClick={() => window.location.assign('/')}>Voltar ao início</Button>
      </div>
    </div>
  </div>
);

const RouteElement = ({ pageName, Page }) => {
  const { user, isAuthenticated } = useAuth();
  const requiresAdmin = ADMIN_PAGES.has(pageName);
  
  if (requiresAdmin && !isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  if (requiresAdmin && !user) {
    return <AccessDenied />;
  }

  // Se a rota for o painel de entrega, permite admin ou delivery
  if (pageName === 'DeliveryDashboard') {
    if (user?.role !== 'admin' && user?.role !== 'delivery') {
      return <AccessDenied />;
    }
  // Para todas as outras rotas administrativas, apenas admin
  } else if (requiresAdmin && user?.role !== 'admin') {
    return <AccessDenied />;
  }

  return (
    <LayoutWrapper currentPageName={pageName}>
      <ErrorBoundary>
        <Page />
      </ErrorBoundary>
    </LayoutWrapper>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // App is public — just render normally without redirecting
      // navigateToLogin(); // removed: public app should not force login
    }
  }

  // Render the main app
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    }>
      <Routes>
        <Route path="/" element={
          <RouteElement pageName={mainPageKey} Page={MainPage} />
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={<RouteElement pageName={path} Page={Page} />}
          />
        ))}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
