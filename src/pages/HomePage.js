import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
// Đảm bảo file lobby_background.png nằm trong thư mục src/assets/
import LobbyBackground from '../assets/lobby_background.png';

function HomePage() {
  const navigate = useNavigate();

  // Danh sách 3 ứng dụng chính dàn hàng ngang
  const gameButtons = [
    { 
      title: 'Học toán', 
      path: '/practice', 
      color: '#4CAF50', 
      icon: '➕➖' 
    },
    { 
      title: 'Đếm số', 
      path: '/games/counting', 
      color: '#2196F3', 
      icon: '🍎🐶' 
    },
    { 
      title: 'Tìm kho báu', 
      path: '/games/jacksparrow', 
      color: '#FF9800', 
      icon: '🏴‍☠️' 
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
        fontSize: '4.5em', 
        color: 'white', 
        textShadow: '4px 4px 8px rgba(0,0,0,0.7)', 
        marginBottom: '60px',
        fontFamily: 'Arial, sans-serif'
      }}>
        MATHHANDVENTURES
      </h1>

      <div style={{ 
        display: 'flex', 
        gap: '40px', 
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
              width: '280px',
              height: '350px',
              backgroundColor: game.color,
              color: 'white',
              border: '8px solid white',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '2.2em',
              fontWeight: 'bold',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 15px 25px rgba(0,0,0,0.4)',
              outline: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 20px 35px rgba(0,0,0,0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 15px 25px rgba(0,0,0,0.4)';
            }}
          >
            <span style={{ 
              fontSize: '2.5em', 
              marginBottom: '20px',
              filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))'
            }}>
              {game.icon}
            </span>
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