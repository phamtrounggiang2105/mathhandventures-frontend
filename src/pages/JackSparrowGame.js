import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameLayout from '../components/GameLayout';
import axios from 'axios';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import JackSparrowLobbyBackground from '../assets/jack_lobby_background.png'; 

// --- 1. Cấu hình tài nguyên ---
const MAP_IMAGE_URL = '/game_assets/Bando_moi_nhat.jpg';
const TREASURE_BADGE_URL = '/Huy_hieu/Huy_hieu_kho_bau.png'; // Huy hiệu mới bổ sung
const VICTORY_IMAGE_URL = '/game_assets/thuyentruongberuongkhobau.png';

const PLAYER_WIDTH = 50; 

// Danh sách nhân vật (Bổ sung theo Mục 4)
const CHARACTERS = [
  { id: 'lucfi', name: 'Luffy', img: '/nhan_vat_game/lucfi.png' },
  { id: 'cam_ba_kiem', name: 'Zoro', img: '/nhan_vat_game/cam_ba_kiem.png' },
  { id: 'songoku', name: 'Songoku', img: '/nhan_vat_game/songoku.png' },
  { id: 'ngo_khong', name: 'Ngộ Không', img: '/nhan_vat_game/ngo_khong.png' },
  { id: 'pikachu', name: 'Pikachu', img: '/nhan_vat_game/pikachu.png' },
  { id: 'doraemon', name: 'Doraemon', img: '/nhan_vat_game/doraemon.png' },
  { id: 'tuan_loc', name: 'Tuần Lộc', img: '/nhan_vat_game/tuan%20loc.png' },
];

const MILESTONE_COORDS = [
  { x: 220, y: 183 }, { x: 168, y: 266 }, { x: 414, y: 290 }, 
  { x: 230, y: 418 }, { x: 343, y: 460 }, { x: 576, y: 455 }, 
  { x: 701, y: 318 }, { x: 638, y: 278 }, { x: 613, y: 172 }, 
  { x: 617, y: 56 },  { x: 466, y: 145 },
];

// --- 2. Logic API & Sinh câu hỏi (GIỮ NGUYÊN 100% LOGIC CỦA BẠN) ---
const api = axios.create({ baseURL: 'http://localhost:5000/api' });
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
  return { text: `Có bao nhiêu ${chosenItem.type} trên màn hình?`, emojis: Array(answer).fill(chosenItem.emoji), answer: answer, type: 'counting' };
};

const generateMathQuestion = () => {
  let num1 = Math.floor(Math.random() * 11), num2 = Math.floor(Math.random() * 11);
  const op = Math.random() < 0.5 ? '+' : '-';
  let questionText = '', answer = 0;
  if (op === '+') {
    if (num1 + num2 > 10) return generateMathQuestion();
    const sum = num1 + num2;
    const qType = Math.floor(Math.random() * 3); // Giữ đủ 3 dạng toán cộng
    if (qType === 0) { questionText = `${num1} + ${num2} = ?`; answer = sum; }
    else if (qType === 1) { questionText = `${num1} + ? = ${sum}`; answer = num2; }
    else { questionText = `? + ${num2} = ${sum}`; answer = num1; }
  } else {
    if (num1 < num2) [num1, num2] = [num2, num1];
    const difference = num1 - num2;
    const qType = Math.floor(Math.random() * 2); // Giữ đủ 2 dạng toán trừ
    if (qType === 0) { questionText = `${num1} - ${num2} = ?`; answer = difference; }
    else { questionText = `${num1} - ? = ${difference}`; answer = num2; }
  }
  return { text: questionText, emojis: null, answer: answer, type: 'math' };
};

const generateNewQuestion = () => Math.random() < 0.5 ? generateMathQuestion() : generateCountingQuestion();

