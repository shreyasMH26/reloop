import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MarketplacePage from './pages/MarketplacePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CreateListingPage from './pages/CreateListingPage'
import MapDiscoveryPage from './pages/MapDiscoveryPage'
import SustainabilityPage from './pages/SustainabilityPage'
import ShowcasePage from './pages/ShowcasePage'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage'
import MyListingsPage from './pages/dashboard/MyListingsPage'
import RentalsPage from './pages/dashboard/RentalsPage'
import ExchangesPage from './pages/dashboard/ExchangesPage'
import RequestsPage from './pages/dashboard/RequestsPage'
import OrdersPage from './pages/dashboard/OrdersPage'
import WishlistPage from './pages/dashboard/WishlistPage'
import MessagesPage from './pages/dashboard/MessagesPage'
import ProfileSettingsPage from './pages/dashboard/ProfileSettingsPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<MarketplacePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/listings/:id" element={<ProductDetailPage />} />
      <Route path="/map" element={<MapDiscoveryPage />} />
      <Route path="/sustainability" element={<SustainabilityPage />} />
      <Route path="/showcase" element={<ShowcasePage />} />

      {/* Authentication */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route
        path="/sell"
        element={
          <ProtectedRoute>
            <CreateListingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings/new"
        element={
          <ProtectedRoute>
            <CreateListingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/listings"
        element={
          <ProtectedRoute>
            <MyListingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/requests"
        element={
          <ProtectedRoute>
            <RequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/rentals"
        element={
          <ProtectedRoute>
            <RentalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/exchanges"
        element={
          <ProtectedRoute>
            <ExchangesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/wishlist"
        element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <ProfileSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
