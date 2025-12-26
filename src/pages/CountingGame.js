import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; 
import HandInput from '../components/HandInput'; 

// --- 1. Cấu hình tài nguyên & API ---
// Đảm bảo file ảnh này tồn tại trong public/images/
const BACKGROUND_IMAGE_URL = '/images/practice_background.jpg';
const VICTORY_IMAGE_URL = '/images/victory_minions.jpg';

const api = axios.create({ baseURL: 'https://mathhandventures-backend.onrender.com/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

// --- 2. Dữ liệu và Logic sinh câu hỏi ---
const ANIMALS = [
  { emoji: '🐶', type: 'con vật' }, { emoji: '🐱', type: 'con vật' },
  { emoji: '🐭', type: 'con vật' }, { emoji: '🐰', type: 'con vật' },
  { emoji: '🦊', type: 'con vật' }, { emoji: '🐻', type: 'con vật' },
  { emoji: '🐼', type: 'con vật' }, { emoji: '🐨', type: 'con vật' },
  { emoji: '🐯', type: 'con vật' }, { emoji: '🦁', type: 'con vật' }
];
const FRUITS = [
  { emoji: '🍎', type: 'trái cây' }, { emoji: '🍌', type: 'trái cây' },
  { emoji: '🍊', type: 'trái cây' }, { emoji: '🍇', type: 'trái cây' },
  { emoji: '🍓', type: 'trái cây' }, { emoji: '🍉', type: 'trái cây' }
];

const generateQuestion = () => {
  const answer = Math.floor(Math.random() * 10) + 1;
  const category = Math.random() < 0.5 ? FRUITS : ANIMALS;
  const chosenItem = category[Math.floor(Math.random() * category.length)];
  return { 
    text: `Có bao nhiêu ${chosenItem.type} trên màn hình?`, 
    emojis: Array(answer).fill(chosenItem.emoji), 
    answer: answer 
  };
};

// --- 3. Component Chính ---
function CountingGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('lobby'); // lobby, playing, ended
  const [timeLeft, setTimeLeft] = useState(120); // 120 giây
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // --- 4. Xử lý thời gian (Đồng bộ với Học toán) ---
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleFinishGame();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleStartGame = () => {
    setGameState('playing');
    setQuestionCount(1);
    setCurrentScore(0);
    setTimeLeft(120);
    setFeedback('');
    setIsAnswering(false);
    setCurrentQuestion(generateQuestion());
  };

  const saveGameResult = async (finalScore) => {
    try {
      await api.post('/game/save', { gameType: 'Đếm số', score: finalScore });
    } catch (err) { console.error('Lỗi khi lưu điểm:', err); }
  };

  const handleFinishGame = () => {
    saveGameResult(currentScore);
    setGameState('ended');
    setIsAnswering(false);
  };

  const handleAnswer = useCallback((detectedNumber) => {
    if (isAnswering || gameState !== 'playing') return; 
    setIsAnswering(true);
    const isCorrect = (detectedNumber === currentQuestion.answer);

    if (isCorrect) {
      setFeedback('Đúng rồi! +1 điểm');
      setCurrentScore(prev => prev + 1);
    } else {
      setFeedback(`Sai rồi! Đáp án đúng là ${currentQuestion.answer}.`);
    }

    if (questionCount === 10) {
      setTimeout(() => handleFinishGame(), 2000);
    } else {
      setTimeout(() => {
        setQuestionCount(prev => prev + 1);
        setCurrentQuestion(generateQuestion());
        setIsAnswering(false);
        setFeedback('');
      }, 2000);
    }
  }, [currentQuestion, questionCount, currentScore, gameState, isAnswering]);

  // --- 5. Giao diện (Lobby) ---
  if (gameState === 'lobby') {
    return (
      <div className="App">
        <header className="App-header">
          <p>Đếm đúng 10 câu trong 2 phút. Sẵn sàng chưa?</p>
          <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', marginTop: '50px' }}>
            <button onClick={handleStartGame} style={{ padding: '20px 40px', fontSize: '1.4em', backgroundColor: '#4CAF50', color: 'white', borderRadius: '15px', cursor: 'pointer', border: 'none' }}>Sẵn sàng</button>
            <button onClick={() => navigate('/')} style={{ padding: '10px', backgroundColor: '#f43307ff', color: 'white', borderRadius: '10px', cursor: 'pointer', border: 'none' }}>Quay lại sảnh chính</button>
          </div>
        </header>
      </div>
    );
  }

  // --- 6. Giao diện Trong Game ---
  return (
    <div style={{ 
      backgroundImage: `url('${BACKGROUND_IMAGE_URL}')`, 
      backgroundSize: 'cover', backgroundPosition: 'center',
      height: '100vh', width: '100vw', position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: '10vh', color: '#3E352F'
    }}>
      {/* Nút Thoát */}
      <button onClick={() => setGameState('lobby')} style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', fontWeight: 'bold', cursor: 'pointer', zIndex: 201 }}>Thoát</button>

      {/* Đồng hồ đếm ngược */}
      <div style={{
        position: 'absolute', top: '20px', left: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px 25px', borderRadius: '20px',
        fontSize: '2em', fontWeight: 'bold', color: timeLeft <= 15 ? 'red' : 'black', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}>
        ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>

      {/* Webcam AI */}
      {gameState === 'playing' && (
        <HandInput isSmall={true} onHandDetected={handleAnswer} />
      )}

      {gameState === 'playing' && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h2 style={{ fontSize: '2em', marginBottom: '10px' }}>Câu {questionCount}/10</h2>
          {currentQuestion && (
            // --- KHUNG CHỨA CÂU HỎI (Đã bỏ viền) ---
            <div style={{
              padding: '20px 40px',
              borderRadius: '25px',
              textAlign: 'center',
              margin: '20px auto',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)' // Giữ lại bóng đổ nhẹ cho đẹp
            }}>
              <h3 style={{fontSize: '2.5em', marginTop: 0}}>{currentQuestion.text}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, auto)', justifyContent: 'center', gap: '15px', fontSize: '6em' }}>
                {currentQuestion.emojis.map((emoji, index) => <span key={index}>{emoji}</span>)}
              </div>
            </div>
          )}
          <h2 style={{ fontSize: '2.5em' }}>Điểm: {currentScore}</h2>
          <div style={{ height: '50px' }}>
            {feedback && <h3 style={{ fontSize: '2em', color: feedback.includes('Đúng') ? 'green' : 'red', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '5px 20px', borderRadius: '10px' }}>{feedback}</h3>}
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '40px', borderRadius: '30px', textAlign: 'center', marginTop: '5vh', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: '3.5em', margin: '0' }}>{timeLeft === 0 ? 'HẾT GIỜ!' : 'HOÀN THÀNH!'}</h1>
          <img src={VICTORY_IMAGE_URL} alt="Victory" style={{ width: '280px', borderRadius: '20px', margin: '15px' }} />
          <h2 style={{ fontSize: '3em' }}>Tổng điểm: {currentScore}/10</h2>
          <button onClick={() => setGameState('lobby')} style={{ padding: '15px 50px', fontSize: '1.5em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Chơi lại</button>
        </div>
      )}
    </div>
  );
}

export default CountingGame;