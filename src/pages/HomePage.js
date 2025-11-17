import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

// --- (KHÔNG IMPORT ẢNH TỪ ASSETS NỮA) ---
// Thay vào đó, chúng ta sẽ dùng đường dẫn trực tiếp từ public/images/

function HomePage() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  // --- (Style cho từng Module - Vẫn giữ nền trắng, bo tròn) ---
  const moduleStyle = {
    display: 'flex',
    flexDirection: 'column', 
    alignItems: 'center',
    margin: '20px',
    cursor: 'pointer',
    backgroundColor: 'white', 
    overflow: 'hidden',
    borderRadius: '20px', 
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
    transition: 'transform 0.2s, box-shadow 0.2s', 
  };

  // --- (Style cho ảnh - Chiếm gần hết chiều rộng của ô trắng) ---
  const imageStyle = {
    width: '250px', // Kích thước cố định cho ảnh
    height: '250px', 
    borderRadius: '0px', 
    objectFit: 'cover',
  };
  
  // --- (Style cho chữ - Đặt riêng bên ngoài ô module) ---
  const textStyle = {
    color: 'white', // Chữ màu trắng (vì nằm trên nền Rayman)
    fontSize: '2em',
    fontWeight: 'bold',
    marginTop: '10px', // Tạo khoảng cách với ô trắng
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' // Thêm bóng đổ cho dễ đọc
  };

  // Hiệu ứng hover (giữ nguyên)
  const moduleHoverStyle = (e) => {
    e.currentTarget.style.transform = 'scale(1.05)';
    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
  };

  const moduleLeaveStyle = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  };

  return (
    // Div này vẫn có ảnh nền Rayman (từ App.css)
    <div className="App"> 
      <header className="App-header">
        
       
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          marginTop: '200px' 
        }}>
          
          {/* --- Module 1: Học toán --- */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div 
              style={moduleStyle}
              onClick={() => handleNavigate('/practice')} 
              onMouseEnter={moduleHoverStyle}
              onMouseLeave={moduleLeaveStyle}
            >
              <img 
                src="/images/Module_hoctap.png" // <-- DÙNG ẢNH TỪ PUBLIC/IMAGES
                alt="Học toán"
                style={imageStyle}
              />
              {/* CHỮ KHÔNG CÒN Ở ĐÂY NỮA */}
            </div>
            <span style={textStyle}>Học toán</span> {/* <-- CHỮ ĐƯỢC ĐẨY XUỐNG DƯỚI */}
          </div>
          
          {/* --- Module 2: Game vui --- */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div 
              style={moduleStyle}
              onClick={() => handleNavigate('/games')}
              onMouseEnter={moduleHoverStyle}
              onMouseLeave={moduleLeaveStyle}
            >
              <img 
                src="/images/module_game.png" // <-- DÙNG ẢNH TỪ PUBLIC/IMAGES
                alt="Game vui"
                style={imageStyle}
              />
              {/* CHỮ KHÔNG CÒN Ở ĐÂY NỮA */}
            </div>
            <span style={textStyle}>Game vui</span> {/* <-- CHỮ ĐƯỢC ĐẨY XUỐNG DƯỚI */}
          </div>

        </div>
      </header>
    </div>
  );
}

export default HomePage;