import React from 'react';
import { useNavigate } from 'react-router-dom';
import HandInput from './HandInput';

function GameLayout({ children, onHandDetected }) {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate('/'); // Quay về Sảnh chờ
  };

  return (
    <div style={{
      backgroundColor: '#B3E5FC',
      color: '#282c34',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
    }}>
      
      {/* 1. Nút Thoát */}
      <button
        onClick={handleExit}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#ff4d4d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 15px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 201
        }}
      >
        Thoát
      </button>

      {/* 2. Webcam nhỏ */}
      <HandInput 
        isSmall={true}
        onHandDetected={onHandDetected}
      />

      {/* 3. Nội dung chính của Game (ở giữa) */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '60px', // <-- Khoảng đệm 60px
        boxSizing: 'border-box' // <-- Sửa lỗi layout "vỡ"
      }}>
        {children}
      </div>

    </div>
  );
}

export default GameLayout;
