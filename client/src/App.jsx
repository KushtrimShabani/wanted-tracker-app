import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import WantedList from './pages/WantedList';
import WantedDetail from './pages/WantedDetail';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import AuthCheck from './components/AuthCheck';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <AuthCheck>
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <WantedList />
                </main>
              </AuthCheck>
            } />
            <Route path="/wanted/:id" element={
              <AuthCheck>
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <WantedDetail />
                </main>
              </AuthCheck>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toast />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;