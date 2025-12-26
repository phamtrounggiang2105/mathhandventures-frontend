import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; 
import HandInput from '../components/HandInput'; 

// --- 1. Cấu hình tài nguyên & API ---
const BACKGROUND_IMAGE_URL = '/images/practice_background.jpg';
const TREASURE_BADGE_URL = '/Huy_hieu/Huy_hieu_kho_bau.png'; // Đường dẫn bạn đã cung cấp

const api = axios.create({ baseURL: 'https://mathhandventures-backend.onrender.com/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

// Danh sách nhân vật từ folder public/nhan_vat_game/ của bạn
const CHARACTERS = [
  { id: 'lucfi', name: 'Luffy', img: '/nhan_vat_game/lucfi.png' },
  { id: 'cam_ba_kiem', name: 'Zoro', img: '/nhan_vat_game/cam_ba_kiem.png' },
  { id: 'songoku', name: 'Songoku', img: '/nhan_vat_game/songoku.png' },
  { id: 'ngo_khong', name: 'Ngộ Không', img: '/nhan_vat_game/ngo_khong.png' },
  { id: 'pikachu', name: 'Pikachu', img: '/nhan_vat_game/pikachu.png' },
  { id: 'doraemon', name: 'Doraemon', img: '/nhan_vat_game/doraemon.png' },
  { id: 'tuan_loc', name: 'Tuần Lộc', img: '/nhan_vat_game/tuan%20loc.png' }, // Xử lý khoảng trắng tên file
];

// --- 2. Dữ liệu và Logic sinh câu hỏi ---
const ANIMALS = [
  { emoji: '🐶', type: 'con vật' }, { emoji: '🐱', type: 'con vật' },
  { emoji: '🐭', type: 'con vật' }, { emoji: '🐰', type: 'con vật' },
  { emoji: '🦊', type: 'con vật' }, { emoji: '🐻', type: 'con vật' }
];
const FRUITS = [
  { emoji: '🍎', type: 'trái cây' }, { emoji: '🍌', type: 'trái cây' },
  { emoji: '🍊', type: 'trái cây' }, { emoji: '🍓', type: 'trái cây' }
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
function JackSparrowGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('lobby'); // lobby, playing, ended
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]); // Mặc định chọn Luffy
  const [timeLeft, setTimeLeft] = useState(120);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

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
      await api.post('/game/save', { gameType: 'Đếm số (Jack Sparrow)', score: finalScore });
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
          <h1 style={{ color: '#FFD700', textShadow: '2px 2px #000' }}>CHỌN NHÂN VẬT</h1>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '30px' }}>
            {CHARACTERS.map(char => (
              <div 
                key={char.id} 
                onClick={() => setSelectedChar(char)}
                style={{
                  border: selectedChar.id === char.id ? '4px solid #4CAF50' : '2px solid white',
                  borderRadius: '15px', padding: '10px', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.1)'
                }}
              >
                <img src={char.img} alt={char.name} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                <p style={{ fontSize: '0.8em', margin: '5px 0 0' }}>{char.name}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
            <button onClick={handleStartGame} style={{ padding: '20px 60px', fontSize: '1.4em', backgroundColor: '#4CAF50', color: 'white', borderRadius: '15px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>VÀO TRẬN</button>
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
      paddingTop: '5vh', color: '#3E352F', overflow: 'hidden'
    }}>
      <button onClick={() => setGameState('lobby')} style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', fontWeight: 'bold', cursor: 'pointer', zIndex: 201 }}>Thoát</button>

      {/* Hiển thị nhân vật đang chơi */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', textAlign: 'center' }}>
        <img src={selectedChar.img} alt="Current Player" style={{ width: '120px' }} />
        <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '5px', borderRadius: '10px' }}>{selectedChar.name}</div>
      </div>

      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px 25px', borderRadius: '20px', fontSize: '2em', fontWeight: 'bold', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>

      {gameState === 'playing' && <HandInput isSmall={true} onHandDetected={handleAnswer} />}

      {gameState === 'playing' && (
        <div style={{ textAlign: 'center', marginTop: '20px', zIndex: 10 }}>
          <h2 style={{ fontSize: '2em', margin: '0' }}>Câu {questionCount}/10</h2>
          {currentQuestion && (
            <div style={{ padding: '10px 40px', borderRadius: '25px', textAlign: 'center', margin: '5px auto' }}>
              <h3 style={{fontSize: '2.5em', marginBottom: '10px'}}>{currentQuestion.text}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, auto)', justifyContent: 'center', gap: '15px', fontSize: '5em' }}>
                {currentQuestion.emojis.map((emoji, index) => <span key={index}>{emoji}</span>)}
              </div>
            </div>
          )}
          <h2 style={{ fontSize: '2.2em' }}>Điểm: {currentScore}</h2>
          <div style={{ height: '50px' }}>
            {feedback && <h3 style={{ fontSize: '1.8em', color: feedback.includes('Đúng') ? 'green' : 'red', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '5px 20px', borderRadius: '10px' }}>{feedback}</h3>}
          </div>
        </div>
      )}

      {/* GIAO DIỆN KẾT THÚC VỚI HUY HIỆU KHO BÁU */}
      {gameState === 'ended' && (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '40px', borderRadius: '30px', textAlign: 'center', marginTop: '5vh', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 300 }}>
          <h1 style={{ fontSize: '3em', color: '#d4af37' }}>{currentScore >= 8 ? 'XUẤT SẮC!' : 'HOÀN THÀNH!'}</h1>
          
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Ảnh nhân vật chiến thắng */}
            <img src={selectedChar.img} alt="Winner" style={{ width: '150px', marginBottom: '10px' }} />
            {/* HUY HIỆU KHO BÁU HIỆN RA Ở ĐÂY */}
            <div style={{ marginTop: '10px' }}>
                <img src={TREASURE_BADGE_URL} alt="Treasure Badge" style={{ width: '120px', animation: 'bounce 1s infinite' }} />
                <p style={{ fontWeight: 'bold', color: '#b8860b' }}>BẠN ĐÃ NHẬN ĐƯỢC HUY HIỆU KHO BÁU!</p>
            </div>
          </div>

          <h2 style={{ fontSize: '2.5em' }}>Tổng điểm: {currentScore}/10</h2>
          <button onClick={() => setGameState('lobby')} style={{ padding: '15px 50px', fontSize: '1.2em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Chơi lại</button>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default JackSparrowGame;