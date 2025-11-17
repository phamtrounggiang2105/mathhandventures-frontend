import React from 'react';
import '../App.css'; 
import { useNavigate } from 'react-router-dom'; // Import navigate

function GamesLobby() {
  const navigate = useNavigate();
  
  return (
    // Thêm position: 'relative' để định vị nút
    <div className="App" style={{ position: 'relative' }}> 
      
      {/* --- NÚT "QUAY LẠI" (MÀU ĐỎ) --- */}
      <button
        onClick={() => navigate('/')} // Quay về Sảnh chờ chính (/)
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#ff4d4d', // Màu đỏ
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 15px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 10 
        }}
      >
        Quay lại
      </button>

      <header className="App-header">
        
        {/* Nút Game Đếm Số */}
        <button onClick={() => navigate('/games/counting')} style={{
          margin: '10px', 
          padding: '20px 40px', 
          fontSize: '1.2em',
          cursor: 'pointer'
        }}>
          Game Đếm Số
        </button>
        
        {/* Nút Game Jack Sparrow */}
        <button onClick={() => navigate('/games/jacksparrow')} style={{
          margin: '10px', 
          padding: '20px 40px', 
          fontSize: '1.2em',
          cursor: 'pointer'
        }}>
          Game truy tìm kho báu
        </button>
      </header>
    </div>
  );
}

export default GamesLobby;
