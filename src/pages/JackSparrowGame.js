import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameLayout from '../components/GameLayout';
import axios from 'axios';
import '../App.css';
import { useNavigate } from 'react-router-dom';
// Ảnh nền Sảnh chờ MỚI
import JackSparrowLobbyBackground from '../assets/jack_lobby_background.png'; 

// --- (TÊN FILE CỦA BẠN) ---
const MAP_IMAGE_URL = '/game_assets/Bando_moi_nhat.jpg';
const PLAYER_IMAGE_URL = '/game_assets/thuyentruong.png';
const VICTORY_IMAGE_URL = '/game_assets/thuyentruongberuongkhobau.png';

const PLAYER_WIDTH = 50; // Chốt 50px

// --- (11 TỌA ĐỘ CUỐI CÙNG - V4) ---
const MILESTONE_COORDS = [
  { x: 220, y: 183 }, // Mốc 1
  { x: 168, y: 266 }, // Mốc 2
  { x: 414, y: 290 }, // Mốc 3
  { x: 230, y: 418 }, // Mốc 4
  { x: 343, y: 460 }, // Mốc 5 - CHECKPOINT
  { x: 576, y: 455 }, // Mốc 6
  { x: 701, y: 318 }, // Mốc 7
  { x: 638, y: 278 }, // Mốc 8
  { x: 613, y: 172 }, // Mốc 9
  { x: 617, y: 56 },  // Mốc 10
  { x: 466, y: 145 }, // Rương Vàng
];

