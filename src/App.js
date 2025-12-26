import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

// --- 1. Import các Components điều hướng ---
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

// --- 2. Import các Trang (Pages) ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import PracticeModule from './pages/PracticeModule';
import GamesLobby from './pages/GamesLobby';
import CountingGame from './pages/CountingGame';
import JackSparrowGame from './pages/JackSparrowGame';
import AboutUs from './pages/AboutUs'; // Trang giới thiệu tác giả mới thêm vào

function App() {
  return (
    <Router>
      {/* Navbar sẽ luôn xuất hiện để điều hướng, trừ các trang game đã được ẩn trong logic của Navbar.js */}
      <Navbar />

      <Routes>
        {/* --- A. Các trang công khai (Public) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- B. Các trang được bảo vệ (Chỉ dành cho người dùng đã đăng nhập) --- */}
        <Route element={<ProtectedRoute />}>
          {/* Trang chủ sau khi đăng nhập */}
          <Route path="/" element={<HomePage />} />
          
          {/* Trang hồ sơ cá nhân của người chơi */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* TRANG MỚI: Giới thiệu tác giả (Giang & Bình) và Giảng viên hướng dẫn */}
          <Route path="/about" element={<AboutUs />} />

          {/* CÁC TRANG CHỨC NĂNG VÀ TRÒ CHƠI */}
          <Route path="/practice" element={<PracticeModule />} />
          <Route path="/games" element={<GamesLobby />} />
          <Route path="/games/counting" element={<CountingGame />} />
          <Route path="/games/jacksparrow" element={<JackSparrowGame />} />
        </Route>

        {/* --- C. Các trang chỉ dành riêng cho Quản trị viên (Admin) --- */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* --- D. Xử lý đường dẫn không hợp lệ --- */}
        {/* Nếu người dùng gõ URL lạ, hệ thống tự động quay về trang chủ */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;