import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; 
import HandInput from '../components/HandInput'; 

// --- (TÊN FILE NỀN & ẢNH THẮNG) ---
const BACKGROUND_IMAGE_URL = '/images/practice_background.jpg';
const VICTORY_IMAGE_URL = '/images/victory_minions.jpg'; // Ảnh Minions mới

// (API Helper, Sinh câu hỏi - không đổi)
const api = axios.create({ baseURL: 'https://mathhandventures-backend.onrender.com/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});
const generateQuestion = () => {
  let num1 = Math.floor(Math.random() * 11), num2 = Math.floor(Math.random() * 11);
  const op = Math.random() < 0.5 ? '+' : '-';
  let questionText = '', answer = 0;
  if (op === '+') {
    if (num1 + num2 > 10) return generateQuestion();
    const sum = num1 + num2;
    const qType = Math.floor(Math.random() * 3);
    if (qType === 0) { questionText = `${num1} + ${num2} = ?`; answer = sum; }
    else if (qType === 1) { questionText = `${num1} + ? = ${sum}`; answer = num2; }
    else { questionText = `? + ${num2} = ${sum}`; answer = num1; }
  } else {
    if (num1 < num2) [num1, num2] = [num2, num1];
    const difference = num1 - num2;
    const qType = Math.floor(Math.random() * 2);
    if (qType === 0) { questionText = `${num1} - ${num2} = ?`; answer = difference; }
    else { questionText = `${num1} - ? = ${difference}`; answer = num2; }
  }
  return { text: questionText, answer: answer };
};

// --- (COMPONENT CHÍNH) ---
function PracticeModule() {
  const navigate = useNavigate();
  
  // --- (YÊU CẦU MỚI) Thay đổi State ---
  // 'lobby' = Sẵn sàng, 'playing' = Đang chơi, 'ended' = Hiện điểm
  const [gameState, setGameState] = useState('lobby'); 
  const [finalScore, setFinalScore] = useState(0); // Lưu điểm cuối
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // (Code logic game)
  const handleStartGame = () => {
    setGameState('playing'); // Chuyển sang "Đang chơi"
    setQuestionCount(1);
    setCurrentScore(0);
    setFeedback('');
    setIsAnswering(false);
    setCurrentQuestion(generateQuestion());
  };
  const saveGame = async (finalScore) => {
    try {
      await api.post('/game/save', { gameType: 'Học toán', score: finalScore });
      console.log('Đã lưu điểm thành công!');
    } catch (err) { console.error('Lỗi khi lưu điểm:', err); }
  };
  
  // --- (YÊU CẦU MỚI) Sửa handleAnswer để hiện màn hình Thắng ---
  const handleAnswer = useCallback((detectedNumber) => {
    if (isAnswering || gameState !== 'playing') return; 
    setIsAnswering(true);
    let isCorrect = (detectedNumber === currentQuestion.answer);
    if (isCorrect) {
      setFeedback('Đúng rồi! +50 điểm');
      setCurrentScore(prevScore => prevScore + 50);
    } else {
      setFeedback(`Sai rồi! Đáp án đúng là ${currentQuestion.answer}.`);
    }
    
    // Kiểm tra kết thúc
    if (questionCount === 20) {
      const finalScoreValue = isCorrect ? currentScore + 50 : currentScore;
      
      setTimeout(() => {
        // --- (THAY ĐỔI) ---
        // alert(`Hoàn thành! Tổng điểm: ${finalScoreValue}.`); (Xóa alert)
        saveGame(finalScoreValue);
        setFinalScore(finalScoreValue); // Lưu điểm cuối
        setGameState('ended'); // Chuyển sang màn hình "Kết thúc"
        setIsAnswering(false);
        // --- (KẾT THÚC THAY ĐỔI) ---
      }, 2000);
    } else {
      setTimeout(() => {
        setQuestionCount(prevCount => prevCount + 1);
        setCurrentQuestion(generateQuestion());
        setIsAnswering(false);
      }, 2000);
    }
  }, [currentQuestion, questionCount, currentScore, gameState, isAnswering]); // Thêm gameState

  // --- (GIAO DIỆN) ---
  
  // 1. Màn hình "Sẵn sàng" (Lobby)
  if (gameState === 'lobby') {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Are You Ready</h1>
          <p>Sẵn sàng luyện tập 20 câu hỏi?</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={handleStartGame} 
              style={{ padding: '20px 40px', fontSize: '1.5em', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
            >
              Sẵn sàng
            </button>
            <button 
              onClick={() => navigate('/')} 
              style={{ padding: '20px 40px', fontSize: '1.5em', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
            >
              Ứ đâu!
            </button>
          </div>
        </header>
      </div>
    );
  }

  // 2. Màn hình "Trong Game" (Playing) hoặc "Kết thúc" (Ended)
  // (Cả hai đều dùng chung nền khung gỗ)
  return (
    // Div Nền (Full-screen)
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: `url('${BACKGROUND_IMAGE_URL}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: '25vh',
      color: '#3E352F',
    }}>

      {/* Nút Thoát */}
      <button
        onClick={() => setGameState('lobby')} // Quay về màn hình "Sẵn sàng"
        style={{
          position: 'absolute', top: '20px', right: '20px',
          backgroundColor: '#ff4d4d', color: 'white',
          border: 'none', borderRadius: '5px',
          padding: '10px 15px', fontWeight: 'bold',
          cursor: 'pointer', zIndex: 201
        }}
      >
        Thoát
      </button>

      {/* Webcam nhỏ */}
      {/* (Chỉ hiện webcam khi đang chơi) */}
      {gameState === 'playing' && (
        <HandInput 
          isSmall={true}
          onHandDetected={handleAnswer}
        />
      )}

      {/* --- (YÊU CẦU MỚI) Nội dung thay đổi theo gameState --- */}
      
      {/* 2a. Nếu đang chơi (Playing) */}
      {gameState === 'playing' && (
        <>
          <h1 style={{ fontSize: '3em', margin: 0 }}>
            Câu hỏi {questionCount}/20
          </h1>
          {currentQuestion && (
            <div style={{ fontSize: '5em', fontWeight: 'bold', margin: '40px' }}>
              {currentQuestion.text}
            </div>
          )}
          <h2 style={{ fontSize: '2.5em' }}>
            Điểm số: {currentScore}
          </h2>
          {feedback && (
            <h3 style={{
                fontSize: '2em', 
                color: feedback.startsWith('Đúng') ? 'green' : 'red',
                height: '30px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '5px'
            }}>
              {isAnswering ? feedback : ''}
            </h3>
          )}
        </>
      )}

      {/* 2b. Nếu đã kết thúc (Ended) - Màn hình Chúc mừng */}
      {gameState === 'ended' && (
        <>
          <h1 style={{ fontSize: '3em', margin: 0 }}>
            Hoàn thành!
          </h1>
          <img 
            src={VICTORY_IMAGE_URL} 
            alt="Chúc mừng"
            style={{ 
              width: '300px', 
              height: 'auto', 
              margin: '20px', 
              borderRadius: '15px' 
            }}
          />
          <h2 style={{ fontSize: '2.5em' }}>
            Tổng điểm: {finalScore}
          </h2>
          {/* Nút Chơi lại */}
          <button 
            onClick={handleStartGame} // Bắt đầu lại game
            style={{ 
              padding: '15px 30px', 
              fontSize: '1.2em', 
              backgroundColor: 'green', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              cursor: 'pointer' 
            }}
          >
            Chơi lại
          </button>
        </>
      )}

    </div>
  );
}

export default PracticeModule;