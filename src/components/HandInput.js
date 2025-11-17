import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as S from '@tensorflow/tfjs'; // Import với tên 'S'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import drawHand from '../utilities'; // (File này đã có từ GĐ 1)

// --- (Phần 1: Logic đếm ngón tay - đã cập nhật) ---
const countFingers = (keypoints, handedness) => {
  let count = 0;
  const FINGER_TIPS = [8, 12, 16, 20]; // Ngón trỏ, giữa, áp út, út
  const FINGER_PIPS = [6, 10, 14, 18]; // Khớp giữa

  // 1. Đếm ngón cái
  const THUMB_TIP = 4;
  const THUMB_MCP = 2;
  if (handedness === 'Right') {
    if (keypoints[THUMB_TIP].x < keypoints[THUMB_MCP].x) count++;
  } else {
    if (keypoints[THUMB_TIP].x > keypoints[THUMB_MCP].x) count++;
  }

  // 2. Đếm 4 ngón còn lại
  for (let i = 0; i < 4; i++) {
    if (keypoints[FINGER_TIPS[i]].y < keypoints[FINGER_PIPS[i]].y) {
      count++;
    }
  }
  return count;
};

// --- (Phần 2: Component chính) ---
function HandInput({ onHandDetected, isSmall = false }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);

  const [detectedFingers, setDetectedFingers] = useState(null);
  const stableAnswerRef = useRef(null); 
  const timerRef = useRef(null); 

  // 1. Tải mô hình
  const loadHandPoseModel = async () => {
    try {
      console.log("Đang tải mô hình HandInput...");
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'lite',
        maxHands: 2, 
      };
      const detector = await handPoseDetection.createDetector(model, detectorConfig);
      console.log("Đã tải mô hình HandInput.");
      setModel(detector);
    } catch (err) {
      console.error("Lỗi tải mô hình:", err);
    }
  };

  useEffect(() => {
    loadHandPoseModel();
  }, []);

  // 2. Mở webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Lỗi mở webcam:", err);
    }
  };

  useEffect(() => {
    startWebcam();
  }, []);

  // 3. Hàm nhận diện (chạy liên tục)
  const detectHands = useCallback(async () => {
    
    // --- (SỬA LỖI GETCONTEXT Ở ĐÂY) ---
    // Thêm !canvasRef.current
    if (!model || !webcamRef.current || !canvasRef.current || webcamRef.current.readyState !== 4) {
      return; 
    }

    const video = webcamRef.current;
    const { videoWidth, videoHeight } = video;
    if (videoWidth === 0 || videoHeight === 0) return; 

    webcamRef.current.width = videoWidth;
    webcamRef.current.height = videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const hands = await model.estimateHands(video);
    let totalFingerCount = 0;

    if (hands.length > 0) {
      for (const hand of hands) {
        totalFingerCount += countFingers(hand.keypoints, hand.handedness);
      }
      setDetectedFingers(totalFingerCount); 
    } else {
      setDetectedFingers(null); 
    }

    const ctx = canvasRef.current.getContext('2d');
    drawHand(hands, ctx);

  }, [model]);

  // 4. Logic chờ 1.5 giây
  useEffect(() => {
    if (detectedFingers === null) {
      clearTimeout(timerRef.current);
      stableAnswerRef.current = null;
      return;
    }
    if (detectedFingers === stableAnswerRef.current) {
      return;
    }
    clearTimeout(timerRef.current);
    stableAnswerRef.current = detectedFingers;
    timerRef.current = setTimeout(() => {
      console.log(`Đã chốt đáp án: ${detectedFingers}`);
      onHandDetected(detectedFingers);
    }, 1500); 
  }, [detectedFingers, onHandDetected]);

  // 5. Chạy vòng lặp nhận diện
  useEffect(() => {
    if (model) {
      const interval = setInterval(() => {
        detectHands();
      }, 100); 
      return () => clearInterval(interval);
    }
  }, [model, detectHands]);


  // --- (Phần 3: Giao diện) ---
  const containerStyle = isSmall ? {
    // Facecam
    position: 'absolute',
    top: '70px',
    right: '20px',
    width: '250px',
    height: '188px',
    border: '3px solid #ff4d4d',
    borderRadius: '10px',
    overflow: 'hidden',
    zIndex: 200,
  } : {
    // Toàn màn hình
    position: 'relative',
    width: '640px',
    height: '480px',
    border: '2px solid #61dafb',
    borderRadius: '8px',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      <video
        ref={webcamRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)',
          objectFit: 'cover',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          padding: '5px',
          borderRadius: '5px',
          zIndex: 201
      }}>
        Đang nhận diện: {detectedFingers !== null ? detectedFingers : '...'}
      </div>
    </div>
  );
}

export default HandInput;