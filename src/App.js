import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import PracticeModule from './pages/PracticeModule';
import GamesLobby from './pages/GamesLobby';
import CountingGame from './pages/CountingGame';
import JackSparrowGame from './pages/JackSparrowGame';

// Import các trang
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Các trang công khai (Public) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Các trang được bảo vệ (Protected) */}
        // --- Các trang được bảo vệ (Protected) ---
        <Route element={<ProtectedRoute />}>
           {/* Các trang CHUNG (Student + Admin đều vào được) */}
           <Route path="/" element={<HomePage />} />
           {/* (Thêm trang Profile, v.v. vào đây sau) */}
           <Route path="/profile" element={<ProfilePage />} />
           {/* CÁC TRANG MỚI CỦA GIAI ĐOẠN 4 */}
           <Route path="/practice" element={<PracticeModule />} />
           <Route path="/games" element={<GamesLobby />} />
           <Route path="/games/counting" element={<CountingGame />} />
           <Route path="/games/jacksparrow" element={<JackSparrowGame />} />
        </Route>

        {/* --- Các trang CHỈ ADMIN (Protected + Admin Role) --- */}
           <Route element={<AdminRoute />}>
           <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* Nếu gõ URL lạ, quay về trang chủ (nếu đã login) hoặc login (nếu chưa) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </Router>
  );
}

export default App;
