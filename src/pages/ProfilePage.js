import React, { useState, useEffect } from 'react'; // 1. Phải import useEffect
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

// --- Phần 1: API Helper ---
const api = axios.create({
  baseURL: 'https://mathhandventures-backend.onrender.com/api',
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Phần 2: Danh sách Avatars ---
const avatarList = [];
for (let i = 1; i <= 17; i++) {
  const number = i < 10 ? '0' + i : i;
  avatarList.push(`avatar${number}.jpg`);
}

// Style cho nút Cập nhật
const buttonStyle = {
  padding: '10px 20px', 
  background: '#0d47a1', // Màu xanh đậm
  color: 'white', 
  border: 'none', 
  cursor: 'pointer', 
  fontWeight: 'bold',
  marginTop: '10px',
  borderRadius: '5px'
};

function ProfilePage() {
  const navigate = useNavigate();
  
  // State cho User
  const [currentUser, setCurrentUser] = useState(() => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  });
  
  // State cho Avatar
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || 'avatar01.jpg');
  
  // --- (YÊU CẦU MỚI) State để lưu Lịch sử chơi ---
  const [gameHistory, setGameHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // --- (YÊU CẦU MỚI) Hàm tải lịch sử chơi ---
  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) return; // Nếu không có user, không làm gì cả
      
      try {
        setHistoryLoading(true);
        // Gọi API (GET /api/game/history) - API này tự biết là user nào
        const res = await api.get('/game/history');
        setGameHistory(res.data); // Lưu mảng kết quả
      } catch (err) {
        console.error("Lỗi khi tải lịch sử:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]); // Chỉ chạy khi currentUser đã được tải


  // --- Phần 3: Hàm xử lý Avatar ---
  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/avatar', { avatar: selectedAvatar });
      const updatedUser = res.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      alert(res.data.msg);
      window.location.reload(); // Tải lại để Navbar cập nhật
    } catch (err) {
      console.error('Lỗi cập nhật avatar:', err);
      alert(err.response ? err.response.data.msg : 'Lỗi không xác định');
    }
  };
  
  if (!currentUser) {
    return (
       <div className="App"><header className="App-header"><h1>Đang tải...</h1></header></div>
    );
  }

  // --- Phần 4: Giao diện  ---
  return (
    // Div ngoài cùng DÙNG LẠI NỀN XANH
    <div className="App"> 
      <header className="App-header">
        <h1>Trang cá nhân</h1>
        
        {/* Phần Avatar (Layout 2 cột) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '50px', 
          alignItems: 'flex-start', 
          marginBottom: '30px', 
          padding: '20px', 
          backgroundColor: 'rgba(255,255,255,0.3)', // Nền trắng mờ
          borderRadius: '10px',
          color: '#282c34', // Chữ đen
          textShadow: 'none' // Tắt bóng đổ
        }}>
          
          {/* Cột 1: Thông tin cá nhân */}
          <div style={{textAlign: 'center'}}>
            <p>Avatar hiện tại:</p>
            <img 
              src={`/avatars/${currentUser.avatar}`} 
              alt="Avatar hiện tại" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #0d47a1' }}
            />
            <p>Tên: <strong>{currentUser.username}</strong></p>
            <p>Vai trò: <i>{currentUser.role}</i></p>
          </div>
          
          {/* Cột 2: Form chọn avatar mới */}
          <form onSubmit={handleUpdateAvatar} style={{ width: '100%', maxWidth: '500px', textAlign: 'left' }}>
              <p>Chọn avatar mới:</p>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '10px',
                maxHeight: '220px', overflowY: 'auto',
                padding: '10px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '8px'
              }}>
                {avatarList.map((avatarName) => (
                  <img
                    key={avatarName}
                    src={`/avatars/${avatarName}`}
                    alt={`Avatar ${avatarName}`}
                    style={{
                      width: '60px', height: '60px', borderRadius: '50%',
                      cursor: 'pointer',
                      border: selectedAvatar === avatarName ? '3px solid #0d47a1' : '3px solid transparent'
                    }}
                    onClick={() => setSelectedAvatar(avatarName)} 
                  />
                ))}
              </div>
              <button 
                type="submit" 
                style={buttonStyle} // Dùng style đã định nghĩa
                disabled={selectedAvatar === currentUser.avatar} 
              >
                Cập nhật Avatar
              </button>
          </form>
        </div>

        <hr style={{width: '80%', borderColor: 'rgba(255,255,255,0.3)'}} />

        {/* --- (YÊU CẦU MỚI) Khung Lịch sử chơi --- */}
        <h2>Lịch sử chơi</h2>
        <div style={{
          width: '80%',
          maxWidth: '700px',
          height: '300px', // Giới hạn chiều cao
          overflowY: 'auto', // Thêm thanh cuộn
          backgroundColor: 'rgba(255,255,255,0.3)', // Nền trắng mờ
          borderRadius: '8px',
          padding: '10px',
        }}>
          {historyLoading ? (
            <p style={{color: '#282c34', textShadow: 'none'}}>Đang tải lịch sử...</p>
          ) : gameHistory.length === 0 ? (
            <p style={{color: '#282c34', textShadow: 'none'}}>Bạn chưa chơi game nào.</p>
          ) : (
            // Hiển thị danh sách
            gameHistory.map((result) => (
              <div key={result._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center', // Căn giữa theo chiều dọc
                padding: '10px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                borderRadius: '5px',
                marginBottom: '10px',
                color: '#282c34', // Chữ đen
                textShadow: 'none' // Bỏ bóng đổ
              }}>
                <span>
                  <strong>{result.gameType}</strong> - 
                  {/* Định dạng ngày cho đẹp */}
                  {new Date(result.createdAt).toLocaleString('vi-VN')}
                </span>
                
                {/* HIỂN THỊ ĐIỂM HOẶC HUY HIỆU KÈM ẢNH */}
                {result.gameType === 'Jack Sparrow' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src="/Huy_hieu/Huy_hieu_kho_bau.png" 
                      alt="Huy hiệu" 
                      style={{ width: '35px', height: 'auto' }} 
                    />
                    <span style={{color: 'green', fontWeight: 'bold'}}>
                      {result.trophy}
                    </span>
                  </div>
                ) : (
                  <span style={{color: '#0d47a1', fontWeight: 'bold'}}>
                    {result.score} điểm
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        
      </header>
    </div>
  );
}

export default ProfilePage;