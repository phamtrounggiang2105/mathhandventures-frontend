import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  // 1. Kiểm tra xem người dùng đã đăng nhập chưa
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  // 2. Phân tích thông tin user (đã lưu lúc đăng nhập
  let user = null;
  if (userString) {
    user = JSON.parse(userString);
  }

  // 3. Kiểm tra
  if (!token || !user) {
    // Nếu không có token hoặc không có thông tin user -> Về trang Login
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    // Nếu có token, nhưng KHÔNG PHẢI admin ->  về trang chủ (webcam)
    return <Navigate to="/" replace />;
  }

  // 4. Nếu vừa có token VỪA là admin -> Cho phép vào
  return <Outlet />;
};

export default AdminRoute;
