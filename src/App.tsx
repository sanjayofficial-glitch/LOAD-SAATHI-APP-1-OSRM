"use client";

import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Skeleton } from "./components/ui/skeleton";
import Layout from "./components/Layout";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { ThemeProvider, useTheme } from "@/theme/theme";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AuthSync = lazy(() => import("./components/AuthSync"));
const ChooseRole = lazy(() => import("./pages/ChooseRole"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const PublicLayout = lazy(() => import("./components/PublicLayout"));
const Features = lazy(() => import("./pages/public/Features"));
const HowItWorks = lazy(() => import("./pages/public/HowItWorks"));
const About = lazy(() => import("./pages/public/About"));
const Pricing = lazy(() => import("./pages/public/Pricing"));
const Faq = lazy(() => import("./pages/public/FAQ"));
const Contact = lazy(() => import("./pages/public/Contact"));
const SafetyTrust = lazy(() => import("./pages/public/SafetyTrust"));
const Privacy = lazy(() => import("./pages/public/Privacy"));
const Terms = lazy(() => import("./pages/public/Terms"));
const ShipperSolution = lazy(() => import("./pages/public/ShipperSolution"));
const TruckerSolution = lazy(() => import("./pages/public/TruckerSolution"));
const DashboardPreview = lazy(() => import("./pages/screens/DashboardPreview"));
const MatchingPreview = lazy(() => import("./pages/screens/MatchingPreview"));
const ChatPreview = lazy(() => import("./pages/screens/ChatPreview"));
const CreditScorePreview = lazy(() => import("./pages/screens/CreditScorePreview"));
const ReviewsPreview = lazy(() => import("./pages/screens/ReviewsPreview"));
const AdminPreview = lazy(() => import("./pages/screens/AdminPreview"));
const BlogList = lazy(() => import("./pages/blog/BlogList"));
const BlogArticle = lazy(() => import("./pages/blog/BlogArticle"));
const TruckerDashboard = lazy(() => import("./pages/trucker/Dashboard"));
const PostTrip = lazy(() => import("./pages/trucker/PostTrip"));
const TruckerHub = lazy(() => import("./pages/trucker/TruckerHub"));
const EditTrip = lazy(() => import("./pages/trucker/EditTrip"));
const TruckerTripDetail = lazy(() => import("./pages/trucker/TruckerTripDetail"));
const BrowseShipments = lazy(() => import("./pages/trucker/BrowseShipments"));
const BrowseTrips = lazy(() => import("./pages/shipper/BrowseTrips"));
const TruckerHistory = lazy(() => import("./pages/trucker/TruckerHistory"));
const ShipperDashboard = lazy(() => import("./pages/shipper/Dashboard"));
const PostShipments = lazy(() => import("./pages/shipper/PostShipments"));
const MyShipments = lazy(() => import("./pages/shipper/MyShipments"));
const ShipmentDetail = lazy(() => import("./pages/shipper/ShipmentDetail"));
const EditShipment = lazy(() => import("./pages/shipper/EditShipment"));
const ShipperHistory = lazy(() => import("./pages/shipper/ShipperHistory"));
const TripDetail = lazy(() => import("./pages/TripDetail"));
const Chat = lazy(() => import("./pages/Chat"));
const ChatList = lazy(() => import("./pages/ChatList"));
const Profile = lazy(() => import("./pages/Profile"));
const MonitoringDashboard = lazy(() => import("./pages/admin/MonitoringDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const Moderation = lazy(() => import("./pages/admin/Moderation"));
const CreditScore = lazy(() => import("./pages/CreditScore"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ThemedToaster() {
  const { isDark } = useTheme();
  return <Toaster position="top-center" richColors theme={isDark ? 'dark' : 'light'} key={String(isDark)} />;
}

function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg text-center max-w-md">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Configuration Error</h1>
          <p className="text-gray-600 dark:text-gray-400">Clerk Publishable Key is missing. Please check your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<Skeleton className="h-screen w-full" />}>
                <Routes>
                  {/* Public routes with individual error boundaries */}
                  <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
                  <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
                  <Route path="/register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
                  <Route path="/auth-sync" element={<ErrorBoundary><AuthSync /></ErrorBoundary>} />
                  <Route path="/choose-role" element={<ErrorBoundary><ChooseRole /></ErrorBoundary>} />
                  <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />

                  {/* Public info pages wrapped in PublicLayout */}
                  <Route element={<PublicLayout><Outlet /></PublicLayout>}>
                    <Route path="/features" element={<Features />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/faq" element={<Faq />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/safety-trust" element={<SafetyTrust />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/solutions/shippers" element={<ShipperSolution />} />
                    <Route path="/solutions/truckers" element={<TruckerSolution />} />

                    {/* App Screen Previews */}
                    <Route path="/screens/dashboard" element={<DashboardPreview />} />
                    <Route path="/screens/matching" element={<MatchingPreview />} />
                    <Route path="/screens/chat" element={<ChatPreview />} />
                    <Route path="/screens/credit-score" element={<CreditScorePreview />} />
                    <Route path="/screens/reviews" element={<ReviewsPreview />} />
                    <Route path="/screens/admin" element={<AdminPreview />} />

                    {/* Blog */}
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/:slug" element={<BlogArticle />} />
                  </Route>

                  {/* Authenticated routes wrapped with Layout */}
                  <Route
                    element={
                      <Layout>
                        <RoleProtectedRoute allowedRole="both">
                          <Outlet />
                        </RoleProtectedRoute>
                      </Layout>
                    }
                  >
                    {/* Admin routes */}
                    <Route path="/admin/monitoring" element={
                      <RoleProtectedRoute allowedRole="admin">
                        <MonitoringDashboard />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                      <RoleProtectedRoute allowedRole="admin">
                        <AdminDashboard />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                      <RoleProtectedRoute allowedRole="admin">
                        <UserManagement />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/admin/moderation" element={
                      <RoleProtectedRoute allowedRole="admin">
                        <Moderation />
                      </RoleProtectedRoute>
                    } />
                    {/* Trucker routes */}
                    <Route path="/trucker/dashboard" element={
                      <RoleProtectedRoute allowedRole="trucker">
                        <TruckerDashboard />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/trucker/post-trip" element={
                      <RoleProtectedRoute allowedRole="trucker">
                        <PostTrip />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/trucker/my-trips" element={
                      <RoleProtectedRoute allowedRole="trucker">
                        <TruckerHub />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/trucker/trips/:tripId/edit" element={
                      <RoleProtectedRoute allowedRole="trucker">
                        <EditTrip />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/trucker/trips/:tripId" element={
                      <RoleProtectedRoute allowedRole="trucker">
                        <TruckerTripDetail />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/trucker/history" element={
                      <RoleProtectedRoute allowedRole="trucker">
                        <TruckerHistory />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/trucker/browse-shipments" element={
                      <RoleProtectedRoute allowedRole="trucker">
                        <BrowseShipments />
                      </RoleProtectedRoute>
                    } />

                    {/* Shipper routes */}
                    <Route path="/shipper/dashboard" element={
                      <RoleProtectedRoute allowedRole="shipper">
                        <ShipperDashboard />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/shipper/post-shipment" element={
                      <RoleProtectedRoute allowedRole="shipper">
                        <PostShipments />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/shipper/my-shipments" element={
                      <RoleProtectedRoute allowedRole="shipper">
                        <MyShipments />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/shipper/shipments/:id" element={<RoleProtectedRoute allowedRole="shipper"><ShipmentDetail /></RoleProtectedRoute>} />
                    <Route path="/shipper/shipments/:shipmentId/edit" element={
                      <RoleProtectedRoute allowedRole="shipper">
                        <EditShipment />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/shipper/history" element={
                      <RoleProtectedRoute allowedRole="shipper">
                        <ShipperHistory />
                      </RoleProtectedRoute>
                    } />
                    <Route path="/browse-trucks" element={
                      <RoleProtectedRoute allowedRole="both">
                        <BrowseTrips />
                      </RoleProtectedRoute>
                    } />

                    {/* Common authenticated routes */}
                    <Route path="/trips/:tripId" element={<TripDetail />} />
                    <Route path="/chat/:requestId" element={<Chat />} />
                    <Route path="/messages" element={<ChatList />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/credit-score" element={<CreditScore />} />

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
            <ThemedToaster />
          </AuthProvider>
        </ThemeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;