import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; 
import HandInput from '../components/HandInput'; 

const api = axios.create({ baseURL: 'https://mathhandventures-backend.onrender.com/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

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

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleFinishGame(currentScore); 
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, currentScore]);

  const handleStartGame = (selectedLevel) => {
    setLevel(selectedLevel);
    setGameState('playing');
    setQuestionCount(1);
    setCurrentScore(0);
    setTimeLeft(120);
    setFeedback('');
    setIsAnswering(false);
    setCurrentQuestion(generateQuestion(selectedLevel));
  };

  const saveGameResult = async (finalScore) => {
    try {
      await api.post('/game/save', { 
        gameType: `Học toán`, 
        score: finalScore 
      });
      console.log("Đã lưu điểm thành công:", finalScore);
    } catch (err) {
      console.error('Lỗi khi lưu điểm:', err);
    }
  };

  const handleFinishGame = (finalScore) => {
    saveGameResult(finalScore);
    setGameState('ended');
    setIsAnswering(false);
  };

  const handleAnswer = useCallback((detectedNumber) => {
    if (isAnswering || gameState !== 'playing') return; 
    setIsAnswering(true);
    const isCorrect = (detectedNumber === currentQuestion.answer);
    const newScore = isCorrect ? currentScore + 1 : currentScore;

    if (isCorrect) {
      setFeedback('Đúng rồi! +1 điểm');
      setCurrentScore(newScore);
    } else {
      setFeedback(`Sai rồi! Đáp án là ${currentQuestion.answer}.`);
    }
    
    if (questionCount === 10) {
      setTimeout(() => handleFinishGame(newScore), 2000);
    } else {
      setTimeout(() => {
        setQuestionCount(prev => prev + 1);
        setCurrentQuestion(generateQuestion(level));
        setIsAnswering(false);
        setFeedback('');
      }, 2000);
    }
  }, [currentQuestion, questionCount, currentScore, gameState, isAnswering, level]);

  if (gameState === 'lobby') {
    return (
      <div className="App"><header className="App-header">
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', marginTop: '100px' }}>
          <button onClick={() => handleStartGame(1)} style={{ padding: '20px 40px', fontSize: '1.4em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer' }}>Cộng và trừ 0 - 5</button>
          <button onClick={() => handleStartGame(2)} style={{ padding: '20px 40px', fontSize: '1.4em', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer' }}>Cộng và trừ 5 - 10</button>
          <button onClick={() => navigate('/')} style={{ padding: '10px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Quay lại sảnh chính</button>
        </div>
      </header></div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundImage: `url('/images/practice_background.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', paddingTop: '10vh', color: '#3E352F' }}>
      <button onClick={() => setGameState('lobby')} style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', fontWeight: 'bold', cursor: 'pointer', zIndex: 201 }}>Thoát</button>
      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px 25px', borderRadius: '20px', fontSize: '2em', fontWeight: 'bold', color: timeLeft <= 15 ? 'red' : 'black', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
      {gameState === 'playing' && <HandInput isSmall={true} onHandDetected={handleAnswer} />}
      {gameState === 'playing' && (
        <>
          <h2 style={{ fontSize: '2em' }}>Câu {questionCount}/10</h2>
          {currentQuestion && <div style={{ fontSize: '6.5em', fontWeight: 'bold', margin: '20px 0', backgroundColor: 'rgba(255,255,255,0.7)', padding: '20px 60px', borderRadius: '25px' }}>{currentQuestion.text}</div>}
          <h2 style={{ fontSize: '2.5em' }}>Điểm: {currentScore}</h2>
          {feedback && <h3 style={{ fontSize: '2em', color: feedback.includes('Đúng') ? 'green' : '#d32f2f' }}>{feedback}</h3>}
        </>
      )}
      {gameState === 'ended' && (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5em' }}>KẾT THÚC!</h1>
          <h2 style={{ fontSize: '3em' }}>Bạn đạt: {currentScore}/10 điểm</h2>
          <button onClick={() => setGameState('lobby')} style={{ padding: '15px 50px', backgroundColor: '#4CAF50', color: 'white', borderRadius: '15px', cursor: 'pointer' }}>Chơi lại</button>
        </div>
      )}
    </div>
  );
}
export default PracticeModule;