import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EthicalAgreementPage from './pages/EthicalAgreementPage.jsx';
import ScannerPage from './pages/ScannerPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import EducationPage from './pages/EducationPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/ethical-agreement"
      element={
        <ProtectedRoute>
          <Layout>
            <EthicalAgreementPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/scanner"
      element={
        <ProtectedRoute>
          <Layout>
            <ScannerPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/history"
      element={
        <ProtectedRoute>
          <Layout>
            <HistoryPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/education"
      element={
        <ProtectedRoute>
          <Layout>
            <EducationPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <Layout>
            <AdminDashboardPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;

