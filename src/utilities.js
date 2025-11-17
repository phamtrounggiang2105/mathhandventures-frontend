// utilities.js
// Hàm này dùng để vẽ các điểm và đường nối lên tay

const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

// Hàm vẽ
const drawHand = (hands, ctx) => {
  // Lặp qua mỗi bàn tay (dù chúng ta chỉ đặt maxHands = 1)
  for (let i = 0; i < hands.length; i++) {
    const hand = hands[i];
    const keypoints = hand.keypoints;

    // Lật ngược canvas theo chiều ngang (để khớp với video)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-ctx.canvas.width, 0);

    // Vẽ các khớp (joints)
    for (let j = 0; j < keypoints.length; j++) {
      const { x, y } = keypoints[j];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "aqua";
      ctx.fill();
    }

    // Vẽ các đường nối (xương)
    const fingers = Object.keys(fingerJoints);
    for (let k = 0; k < fingers.length; k++) {
      const finger = fingers[k];
      const joints = fingerJoints[finger];
      for (let l = 0; l < joints.length - 1; l++) {
        const p1 = keypoints[joints[l]];
        const p2 = keypoints[joints[l + 1]];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    // Khôi phục lại trạng thái canvas
    ctx.restore();
  }
};
export default drawHand;