import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import LobbyBackground from '../assets/lobby_background.png';

function HomePage() {
  const navigate = useNavigate();

  // Danh sách 3 ứng dụng chính với đường dẫn ảnh từ thư mục public/images
  const gameButtons = [
    { 
      title: 'Học toán', 
      path: '/practice', 
      color: '#4CAF50', 
      img: '/images/Module_hoctap.png' 
    },
    { 
      title: 'Đếm số', 
      path: '/games/counting', 
      color: '#2196F3', 
      img: '/images/module_game.png' 
    },
    { 
      title: 'Tìm kho báu', 
      path: '/games/jacksparrow', 
      color: '#FF9800', 
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
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <h1 style={{ 
        fontSize: '4em', 
        color: 'white', 
        textShadow: '4px 4px 8px rgba(0,0,0,0.7)', 
        marginBottom: '40px',
        fontFamily: 'Arial, sans-serif'
      }}>
        
      </h1>

      <div style={{ 
        display: 'flex', 
        gap: '30px', 
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%',
        padding: '0 20px'
      }}>
        {gameButtons.map((game, index) => (
          <button
            key={index}
            onClick={() => navigate(game.path)}
            style={{
              width: '240px', // Đã thu nhỏ (từ 280px)
              height: '320px', // Đã thu nhỏ (từ 350px)
              backgroundColor: game.color,
              color: 'white',
              border: '6px solid white',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1.8em',
              fontWeight: 'bold',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 20px rgba(0,0,0,0.4)',
              outline: 'none',
              padding: '10px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.4)';
            }}
          >
            {/* Hiển thị ảnh module thay cho icon */}
            <img 
              src={game.img} 
              alt={game.title}
              style={{
                width: '80%',
                height: 'auto',
                marginBottom: '15px',
                borderRadius: '10px',
                objectFit: 'contain'
              }}
              // Nếu ảnh bị lỗi đường dẫn, hiện icon mặc định
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            
            <div style={{ textAlign: 'center' }}>
              {game.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default HomePage;