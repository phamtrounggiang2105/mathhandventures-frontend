import React, { useState, useCallback, useEffect } from 'react';
import GameLayout from '../components/GameLayout'; // 1. Import Giao diện "Trong Game"
import axios from 'axios';
import '../App.css';
import { useNavigate } from 'react-router-dom'; // Import navigate

// Helper: Tạo 'instance' của axios
const api = axios.create({
  baseURL: 'https://mathhandventures-backend.onrender.com/api',
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

// --- (Phần 1: Logic sinh câu hỏi - ĐÃ SỬA) ---

// Nhóm 1: Động vật (Bạn có thể thêm/bớt emoji tùy ý)
const ANIMALS = [
  { emoji: '🐶', type: 'con vật' },
  { emoji: '🐱', type: 'con vật' },
  { emoji: '🐭', type: 'con vật' },
  { emoji: '🐰', type: 'con vật' },
  { emoji: '🦊', type: 'con vật' },
  { emoji: '🐻', type: 'con vật' },
  { emoji: '🐼', type: 'con vật' },
  { emoji: '🐨', type: 'con vật' },
  { emoji: '🐯', type: 'con vật' },
  { emoji: '🦁', type: 'con vật' }
];

// Nhóm 2: Trái cây (Bạn có thể thêm/bớt emoji tùy ý)
const FRUITS = [
  { emoji: '🍎', type: 'trái cây' },
  { emoji: '🍌', type: 'trái cây' },
  { emoji: '🍊', type: 'trái cây' },
  { emoji: '🍇', type: 'trái cây' },
  { emoji: '🍓', type: 'trái cây' },
  { emoji: '🍉', type: 'trái cây' }
];

const generateQuestion = () => {
  // 1. Chọn số lượng ngẫu nhiên từ 1-10
  const answer = Math.floor(Math.random() * 10) + 1;
  
  let category; // Nhóm được chọn
  let chosenItem; // Vật phẩm được chọn
  
  // 2. Chọn ngẫu nhiên nhóm (Trái cây hoặc Động vật)
  if (Math.random() < 0.5) {
    category = FRUITS;
    // Chọn ngẫu nhiên 1 trái cây
    chosenItem = category[Math.floor(Math.random() * category.length)];
  } else {
    category = ANIMALS;
    // Chọn ngẫu nhiên 1 con vật
    chosenItem = category[Math.floor(Math.random() * category.length)];
  }
  
  // 3. Lấy emoji và loại câu hỏi
  const { emoji, type } = chosenItem; // type sẽ là 'trái cây' hoặc 'con vật'
  
  // 4. Tạo chuỗi emoji (ví dụ: "🍎🍎🍎")
  const questionEmojis = Array(answer).fill(emoji); 
  
  // 5. Tạo văn bản câu hỏi (ví dụ: "Có bao nhiêu trái cây...")
  const questionText = `Có bao nhiêu ${type} trên màn hình?`;
  
  return { text: questionText, emojis: questionEmojis, answer: answer };
};


function CountingGame() {
  const navigate = useNavigate(); // Hook để quay về
  const [gameStarted, setGameStarted] = useState(false); // Thêm state "Sẵn sàng"
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // --- (Phần 2: Xử lý game) ---
  
  // Khi nhấn "Sẵn sàng"
  const handleStartGame = () => {
    setGameStarted(true);
    setQuestionCount(1);
    setCurrentScore(0);
    setFeedback('');
    setIsAnswering(false);
    setCurrentQuestion(generateQuestion());
  };

  // Hàm lưu game
  const saveGame = async (finalScore) => {
    try {
      const gameData = { 
        gameType: 'Đếm số', // Đổi gameType
        score: finalScore 
      };
      await api.post('/game/save', gameData);
      console.log('Đã lưu điểm (Đếm số) thành công!');
    } catch (err) {
      console.error('Lỗi khi lưu điểm:', err);
    }
  };

  // Khi "HandInput" (webcam) chốt đáp án (sau 1.5s)
  const handleAnswer = useCallback((detectedNumber) => {
    if (isAnswering || !gameStarted) return; 
    setIsAnswering(true);
    let isCorrect = (detectedNumber === currentQuestion.answer);

    if (isCorrect) {
      setFeedback('Đúng rồi! +50 điểm');
      setCurrentScore(prevScore => prevScore + 50);
    } else {
      setFeedback(`Sai rồi! Đáp án đúng là ${currentQuestion.answer}.`);
    }

    // Kiểm tra kết thúc game (20 câu)
    if (questionCount === 20) {
      const finalScore = isCorrect ? currentScore + 50 : currentScore;
      setTimeout(() => {
        alert(`Hoàn thành! Tổng điểm: ${finalScore}.`);
        saveGame(finalScore);
        setGameStarted(false); // Quay về màn hình "Sẵn sàng"
        setIsAnswering(false);
      }, 2000);
    } else {
      // Sang câu tiếp theo
      setTimeout(() => {
        setQuestionCount(prevCount => prevCount + 1);
        setCurrentQuestion(generateQuestion());
        setIsAnswering(false);
      }, 2000);
    }
  }, [currentQuestion, questionCount, currentScore, gameStarted, isAnswering]); 


  // --- (Phần 3: Giao diện - ĐÃ SỬA LỖI) ---
  
  if (!gameStarted) {
    // Màn hình "Sẵn sàng"
    return (
      <div className="App">
        <header className="App-header">
          <h1>Game Đếm Số</h1>
          <p>Sẵn sàng đếm 20 lượt?</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={handleStartGame}
              style={{ padding: '20px 40px', fontSize: '1.5em', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
            >
              Sẵn sàng
            </button>
            <button 
              onClick={() => navigate('/games')} // Quay về Sảnh Game
              style={{ padding: '20px 40px', fontSize: '1.5em', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
            >
              Quay lại
            </button>
          </div>
        </header>
      </div>
    );
  }

  // Màn hình "Trong Game"
  return (
    <GameLayout onHandDetected={handleAnswer}>
      
      <h1 style={{ fontSize: '3em', margin: 0 }}>Câu hỏi {questionCount}/20</h1>
      
      {/* --- ĐÂY LÀ KHỐI CODE ĐÃ ĐÓNG KHUNG --- */}
      {currentQuestion && (
        <div style={{
          backgroundColor: 'rgba(14, 85, 227, 0.8)', // Nền tối mờ
          color: 'white', // Chữ trắng
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #3f75c5ff', // Viền xanh đậm
          textAlign: 'center',
          maxWidth: '90%'
        }}>
        
          {/* 1. Hiển thị câu hỏi động */}
          <h3 style={{fontSize: '2em', marginTop: 0}}>{currentQuestion.text}</h3>
          
          {/* 2. Hiển thị Emoji (với CSS Grid) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, auto)',
            justifyContent: 'center',
            gap: '0.2em',
            fontSize: '5em', 
            margin: '20px',
          }}>
            {currentQuestion.emojis.map((emoji, index) => (
              <span key={index}>{emoji}</span>
            ))}
          </div>

        </div> // <-- Đóng thẻ div của khung
      )}
      {/* --- KẾT THÚC KHỐI ĐÓNG KHUNG --- */}

      
      <h2 style={{ fontSize: '2em', color: '#c4169eff' }}>Điểm số: {currentScore}</h2>
      
      {feedback && (
        <h3 style={{ 
            fontSize: '1.5em', 
            color: feedback.startsWith('Đúng') ? 'green' : 'red',
            height: '30px'
        }}>
          {isAnswering ? feedback : ''}
        </h3>
      )}
    </GameLayout>
  );
}

export default CountingGame;
  
  