// --- 3. Component Chính ---
function JackSparrowGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('lobby'); 
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]); // Nhân vật được chọn
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null); 
  const [feedback, setFeedback] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [jackPosition, setJackPosition] = useState(MILESTONE_COORDS[0]);
  const [showStartMessage, setShowStartMessage] = useState(false);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const mapContainerRef = useRef(null); 

  // Logic tính mapSize giữ nguyên
  useEffect(() => {
    const calculateMapSize = () => {
      const availableWidth = window.innerWidth - 340; 
      const availableHeight = window.innerHeight - 100; 
      const ratio = 1000 / 675;
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
      setFeedback('Mốc 1: Bắt đầu hành trình!');
    }, 3000); 
  };

  const handleAnswer = useCallback((detectedNumber) => {
    if (isAnswering || gameState !== 'playing' || !currentQuestion) return; 
    setIsAnswering(true);
    const isCorrect = (detectedNumber === currentQuestion.answer);
    setCurrentQuestion(null); 
    const ratio = mapSize.width / 1000; 

    if (isCorrect) {
      setFeedback('Đúng rồi! Đang di chuyển...');
      let nextIdx = currentMilestoneIndex;

      // Logic mốc 10 cần 3 câu (Giữ nguyên của bạn)
      if (currentMilestoneIndex === 9) {
        const newCount = questionsAnswered + 1;
        setQuestionsAnswered(newCount);
        if (newCount === 3) {
          nextIdx = 10;
          setJackPosition({ x: MILESTONE_COORDS[10].x * ratio, y: MILESTONE_COORDS[10].y * ratio });
          setTimeout(() => setGameState('won'), 2000);
          // Lưu game với Huy hiệu
          axios.post('http://localhost:5000/api/game/save', { gameType: 'Jack Sparrow', score: 1, trophy: 'Huy hiệu kho báu' });
        } else {
          setFeedback(`Đúng! Đã xong ${newCount}/3 câu mốc cuối.`);
          setTimeout(() => { setCurrentQuestion(generateNewQuestion()); setIsAnswering(false); }, 2000);
          return;
        }
      } else {
        nextIdx = currentMilestoneIndex + 1;
      }

      setJackPosition({ x: MILESTONE_COORDS[nextIdx].x * ratio, y: MILESTONE_COORDS[nextIdx].y * ratio });
      setCurrentMilestoneIndex(nextIdx);
      setTimeout(() => {
        setFeedback(`Đã đến Mốc ${nextIdx + 1}.`);
        setCurrentQuestion(generateNewQuestion());
        setIsAnswering(false);
      }, 2000);
    } else {
      // Logic phạt quay về Checkpoint (Giữ nguyên của bạn)
      const returnIdx = currentMilestoneIndex < 4 ? 0 : 4;
      setFeedback(currentMilestoneIndex < 4 ? 'Sai rồi! Về Mốc 1!' : 'Sai rồi! Về Mốc 5!');
      setTimeout(() => {
        setCurrentMilestoneIndex(returnIdx);
        setJackPosition({ x: MILESTONE_COORDS[returnIdx].x * ratio, y: MILESTONE_COORDS[returnIdx].y * ratio });
        setQuestionsAnswered(0);
        setCurrentQuestion(generateNewQuestion());
        setIsAnswering(false);
      }, 2500); 
    }
  }, [currentQuestion, questionsAnswered, currentMilestoneIndex, gameState, isAnswering, mapSize.width]);

  // --- GIAO DIỆN ---

  if (gameState === 'lobby') {
    return (
      <div style={{
          backgroundImage: `url(${JackSparrowLobbyBackground})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          height: '100vh', width: '100vw', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
      }}>
        <h1 style={{ textShadow: '2px 2px 8px black', fontSize: '3em', marginBottom: '10px' }}>CHỌN NHÂN VẬT</h1>
        
        {/* Khu vực chọn nhân vật mới bổ sung */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '20px' }}>
          {CHARACTERS.map(char => (
            <div key={char.id} onClick={() => setSelectedChar(char)} style={{
                padding: '10px', cursor: 'pointer', textAlign: 'center',
                border: selectedChar.id === char.id ? '4px solid #4CAF50' : '2px solid transparent',
                borderRadius: '15px', backgroundColor: selectedChar.id === char.id ? 'rgba(255,255,255,0.2)' : 'transparent'
            }}>
              <img src={char.img} alt={char.name} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              <p style={{ margin: '5px 0 0', fontWeight: 'bold' }}>{char.name}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={handleStartGame} style={{ padding: '1em 3em', fontSize: '1.2em', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Bắt đầu</button>
          <button onClick={() => navigate('/games')} style={{ padding: '1em 3em', fontSize: '1.2em', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Quay lại</button>
        </div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="App"><header className="App-header" style={{backgroundColor: '#1a1a1a'}}>
        <h1 style={{color: '#FFD700'}}>BẠN ĐÃ CHIẾN THẮNG KHO BÁU!</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px' }}>
            <img src={selectedChar.img} alt="Hero" style={{ width: '150px' }} />
            <img src={TREASURE_BADGE_URL} alt="Huy hiệu" style={{ width: '150px', animation: 'bounce 1s infinite' }} />
        </div>
        <img src={VICTORY_IMAGE_URL} alt="Victory" style={{ width: '300px', borderRadius: '20px' }} />
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <button onClick={() => setGameState('lobby')} style={{ padding: '15px 40px', fontSize: '1.2em', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Chơi lại</button>
          <button onClick={() => navigate('/games')} style={{ padding: '15px 40px', fontSize: '1.2em', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Thoát</button>
        </div>
        <style>{`@keyframes bounce { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-20px)} }`}</style>
      </header></div>
    );
  }

  return (
    <GameLayout onHandDetected={handleAnswer}>
      <div ref={mapContainerRef} style={{
          position: 'relative', width: `${mapSize.width}px`, height: `${mapSize.height}px`,
          backgroundImage: `url(${MAP_IMAGE_URL})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
      }}>
        {/* Nhân vật chính - Giữ nguyên chính xác CSS transform của bạn */}
        <img 
          src={selectedChar.img} 
          alt="Player"
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
        
        {showStartMessage && (
          <div style={{ position: 'absolute', left: `${jackPosition.x}px`, top: `${jackPosition.y - PLAYER_WIDTH}px`, transform: 'translateX(-50%)', backgroundColor: 'white', color: 'black', padding: '5px 10px', borderRadius: '5px', border: '1px solid black', zIndex: 20, whiteSpace: 'nowrap' }}>
            Bắt đầu chơi nào!
          </div>
        )}

        {currentQuestion && !showStartMessage && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '80%', maxWidth: '700px', backgroundColor: 'rgba(40, 44, 52, 0.9)', 
            padding: '20px', borderRadius: '10px', color: 'white', textAlign: 'center',
            zIndex: 30, border: '2px solid #61dafb'
          }}>
            <h2>Mốc {currentMilestoneIndex + 1} / 10</h2>
            <div style={{ fontSize: '3em', fontWeight: 'bold' }}>{currentQuestion.text}</div>
            {currentQuestion.emojis && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, auto)', justifyContent: 'center', gap: '0.2em', fontSize: '3em' }}>
                {currentQuestion.emojis.map((emoji, index) => (<span key={index}>{emoji}</span>))}
              </div>
            )}
          </div>
        )}
        
        {feedback && !showStartMessage && (
          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', color: feedback.includes('Sai') ? 'red' : 'lime', backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px', fontSize: '1.2em', zIndex: 40 }}>
            {feedback}
          </div>
        )}
      </div>
    </GameLayout>
  );
}

export default JackSparrowGame;