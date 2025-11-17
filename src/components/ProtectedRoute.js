import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // 1. Kiểm tra xem người dùng đã đăng nhập chưa
  const token = localStorage.getItem('token');

  if (!token) {
    // 2. Nếu CHƯA, "đá" (redirect) họ về trang /login
    // 'replace' nghĩa là người dùng không thể nhấn nút "back" để quay lại
    return <Navigate to="/login" replace />;
  }

  // 3. Nếu RỒI, cho phép họ xem nội dung (trang game, trang admin...)
  // <Outlet /> sẽ đại diện cho bất cứ thứ gì bạn bọc bên trong
  return <Outlet />;
};

export default ProtectedRoute;
