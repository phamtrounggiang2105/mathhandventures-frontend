import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
// Đảm bảo file lobby_background.png nằm trong thư mục src/assets/
import LobbyBackground from '../assets/lobby_background.png';

function HomePage() {
  const navigate = useNavigate();

  // Danh sách 3 ứng dụng chính với đường dẫn ảnh từ thư mục public/images
  const gameButtons = [
    { 
      title: 'Học toán', 
      path: '/practice', 
      img: '/images/Module_hoctap.png' 
    },
    { 
      title: 'Đếm số', 
      path: '/games/counting', 
      img: '/images/module_game.png' 
    },
    { 
      title: 'Tìm kho báu', 
      path: '/games/jacksparrow', 
      img: '/images/game_kho_bau.png' 
    }
  ];

  return (
    <div style={{
      backgroundImage: `url(${LobbyBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', // Căn từ trên xuống
      overflow: 'hidden',
      paddingTop: '60px' 
    }}>
      {/* Đã xóa bỏ cụm từ MATHANDVENTURES ở đây */}

      {/* Container chứa 3 ứng dụng */}
      <div style={{ 
        display: 'flex', 
        gap: '60px', // Tăng khoảng cách giữa các ứng dụng một chút cho thoáng
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%',
        padding: '0 20px',
        marginTop: '250px'
      }}>
        {gameButtons.map((game, index) => (
          <button
            key={index}
            onClick={() => navigate(game.path)}
            style={{
              background: 'none', // Không có nền màu
              border: 'none',     // Không có viền
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
              outline: 'none',
              width: '260px' 
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* Ảnh đại diện cho ứng dụng - Lấy từ public/images */}
            <img 
              src={game.img} 
              alt={game.title}
              style={{
                width: '100%', 
                height: 'auto',
                marginBottom: '15px',
                borderRadius: '15px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))' // Hiệu ứng bóng đổ đậm hơn một chút
              }}
            />
            
            {/* Tên ứng dụng nằm bên dưới ảnh */}
            <div style={{ 
              textAlign: 'center',
              fontSize: '2.2em',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
              marginTop: '10px'
            }}>
              {game.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default HomePage;