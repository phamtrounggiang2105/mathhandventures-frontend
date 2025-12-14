import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Để gọi API
import { useNavigate } from 'react-router-dom'; // Để chuyển trang

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate(); // Khởi tạo hook

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trang reload

    // 1. Kiểm tra mật khẩu khớp
    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    // 2. Gói dữ liệu
    const newUser = {
      username: username,
      password: password,
      //  không cần gửi 'role', vì backend tự động đặt là student
    };

    try {
      // 3. Gọi API backend
      // Gửi yêu cầu POST đến backend 
      await axios.post('https://mathhandventures-backend.onrender.com/api/users/register', newUser);

      // 4. Xử lý thành công
      alert('Đăng ký thành công! Giờ bạn có thể đăng nhập.');
      navigate('/login'); // Tự động chuyển người dùng sang trang Đăng nhập

    } catch (err) {
      // 5. Xử lý lỗi
      
      console.error(err);
      if (err.response && err.response.data && err.response.data.msg) {
        alert('Lỗi: ' + err.response.data.msg);
      } else {
        alert('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Đăng Ký Tài Khoản</h1>
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
            placeholder="Mật khẩu (ít nhất 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
          />
           <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
          />
          <button type="submit" style={{ padding: '10px', borderRadius: '5px', background: '#61dafb', color: '#282c34', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Đăng Ký
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '0.8em' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#61dafb' }}>Đăng nhập</Link>
        </p>
      </header>
    </div>
  );
}

export default RegisterPage;
