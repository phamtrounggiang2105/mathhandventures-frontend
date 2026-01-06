import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Để gọi API
import { useNavigate } from 'react-router-dom'; // Để chuyển trang

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Khởi tạo hook

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trang reload

    const userToLogin = {
      username: username,
      password: password,
    };

    try {
      // 1. Gọi API backend
      const response = await axios.post('https://mathhandventures-backend.onrender.com/api/users/login', userToLogin);

      // 2. Xử lý thành công
      // Backend (GĐ 2) trả về một đối tượng có token và user
      const { token, user } = response.data;

      // 3. LƯU TOKEN VÀO BỘ NHỚ TRÌNH DUYỆT (LocalStorage)
      // Đây là bước quan trọng nhất
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // Lưu thông tin user 

      alert('Đăng nhập thành công!');

      // 4. Chuyển hướng người dùng
      // Nếu là admin thì về trang admin, nếu là student thì về trang chủ game
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/'); // Chuyển về trang chủ webcam
      }

    } catch (err) {
      // 5. Xử lý lỗi 
      console.error(err);
      if (err.response && err.response.data && err.response.data.msg) {
        alert('Lỗi: ' + err.response.data.msg); // Tên đăng nhập hoặc mật khẩu không đúng
      } else {
        alert('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="App"> 
      <header className="App-header"> 
        <h1>Đăng nhập</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
          />
          <button type="submit" style={{ padding: '10px', borderRadius: '5px', background: '#61dafb', color: '#282c34', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Đăng nhập
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '0.8em' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: '#e62d26ff' }}>Đăng ký ngay</Link>
        </p>
      </header>
    </div>
  );
}

export default LoginPage;