// (API Helper và Sinh câu hỏi... code này không đổi)
const api = axios.create({ baseURL: 'https://mathhandventures-backend.onrender.com/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});
const ANIMALS = [{ emoji: '🐶', type: 'con vật' },{ emoji: '🐱', type: 'con vật' },{ emoji: '🐭', type: 'con vật' },{ emoji: '🐰', type: 'con vật' }];
const FRUITS = [{ emoji: '🍎', type: 'trái cây' },{ emoji: '🍌', type: 'trái cây' },{ emoji: '🍊', type: 'trái cây' },{ emoji: '🍇', type: 'trái cây' }];
const generateCountingQuestion = () => {
  const answer = Math.floor(Math.random() * 10) + 1;
  let category = Math.random() < 0.5 ? FRUITS : ANIMALS;
  let chosenItem = category[Math.floor(Math.random() * category.length)];
  const { emoji, type } = chosenItem;
  const questionEmojis = Array(answer).fill(emoji);
  const questionText = `Có bao nhiêu ${type} trên màn hình?`;
  return { text: questionText, emojis: questionEmojis, answer: answer, type: 'counting' };
};
const generateMathQuestion = () => {
  let num1 = Math.floor(Math.random() * 11), num2 = Math.floor(Math.random() * 11);
  const op = Math.random() < 0.5 ? '+' : '-';
  let questionText = '', answer = 0;
  if (op === '+') {
    if (num1 + num2 > 10) return generateMathQuestion();
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
  return { text: questionText, emojis: null, answer: answer, type: 'math' };
};
const generateNewQuestion = () => {
  return Math.random() < 0.5 ? generateMathQuestion() : generateCountingQuestion();
};

// --- (COMPONENT CHÍNH) ---
function JackSparrowGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('lobby'); 
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null); 
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [jackPosition, setJackPosition] = useState(MILESTONE_COORDS[0]);
  const [showStartMessage, setShowStartMessage] = useState(false);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const mapContainerRef = useRef(null); 

  useEffect(() => {
    const calculateMapSize = () => {
      const availableWidth = window.innerWidth - 340; 
      const availableHeight = window.innerHeight - 100; 
      const originalWidth = 1000;
      const originalHeight = 675;
      const ratio = originalWidth / originalHeight;
      let newWidth = availableWidth;
      let newHeight = newWidth / ratio;
      if (newHeight > availableHeight) {
        newHeight = availableHeight;
        newWidth = newHeight * ratio;
      }
      setMapSize({ width: newWidth, height: newHeight });
    };
    calculateMapSize(); 
    window.addEventListener('resize', calculateMapSize); 
    return () => window.removeEventListener('resize', calculateMapSize);
  }, []);

  const saveGame = async (finalScore, trophy) => {
    try {
      await api.post('/game/save', { gameType: 'Jack Sparrow', score: finalScore, trophy });
    } catch (err) { console.error('Lỗi khi lưu điểm:', err); }
  };

  const handleStartGame = () => {
    setCurrentMilestoneIndex(0);
    const ratio = mapSize.width / 1000; 
    setJackPosition({ x: MILESTONE_COORDS[0].x * ratio, y: MILESTONE_COORDS[0].y * ratio });
    setQuestionsAnswered(0);
    setIsAnswering(false);
    setGameState('playing');
    setShowStartMessage(true);
    setCurrentQuestion(null); 
    setFeedback('');           
    setTimeout(() => {
      setShowStartMessage(false);
      setCurrentQuestion(generateNewQuestion());
      setFeedback('Mốc 1: Giúp Jack Sparrow lấy tàu!');
    }, 3000); 
  };
  
  const handleGoToLobby = () => navigate('/games'); 

  const handleAnswer = useCallback((detectedNumber) => {
    if (isAnswering || gameState !== 'playing') return; 
    setIsAnswering(true);
    const isCorrect = (detectedNumber === currentQuestion.answer);
    setCurrentQuestion(null); 
    const ratio = mapSize.width / 1000; 

    if (isCorrect) {
      setFeedback('Đúng rồi! Jack đang di chuyển...');
      let nextMilestoneIndex = currentMilestoneIndex;
      if (currentMilestoneIndex === 9) { // Mốc 10
        const newAnswerCount = questionsAnswered + 1;
        setQuestionsAnswered(newAnswerCount);
        if (newAnswerCount === 3) {
          nextMilestoneIndex = 10;
          setFeedback('ĐÚNG CẢ 3 CÂU! Đang đi lấy rương...');
          setTimeout(() => setGameState('won'), 2000);
          saveGame(1, 'Huy hiệu kho báu');
        } else {
          setFeedback(`Đúng! Cần 3 câu, bạn đã xong ${newAnswerCount}/3 câu.`);
          setTimeout(() => {
            setCurrentQuestion(generateNewQuestion());
            setIsAnswering(false);
          }, 2000);
          return; 
        }
      } else {
        nextMilestoneIndex = currentMilestoneIndex + 1;
      }
      setJackPosition({
        x: MILESTONE_COORDS[nextMilestoneIndex].x * ratio,
        y: MILESTONE_COORDS[nextMilestoneIndex].y * ratio
      });
      setCurrentMilestoneIndex(nextMilestoneIndex);
      setTimeout(() => {
        if (gameState === 'playing') {
          setFeedback(`Đã đến Mốc ${nextMilestoneIndex + 1}. Câu hỏi mới!`);
          setCurrentQuestion(generateNewQuestion());
          setIsAnswering(false);
        }
      }, 2000); 
    } else {
      setFeedback(`Sai rồi! Đáp án là ${currentQuestion.answer}.`);
      let returnMilestoneIndex;
      if (currentMilestoneIndex < 4) { // Mốc 1-4
        returnMilestoneIndex = 0; // Về Mốc 1
        setFeedback(`Sai rồi! Quay về Mốc 1!`);
      } else { // Mốc 5-10
        returnMilestoneIndex = 4; // Về Mốc 5
        setFeedback(`Sai rồi! Quay về Mốc 5!`);
      }
      setTimeout(() => {
        setCurrentMilestoneIndex(returnMilestoneIndex);
        setJackPosition({
          x: MILESTONE_COORDS[returnMilestoneIndex].x * ratio,
          y: MILESTONE_COORDS[returnMilestoneIndex].y * ratio
        });
        setQuestionsAnswered(0);
        setCurrentQuestion(generateNewQuestion());
        setFeedback(`Bạn đã quay về Mốc ${returnMilestoneIndex + 1}.`);
        setIsAnswering(false);
      }, 2500); 
    }
  }, [currentQuestion, questionsAnswered, currentMilestoneIndex, gameState, isAnswering, mapSize.width]);

  // --- (GIAO DIỆN) ---
  
  // --- (SỬA LẠI THEO YÊU CẦU MỚI) Màn hình Sảnh chờ ---
  if (gameState === 'lobby') {
    return (
      // Div ngoài cùng
      <div style={{
          backgroundImage: `url(${JackSparrowLobbyBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh', // <-- SỬA LỖI TRÀN
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end', // Căn nút xuống dưới
          boxSizing: 'border-box'
      }}>
        
        {/* KHỐI LUẬT CHƠI ĐÃ BỊ XÓA (THEO YÊU CẦU CỦA BẠN) */}

        {/* Các nút (Bắt đầu, Quay lại) */}
        <div style={{ display: 'flex', gap: '40px', zIndex: 10, marginBottom: '200px' }}>
          <button
            onClick={handleStartGame}
            style={{
              padding: '1em 2em',
              fontSize: '1.2em',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 5px 10px rgba(0, 0, 0, 0.3)'
            }}
          >
            Bắt đầu
          </button>
          <button
            onClick={() => navigate('/games')}
            style={{
              padding: '1em 2em',
              fontSize: '1.2em',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 5px 10px rgba(0, 0, 0, 0.3)'
            }}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }
  
  // Màn hình Thắng
  if (gameState === 'won') {
     return (
      <div className="App"><header className="App-header" style={{backgroundColor: '#B3E5FC'}}>
        <h1 style={{color: '#282c34'}}>Chúc mừng bạn đã lụm được kho báu - hẹ hẹ</h1>
        <img src={VICTORY_IMAGE_URL} alt="Thắng!" style={{width: '300px', height: 'auto', margin: '20px'}} />
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setGameState('lobby')} style={{ padding: '20px 40px', fontSize: '1.5em', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
            Chơi lại
          </button>
          <button onClick={handleGoToLobby} style={{ padding: '20px 40px', fontSize: '1.5em', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
            Thoát
          </button>
        </div>
      </header></div>
    );
  }

  // Màn hình "Trong Game"
  return (
    <GameLayout onHandDetected={handleAnswer}>
      <div 
        ref={mapContainerRef} 
        style={{
          position: 'relative', 
          width: `${mapSize.width}px`, 
          height: `${mapSize.height}px`, 
          backgroundImage: `url(${MAP_IMAGE_URL})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
      }}>

        {/* --- Jack Sparrow --- */}
        <img 
          src={PLAYER_IMAGE_URL} 
          alt="Jack"
          style={{
            position: 'absolute',
            width: `${PLAYER_WIDTH}px`,
            height: `${PLAYER_WIDTH}px`,
            left: `${jackPosition.x}px`,
            top: `${jackPosition.y}px`,
            transform: 'translate(calc(-50% + 1.6px), calc(-50% - 2.5px))',
            transition: 'all 1.5s ease-in-out', 
            zIndex: 10,
          }}
        />
        
        {/* --- Bong bóng "Bắt đầu" --- */}
        {showStartMessage && (
          <div style={{
            position: 'absolute',
            left: `${jackPosition.x}px`,
            top: `${jackPosition.y - PLAYER_WIDTH}px`, 
            transform: 'translateX(-50%)',
            backgroundColor: 'white', color: 'black',
            padding: '5px 10px', borderRadius: '5px',
            border: '1px solid black', zIndex: 20,
            whiteSpace: 'nowrap'
          }}>
            Bắt đầu chơi nào!
          </div>
        )}

        {/* --- Khung Câu hỏi --- */}
        {currentQuestion && !showStartMessage && (
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%', 
            maxWidth: '700px',
            backgroundColor: 'rgba(40, 44, 52, 0.9)', 
            padding: '20px', borderRadius: '10px',
            color: 'white', textAlign: 'center',
            zIndex: 30, border: '2px solid #61dafb'
          }}>
            <h2 style={{marginTop: 0}}>Mốc {currentMilestoneIndex + 1} / 10</h2>
            {currentQuestion.type === 'math' && (
              <div style={{ fontSize: '3em', fontWeight: 'bold' }}>{currentQuestion.text}</div>
            )}
            {currentQuestion.type === 'counting' && (
              <>
                <h3>{currentQuestion.text}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, auto)', justifyContent: 'center', gap: '0.2em', fontSize: '3em' }}>
                  {currentQuestion.emojis.map((emoji, index) => (<span key={index}>{emoji}</span>))}
                </div>
              </>
            )}
          </div>
        )}
        
         {/* Feedback */}
        {feedback && !showStartMessage && (
          <div style={{
            position: 'absolute',
            bottom: '10px', left: '50%',
            transform: 'translateX(-50%)',
            color: isAnswering ? (feedback.startsWith('Đúng') || feedback.startsWith('Đã đến') ? 'lime' : 'red') : '#61dafb',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '10px', borderRadius: '5px',
            fontSize: '1.2em', zIndex: 40
          }}>
            {feedback}
          </div>
        )}
      </div>
    </GameLayout>
  );
}

export default JackSparrowGame;