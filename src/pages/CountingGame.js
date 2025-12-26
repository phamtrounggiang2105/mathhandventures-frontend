import React, { useState, useCallback, useEffect } from 'react';
import GameLayout from '../components/GameLayout'; 
import axios from 'axios';
import '../App.css';
import { useNavigate } from 'react-router-dom';

// --- 1. Cấu hình API ---
const api = axios.create({
  baseURL: 'https://mathhandventures-backend.onrender.com/api',
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

// --- 2. Dữ liệu và Logic sinh câu hỏi ---
const ANIMALS = [
  { emoji: '🐶', type: 'con vật' }, { emoji: '🐱', type: 'con vật' },
  { emoji: '🐭', type: 'con vật' }, { emoji: '🐰', type: 'con vật' },
  { emoji: '🦊', type: 'con vật' }, { emoji: ' BEAR ', type: 'con vật' },
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
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState('lobby'); // lobby, playing, ended
  const [timeLeft, setTimeLeft] = useState(120); // 120 giây = 2 phút
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // --- 4. Xử lý thời gian (Countdown) ---
  useEffect(() => {
    let timer;
    if (gameStarted && gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameStarted) {
      handleFinishGame();
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameState, timeLeft]);

  const handleStartGame = () => {
    setGameStarted(true);
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
      await api.post('/game/save', { 
        gameType: 'Đếm số', 
        score: finalScore 
      });
    } catch (err) {
      console.error('Lỗi khi lưu điểm:', err);
    }
  };

  const handleFinishGame = () => {
    saveGameResult(currentScore);
    setGameState('ended');
    setIsAnswering(false);
  };

  const handleAnswer = useCallback((detectedNumber) => {
    if (isAnswering || !gameStarted || gameState !== 'playing') return; 
    
    setIsAnswering(true);
    const isCorrect = (detectedNumber === currentQuestion.answer);

    if (isCorrect) {
      setFeedback('Đúng rồi! +1 điểm');
      setCurrentScore(prev => prev + 1);
    } else {
      setFeedback(`Sai rồi! Đáp án đúng là ${currentQuestion.answer}.`);
    }

    if (questionCount === 10) {
      setTimeout(() => {
        handleFinishGame();
      }, 2000);
    } else {
      setTimeout(() => {
        setQuestionCount(prev => prev + 1);
        setCurrentQuestion(generateQuestion());
        setIsAnswering(false);
        setFeedback('');
      }, 2000);
    }
  }, [currentQuestion, questionCount, currentScore, gameStarted, isAnswering, gameState]); 

  // --- 5. Giao diện ---

  // Màn hình chờ (Lobby)
  if (!gameStarted || gameState === 'lobby') {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Game Đếm Số</h1>
          <p>Bạn có 2 phút để đếm chính xác 10 câu hỏi. Sẵn sàng chưa?</p>
          <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', marginTop: '40px' }}>
            <button 
              onClick={handleStartGame}
              style={{ padding: '20px 60px', fontSize: '1.5em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Bắt đầu đếm
            </button>
            <button 
              onClick={() => navigate('/')} 
              style={{ padding: '15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.2em' }}
            >
              Quay lại sảnh chính
            </button>
          </div>
        </header>
      </div>
    );
  }

  // Màn hình trong Game và Kết quả
  return (
    <div style={{ 
      backgroundImage: "url('/images/practice_background.jpg')", 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      height: '100vh', 
      width: '100vw',
      position: 'relative'
    }}>
      {/* Nút Thoát */}
      <button
        onClick={() => setGameStarted(false)}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          backgroundColor: '#ff4d4d', color: 'white',
          border: 'none', borderRadius: '5px', padding: '10px 15px',
          fontWeight: 'bold', cursor: 'pointer', zIndex: 201
        }}
      >
        Thoát
      </button>

      {/* Đồng hồ đếm ngược */}
      <div style={{
        position: 'absolute', top: '20px', left: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px 25px', borderRadius: '20px',
        fontSize: '2em', fontWeight: 'bold', 
        color: timeLeft <= 15 ? 'red' : 'black',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}>
        ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>

      <GameLayout onHandDetected={handleAnswer}>
        {gameState === 'playing' ? (
          <>
            <h1 style={{ fontSize: '3em', color: '#282c34', margin: '10px 0' }}>Câu hỏi {questionCount}/10</h1>
            
            {currentQuestion && (
              <div style={{
                backgroundColor: 'rgba(14, 85, 227, 0.85)', 
                color: 'white', 
                padding: '30px',
                borderRadius: '20px',
                border: '4px solid #3f75c5ff',
                textAlign: 'center',
                maxWidth: '85%',
                margin: '20px auto',
                boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
              }}>
                <h3 style={{fontSize: '2.2em', marginTop: 0}}>{currentQuestion.text}</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, auto)',
                  justifyContent: 'center',
                  gap: '15px',
                  fontSize: '5.5em', 
                }}>
                  {currentQuestion.emojis.map((emoji, index) => (
                    <span key={index} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>{emoji}</span>
                  ))}
                </div>
              </div>
            )}
            
            <h2 style={{ fontSize: '2.5em', color: '#c4169eff', backgroundColor: 'rgba(255,255,255,0.7)', padding: '5px 20px', borderRadius: '15px' }}>
              Điểm số: {currentScore}
            </h2>
            
            <div style={{ height: '50px' }}>
              {feedback && (
                <h3 style={{ 
                    fontSize: '2em', 
                    color: feedback.includes('Đúng') ? 'green' : '#d32f2f',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    padding: '5px 20px',
                    borderRadius: '10px'
                }}>
                  {feedback}
                </h3>
              )}
            </div>
          </>
        ) : (
          /* Màn hình kết thúc */
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '40px',
            borderRadius: '30px', textAlign: 'center', marginTop: '5vh',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h1 style={{ fontSize: '3.5em', margin: '0 0 10px 0' }}>{timeLeft === 0 ? 'HẾT GIỜ!' : 'HOÀN THÀNH!'}</h1>
            <img src="/images/victory_minions.jpg" alt="Victory" style={{ width: '280px', borderRadius: '20px', margin: '15px' }} />
            <h2 style={{ fontSize: '3em' }}>Kết quả: {currentScore}/10 điểm</h2>
            <button 
              onClick={() => { setGameStarted(false); setGameState('lobby'); }} 
              style={{ padding: '15px 50px', fontSize: '1.5em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Chơi lại
            </button>
          </div>
        )}
      </GameLayout>
    </div>
  );
}

export default CountingGame;