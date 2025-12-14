import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 

// Import Chart.js 
import { Pie, Line, Bar } from 'react-chartjs-2'; 
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale, 
  LinearScale,   
  PointElement,    
  LineElement,
  BarElement 
} from 'chart.js';

// Đăng ký các thành phần 
ChartJS.register(
  ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement 
);
// ---

// --- Phần 1: API Helper  ---
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

// --- Phần 2: Component Biểu đồ Tròn ---
const PopularityChart = ({ chartData }) => {
  const data = {
    labels: chartData.map(item => item._id), 
    datasets: [
      {
        label: 'Số lượt chơi',
        data: chartData.map(item => item.count), 
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)', 
          'rgba(54, 162, 235, 0.7)', 
          'rgba(255, 206, 86, 0.7)', 
        ],
        borderWidth: 1,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#282c34' } },
    },
  };
  return <Pie data={data} options={options} />;
};

// --- Phần 3: Component Biểu đồ Đường ---
const ActivityChart = ({ chartData }) => {
  const data = {
    labels: chartData.map(item => item._id),
    datasets: [
      {
        label: 'Số lượt chơi mỗi ngày',
        data: chartData.map(item => item.count), 
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#282c34' } },
    },
    scales: { y: { beginAtZero: true } }
  };
  return <Line data={data} options={options} />;
};

// --- Component Biểu đồ Cột ---
const AverageScoreChart = ({ chartData }) => {
  const data = {
    labels: chartData.map(item => item._id), 
    datasets: [
      {
        label: 'Điểm trung bình',
        data: chartData.map(item => item.averageScore), 
        backgroundColor: [
          'rgba(153, 102, 255, 0.7)', 
          'rgba(255, 159, 64, 0.7)',  
        ],
        borderWidth: 1,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }, 
      title: {
        display: true,
        text: 'Điểm trung bình (Học toán & Đếm số)',
        color: '#282c34'
      },
    },
    scales: { y: { beginAtZero: true, max: 1000 } } 
  };
  return <Bar data={data} options={options} />;
};


// --- Phần 4: Component Trang Admin chính ---
function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalGamesPlayed: 0 });
  
  const [popularityData, setPopularityData] = useState(null); 
  const [activityData, setActivityData] = useState(null);
  const [averageScoreData, setAverageScoreData] = useState(null); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- (YÊU CẦU MỚI) State cho Modal Lịch sử ---
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState([]);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);

  // --- Phần 5: Hàm tải dữ liệu ---
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersRes, statsRes, popRes, actRes, avgRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/stats'),
        api.get('/game/stats/popularity'),
        api.get('/game/stats/activity'),
        api.get('/game/stats/averages')
      ]);

      setUsers(usersRes.data.filter(user => user.role === 'student')); 
      setStats(statsRes.data);
      setPopularityData(popRes.data);
      setActivityData(actRes.data);
      setAverageScoreData(avgRes.data);

    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Admin:', err);
      setError(err.response ? err.response.data.msg : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); 

  // Hàm xóa user
  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
      try {
        const res = await api.delete(`/users/${userId}`);
        alert(res.data.msg);
        fetchData();
      } catch (err) {
        console.error('Lỗi khi xóa user:', err);
        alert(err.response ? err.response.data.msg : 'Lỗi không xác định');
      }
    }
  };
  
  // --- Hàm xem lịch sử ---
  const handleViewHistory = async (userId, username) => {
    try {
      setLoadingHistory(true);
      setShowHistoryModal(true); // Mở Modal
      setSelectedStudentName(username); // Đặt tên
      
      // Gọi API mới (GET /api/game/history/:userId)
      const res = await api.get(`/game/history/${userId}`);
      setSelectedStudentHistory(res.data); // Lưu lịch sử
      
    } catch (err) {
      console.error('Lỗi khi tải lịch sử học sinh:', err);
      alert(err.response ? err.response.data.msg : 'Lỗi không xác định');
    } finally {
      setLoadingHistory(false);
    }
  };


  // --- Phần 6: Giao diện  ---
  if (loading) {
    return (
      <div className="App"><header className="App-header"><p>Đang tải dữ liệu Admin...</p></header></div>
    );
  }
  if (error) {
    return (
      <div className="App"><header className="App-header"><p style={{ color: 'red' }}>Lỗi: {error}</p></header></div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Trang Quản Trị Viên (Admin)</h1>

        {/* --- Khung Thống kê & Biểu đồ --- */}
        <h2>Thống kê nhanh</h2>
        <div style={{
          display: 'flex', flexDirection: 'row', gap: '20px', 
          backgroundColor: 'rgba(255,255,255,0.3)',
          padding: '20px', borderRadius: '10px',
          alignItems: 'center',
          flexWrap: 'wrap', 
          justifyContent: 'center'
        }}>
          {/* Cột 1: Thống kê */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div style={{ backgroundColor: '#0d47a1', color: 'white', padding: '20px', borderRadius: '8px', width: '250px' }}>
              <h3>Tổng số học sinh</h3>
              <p style={{ fontSize: '2em', margin: 0 }}>{stats.totalUsers}</p>
            </div>
            <div style={{ backgroundColor: '#0d47a1', color: 'white', padding: '20px', borderRadius: '8px', width: '250px' }}>
              <h3>Tổng số lượt chơi</h3>
              <p style={{ fontSize: '2em', margin: 0 }}>{stats.totalGamesPlayed}</p>
            </div>
          </div>
          
          {/* Cột 2: Biểu đồ tròn */}
          <div style={{ 
            width: '300px', height: '300px', 
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: '10px', borderRadius: '10px'
          }}>
            {popularityData && popularityData.length > 0 ? (
              <PopularityChart chartData={popularityData} />
            ) : (
              <p style={{color: '#282c34'}}>Chưa có dữ liệu lượt chơi.</p>
            )}
          </div>
          
          {/* Cột 3: Biểu đồ Cột */}
          <div style={{ 
            width: '300px', height: '300px', 
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: '10px', borderRadius: '10px'
          }}>
            {averageScoreData && averageScoreData.length > 0 ? (
              <AverageScoreChart chartData={averageScoreData} />
            ) : (
              <p style={{color: '#282c34'}}>Chưa có dữ liệu điểm.</p>
            )}
          </div>
        </div>
        
        {/* --- Khung Biểu đồ Đường --- */}
        <h2 style={{marginTop: '40px'}}>Hoạt động 7 ngày qua</h2>
        <div style={{
          width: '80%', maxWidth: '700px', 
          backgroundColor: 'rgba(255,255,255,0.7)',
          padding: '10px', borderRadius: '10px'
        }}>
          {activityData && activityData.length > 0 ? (
            <ActivityChart chartData={activityData} />
          ) : (
            <p style={{color: '#282c34'}}>Chưa có hoạt động nào trong 7 ngày qua.</p>
          )}
        </div>


        {/* --- Khung Quản lý User (ĐÃ THÊM NÚT "XEM") --- */}
        <h2 style={{marginTop: '40px'}}>Quản lý học sinh</h2>
        <div style={{
          width: '80%', maxWidth: '700px', height: '300px',
          overflowY: 'auto', backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: '8px', padding: '10px'
        }}>
          {users.length === 0 ? (
            <p>Chưa có học sinh nào.</p>
          ) : (
            users.map((user) => (
              <div key={user._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px', backgroundColor: 'rgba(255,255,255,0.7)',
                borderRadius: '5px', marginBottom: '10px', color: '#282c34'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={`/avatars/${user.avatar}`} alt="avatar" style={{width: '40px', height: '40px', borderRadius: '50%'}} />
                  <strong>{user.username}</strong>
                </div>
                
                {/* --- (NÚT MỚI) --- */}
                <div style={{display: 'flex', gap: '10px'}}>
                  <button 
                    onClick={() => handleViewHistory(user._id, user.username)}
                    style={{ backgroundColor: '#0275d8', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', padding: '5px 10px' }}
                  >
                    Xem Lịch sử
                  </button>
                  <button 
                    onClick={() => handleDelete(user._id)}
                    style={{ backgroundColor: '#ff4d4d', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', padding: '5px 10px' }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </header>

      {/* --- MODAL MỚI --- */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '80%', maxWidth: '700px',
            height: '500px',
            backgroundColor: '#B3E5FC', // Nền xanh nhạt
            color: '#282c34', 
            borderRadius: '10px',
            padding: '20px',
            display: 'flex', flexDirection: 'column'
          }}>
            <h2 style={{marginTop: 0}}>Lịch sử chơi của: {selectedStudentName}</h2>
            
            <div style={{
              flex: 1, 
              overflowY: 'auto', 
              backgroundColor: 'rgba(255,255,255,0.5)',
              padding: '10px',
              borderRadius: '5px'
            }}>
              {loadingHistory ? (
                <p>Đang tải...</p>
              ) : selectedStudentHistory.length === 0 ? (
                <p>Học sinh này chưa chơi game nào.</p>
              ) : (
                selectedStudentHistory.map((result) => (
                  <div key={result._id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px', backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '5px', marginBottom: '10px', color: '#282c34'
                  }}>
                    <span>
                      <strong>{result.gameType}</strong> - 
                      {new Date(result.createdAt).toLocaleString('vi-VN')}
                    </span>
                    {result.gameType === 'Jack Sparrow' ? (
                      <span style={{color: 'green', fontWeight: 'bold'}}>{result.trophy}</span>
                    ) : (
                      <span style={{color: '#0d47a1', fontWeight: 'bold'}}>{result.score} điểm</span>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => setShowHistoryModal(false)}
              style={{
                marginTop: '20px', padding: '10px',
                backgroundColor: '#ff4d4d', color: 'white',
                border: 'none', borderRadius: '5px', cursor: 'pointer',
                fontSize: '1.1em', fontWeight: 'bold'
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default AdminPage;