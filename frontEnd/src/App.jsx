import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import UsersPage from './pages/UsersPage';
import StudentsPage from './pages/StudentsPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import './App.css';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Users', component: UsersPage },
    { path: '/students', label: 'Students', component: StudentsPage },
    { path: '/products', label: 'Products', component: ProductsPage },
    { path: '/categories', label: 'Categories', component: CategoriesPage }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-title">Management System</h1>
        <div className="nav-links">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UsersPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
