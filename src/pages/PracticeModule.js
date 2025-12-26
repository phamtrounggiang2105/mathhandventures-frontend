import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; 
import HandInput from '../components/HandInput'; 

// --- 1. Cấu hình tài nguyên & API ---
const BACKGROUND_IMAGE_URL = '/images/practice_background.jpg';
const VICTORY_IMAGE_URL = '/images/victory_minions.jpg';

const api = axios.create({ baseURL: 'https://mathhandventures-backend.onrender.com/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

// --- 2. Logic sinh câu hỏi ---
const generateQuestion = (level) => {
  const isLevel1 = (level === 1);
  const minResult = isLevel1 ? 0 : 6; 
  const maxResult = isLevel1 ? 5 : 10;
  
  const op = Math.random() < 0.5 ? '+' : '-';
  let questionText = '', answer = 0;

  if (op === '+') {
    let n1 = Math.floor(Math.random() * (maxResult + 1));
    let n2 = Math.floor(Math.random() * (maxResult + 1));
    if (n1 + n2 < minResult || n1 + n2 > maxResult) return generateQuestion(level);
    
    const sum = n1 + n2;
    const qType = Math.floor(Math.random() * 3); 
    if (qType === 0) { questionText = `${n1} + ${n2} = ?`; answer = sum; }
    else if (qType === 1) { questionText = `${n1} + ? = ${sum}`; answer = n2; }
    else { questionText = `? + ${n2} = ${sum}`; answer = n1; }
  } else {
    let n1 = Math.floor(Math.random() * (maxResult + 1));
    let n2 = Math.floor(Math.random() * (maxResult + 1));
    if (n1 < n2) [n1, n2] = [n2, n1]; 
    const diff = n1 - n2;
    if (n1 < minResult || n1 > maxResult) return generateQuestion(level);

    const qType = Math.floor(Math.random() * 2); 
    if (qType === 0) { questionText = `${n1} - ${n2} = ?`; answer = diff; }
    else { questionText = `${n1} - ? = ${diff}`; answer = n2; }
  }
  return { text: questionText, answer: answer };
};

function PracticeModule() {
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState('lobby'); 
  const [level, setLevel] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120); 
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [hasSaved, setHasSaved] = useState(false); // Thêm cờ để tránh lưu 2 lần

  // --- Xử lý thời gian ---
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleFinishGame(); 
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleStartGame = (selectedLevel) => {
    setLevel(selectedLevel);
    setGameState('playing');
    setQuestionCount(1);
    setCurrentScore(0);
    setTimeLeft(120);
    setFeedback('');
    setIsAnswering(false);
    setHasSaved(false); // Reset cờ lưu khi chơi mới
    setCurrentQuestion(generateQuestion(selectedLevel));
  };

  // --- CẬP NHẬT QUAN TRỌNG: Hàm lưu kết quả ---
  const saveGameResult = async (finalScore) => {
    if (hasSaved) return; // Nếu đã lưu rồi thì không lưu nữa
    setHasSaved(true);

    try {
      console.log("Đang lưu điểm Học toán...");
      await api.post('/game/save', { 
        // Đặt tên gameType cố định là 'Học toán' để Profile dễ nhận diện
        gameType: 'Học toán', 
        score: finalScore 
      });
      console.log("Lưu điểm Học toán thành công!");
    } catch (err) {
      console.error('Lỗi khi lưu điểm Học toán:', err);
      setHasSaved(false); // Nếu lỗi thì cho phép lưu lại
    }
  };

  const handleFinishGame = () => {
    saveGameResult(currentScore); // Gọi lưu điểm
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
      setFeedback(`Sai rồi! Đáp án là ${currentQuestion.answer}.`);
    }
    
    if (questionCount === 10) {
      setTimeout(() => {
        handleFinishGame();
      }, 2000);
    } else {
      setTimeout(() => {
        setQuestionCount(prev => prev + 1);
        setCurrentQuestion(generateQuestion(level));
        setIsAnswering(false);
        setFeedback('');
      }, 2000);
    }
  }, [currentQuestion, questionCount, currentScore, gameState, isAnswering, level]);

  // --- Giao diện (Giữ nguyên phần Render của bạn) ---
  if (gameState === 'lobby') {
    return (
      <div className="App">
        <header className="App-header">
          <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', marginTop: '100px' }}>
            <button onClick={() => handleStartGame(1)} style={{ padding: '20px 40px', fontSize: '1.4em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer' }}>
              Cộng và trừ 0 - 5
            </button>
            <button onClick={() => handleStartGame(2)} style={{ padding: '20px 40px', fontSize: '1.4em', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer' }}>
              Cộng và trừ 5 - 10
            </button>
            <button onClick={() => navigate('/')} style={{ padding: '10px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
              Quay lại sảnh chính
            </button>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundImage: `url('${BACKGROUND_IMAGE_URL}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', paddingTop: '10vh', color: '#3E352F' }}>
      <button onClick={() => setGameState('lobby')} style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', fontWeight: 'bold', cursor: 'pointer', zIndex: 201 }}>
        Thoát
      </button>
      <div style={{ position: 'absolute', top: '70px', left: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px 25px', borderRadius: '20px', fontSize: '2em', fontWeight: 'bold', color: timeLeft <= 15 ? 'red' : 'black', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
      {gameState === 'playing' && <HandInput isSmall={true} onHandDetected={handleAnswer} />}
      {gameState === 'playing' && (
        <>
          <h2 style={{ fontSize: '2em', marginBottom: '10px' }}>Câu {questionCount}/10</h2>
          {currentQuestion && (
            <div style={{ fontSize: '6.5em', fontWeight: 'bold', margin: '20px 0', backgroundColor: 'rgba(255,255,255,0.7)', padding: '20px 60px', borderRadius: '25px' }}>
              {currentQuestion.text}
            </div>
          )}
          <h2 style={{ fontSize: '2.5em' }}>Điểm: {currentScore}</h2>
          <div style={{ height: '50px' }}>
            {feedback && <h3 style={{ fontSize: '2em', color: feedback.includes('Đúng') ? 'green' : '#d32f2f', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '5px 20px', borderRadius: '10px' }}>{feedback}</h3>}
          </div>
        </>
      )}
      {gameState === 'ended' && (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '40px', borderRadius: '30px', textAlign: 'center', marginTop: '5vh', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: '3.5em' }}>{timeLeft === 0 ? 'HẾT GIỜ!' : 'XONG RỒI!'}</h1>
          <img src={VICTORY_IMAGE_URL} alt="Victory" style={{ width: '280px', borderRadius: '20px' }} />
          <h2 style={{ fontSize: '3em' }}>Bạn đạt: {currentScore}/10 điểm</h2>
          <button onClick={() => setGameState('lobby')} style={{ padding: '15px 50px', fontSize: '1.5em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Chơi lại</button>
        </div>
      )}
    </div>
  );
}

export default PracticeModule;