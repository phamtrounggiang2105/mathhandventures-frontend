import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

  // Style chung cho các thẻ nội dung
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    textAlign: 'center',
    marginBottom: '30px',
    border: '1px solid #eee',
    color: '#333'
  };

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* TIÊU ĐỀ DỰ ÁN */}
        <div style={{ ...cardStyle, borderTop: '8px solid #0d47a1' }}>
          <h1 style={{ color: '#0d47a1', fontSize: '2.5em', marginBottom: '20px' }}>MATHANDVENTURE</h1>
          <p style={{ lineHeight: '1.8', fontSize: '1.1em', textAlign: 'justify' }}>
            <strong>MATHANDVENTURE</strong> là một dự án Xây dựng phần mềm trò chơi toán học cơ bản cho trẻ em tiền tiểu học. 
            Dự án tập trung vào việc tạo ra môi trường tương tác giúp trẻ làm quen với các con số và phép tính một cách sinh động nhất.
          </p>
        </div>

        {/* THÔNG TIN TÁC GIẢ & GIẢNG VIÊN */}
        <div style={cardStyle}>
          <h2 style={{ color: '#0d47a1', marginBottom: '20px' }}>Đội Ngũ Phát Triển</h2>
          <p style={{ lineHeight: '1.8', fontSize: '1.1em', textAlign: 'justify' }}>
            Chúng tôi: <strong>Phạm Trường Giang (MSSV: 20223944)</strong> và <strong>Phan Thanh Bình (MSSV: 20223683)</strong>, 
            sinh viên lớp <strong>Điện tử 01 - K67</strong> dưới sự hướng dẫn từ <strong>ThS. Hoàng Quang Huy</strong>.
          </p>
          <div style={{ 
            backgroundColor: '#fff9c4', 
            padding: '20px', 
            borderRadius: '15px', 
            marginTop: '20px', 
            textAlign: 'justify',
            borderLeft: '5px solid #fbc02d'
          }}>
            <p style={{ margin: 0, fontStyle: 'italic' }}>
              "Thầy là người đã trực tiếp định hướng đề tài và tận tình chỉ bảo, tháo gỡ những khó khăn về mặt thuật toán 
              cũng như nghiệp vụ sư phạm trong suốt quá trình chúng tôi thực hiện đề tài."
            </p>
          </div>
        </div>

        {/* THÔNG TIN LIÊN HỆ */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: '#0d47a1', marginBottom: '15px' }}>Liên hệ đội ngũ phát triển</h2>
          <div style={{ fontSize: '1.1em', lineHeight: '2' }}>
            <p style={{ margin: '5px 0' }}>📧 Email: <strong>trounggiang2105@gmail.com</strong></p>
            <p style={{ margin: '5px 0' }}>📞 Phone: <strong>0961122071</strong></p>
          </div>
        </div>

        {/* NÚT QUAY LẠI */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '15px 50px',
              fontSize: '1.1em',
              backgroundColor: '#0d47a1',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(13, 71, 161, 0.3)'
            }}
          >
            Quay lại Sảnh chính
          </button>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;