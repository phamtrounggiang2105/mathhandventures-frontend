import React, { useState } from 'react'; // Đảm bảo đã import useState
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook để lấy URL hiện tại
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Đây là tất cả các trang mà Navbar cần PHẢI ẨN
  const gamePaths = [
    '/practice',
    '/games',
    '/games/counting',
    '/games/jacksparrow'
  ];

  // Nếu đường dẫn hiện tại location.pathname nằm trong danh sách gamePaths
  if (gamePaths.includes(location.pathname)) {
    return null; //  thì không hiển thị gì cả (trả về rỗng)
  }

  // Lấy thông tin user từ Local Storage
  const userString = localStorage.getItem('user');
  let user = null;
  if (userString) {
    user = JSON.parse(userString);
  }

  const handleLogout = () => {
    // 1. Xóa vé
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 2. Chuyển về trang đăng nhập
    navigate('/login');
  };

  // Nếu không có user , không hiển thị gì cả
  if (!user) {
    return null;
  }

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#1e54d3ff',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-between', // Giữ 2 bên
      alignItems: 'center',
      boxSizing: 'border-box',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100
    }}>
      
      {/* 1. CÁC ĐƯỜNG LINK (BÊN TRÁI) */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: '#e7eeefff', textDecoration: 'none' }}>Trang chủ (Game)</Link>
        
        {/* Chỉ hiển thị link Admin nếu là admin */}
        {user.role === 'admin' && (
          <Link to="/admin" style={{ color: '#61dafb', textDecoration: 'none' }}>Trang Admin</Link>
        )}
        
        <Link to="/profile" style={{ color: '#61dafb', textDecoration: 'none' }}>Trang cá nhân</Link>

        {/* --- MỤC THÊM MỚI: Về chúng tôi (Giới thiệu tác giả) --- */}
        <Link 
          to="/about" 
          style={{ 
            color: '#FFD700', // Màu vàng nổi bật để giảng viên dễ chú ý
            textDecoration: 'none',
            fontWeight: 'bold' 
          }}
        >
          Về chúng tôi
        </Link>
      </div>
      
      {/* 2. AVATAR VÀ MENU (BÊN PHẢI) */}
      <div style={{ position: 'relative' }}>
        
        {/* Avatar (Nút bấm) */}
        <img
          src={`/avatars/${user.avatar}`}
          alt="Avatar"
          onClick={() => setIsMenuOpen(!isMenuOpen)} // Bật/tắt menu
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            border: '2px solid #61dafb'
          }}
        />
        
        {/* Menu Đăng xuất (Chỉ hiện khi isMenuOpen = true) */}
        {isMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '50px', 
            right: 0,
            backgroundColor: 'white',
            borderRadius: '5px',
            padding: '5px',
            boxShadow: '0px 2px 10px rgba(0,0,0,0.2)',
            zIndex: 101
          }}>
            <button 
              onClick={handleLogout}
              style={{ 
                backgroundColor: '#ff4d4dff', 
                border: 'none', 
                color: 'white', 
                borderRadius: '5px', 
                cursor: 'pointer',
                padding: '8px 12px',
                width: '100px'
              }}
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default Navbar;