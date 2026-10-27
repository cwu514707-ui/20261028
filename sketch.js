// 足球規則小達人 - p5.js 測驗系統

let gameState = "start"; // 遊戲狀態: "start" (開始畫面), "play" (作答中), "feedback" (回饋畫面), "result" (結算畫面)
let currentQ = 0;        // 目前題目索引
let score = 0;           // 總得分
let selectedOption = -1; // 使用者點選的選項
let isCorrect = false;   // 判斷是否答對

let whistleSound;        // 哨音音效

// 題目資料庫
const QUESTIONS = [
  {
    q: "當進攻球員傳球瞬間，接球的攻擊球員前方「只剩下對方守門員」，這時候算越位嗎？",
    options: ["算越位", "不算越位", "看裁判心情"],
    answer: 1, // 對應 "不算越位"
    explain: "越位規定需要前方有少於兩名防守球員。若前方還有守門員或至少一名防守球員就不算越位！"
  },
  {
    q: "球員在禁區內故意用手把即將進球的球拍掉，裁判除了判十二碼罰球，還會給什麼牌？",
    options: ["黃牌", "紅牌", "不給牌"],
    answer: 1, // 對應 "紅牌"
    explain: "這是嚴重的「阻止明顯進球得分機會（DOGSO）」，會直接被出示紅牌驅逐出場！"
  },
  {
    q: "比賽中發生一般的小犯規（例如普通拉球衣服），裁判會判罰哪一種球？",
    options: ["自由球（可直接射門或傳球）", "十二碼罰球", "重新開球"],
    answer: 0, // 對應 "自由球"
    explain: "一般犯規多判自由球；若在禁區內嚴重犯規才會判十二碼罰球。"
  },
  {
    q: "球場上裁判對某位球員舉起「黃牌」代表什麼意思？",
    options: ["警告一次", "直接驅逐出場", "換人休息"],
    answer: 0, // 對應 "警告一次"
    explain: "黃牌是裁判的嚴重警告；如果同一場比賽累積兩張黃牌，就會變成紅牌罰下場。"
  }
];

function preload() {
  // 載入音效檔案（確保 media 資料夾中有 whistle.mp3，若暫時沒有可先註解掉這行）
  // whistleSound = loadSound('media/whistle.mp3');
}

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(240, 248, 240); // 淺綠色系球場風格底色

  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "play" || gameState === "feedback") {
    drawQuizScreen();
  } else if (gameState === "result") {
    drawResultScreen();
  }
}

// 1. 開始畫面
function drawStartScreen() {
  // 標題背景裝飾
  fill(43, 138, 87);
  rect(0, 0, width, 120);

  fill(255);
  textSize(36);
  text("⚽ 足球規則小達人 ⚽", width / 2, 60);

  // 遊戲說明
  fill(50);
  textSize(18);
  text("挑戰 4 道足球實戰情境題，看看你是不是合格的球評！", width / 2, 220);
  text("點擊下方按鈕即可開始挑戰", width / 2, 260);

  // 開始按鈕
  fill(217, 72, 15);
  stroke(255);
  strokeWeight(2);
  rectMode(CENTER);
  rect(width / 2, 380, 220, 60, 10);

  fill(255);
  noStroke();
  textSize(22);
  text("開始挑戰", width / 2, 380);
}

// 2. 作答與回饋畫面
function drawQuizScreen() {
  // 頂部進度列
  fill(43, 138, 87);
  rectMode(CORNER);
  rect(0, 0, width, 60);

  fill(255);
  textSize(20);
  textAlign(LEFT, CENTER);
  text(`第 ${currentQ + 1} 題 / 共 ${QUESTIONS.length} 題`, 30, 30);
  textAlign(RIGHT, CENTER);
  text(`目前得分：${score}`, width - 30, 30);
  textAlign(CENTER, CENTER); // 恢復預設置中

  // 題目區塊
  fill(255);
  stroke(200);
  rectMode(CENTER);
  rect(width / 2, 160, 720, 120, 10);

  fill(50);
  textSize(18);
  text(QUESTIONS[currentQ].q, width / 2, 160, 680, 100);

  // 選項按鈕
  let qData = QUESTIONS[currentQ];
  for (let i = 0; i < qData.options.length; i++) {
    let btnY = 270 + i * 75;
    
    // 按鈕顏色變化
    if (gameState === "feedback") {
      if (i === qData.answer) {
        fill(40, 167, 69); // 正確答案顯示綠色
      } else if (i === selectedOption) {
        fill(220, 53, 69); // 點錯的選項顯示紅色
      } else {
        fill(240);
      }
    } else {
      fill(255);
      stroke(43, 138, 87);
      strokeWeight(2);
    }

    rect(width / 2, btnY, 720, 55, 8);

    fill(gameState === "feedback" && (i === qData.answer || i === selectedOption) ? 255 : 50);
    noStroke();
    textSize(16);
    text(qData.options[i], width / 2, btnY);
  }

  // 如果在回饋狀態，顯示解析與按鈕提示
  if (gameState === "feedback") {
    fill(255, 243, 205);
    stroke(255, 238, 186);
    rect(width / 2, 490, 720, 70, 8);

    fill(133, 100, 4);
    noStroke();
    textSize(14);
    text("💡 解析：" + qData.explain, width / 2, 490, 680, 60);

    // 下一題按鈕提示
    fill(217, 72, 15);
    rect(width / 2 - 100, 560, 200, 35, 5);
    fill(255);
    textSize(14);
    text("點擊任意處進入下一題", width / 2, 560);
  }
}

// 3. 成績結算畫面
function drawResultScreen() {
  fill(43, 138, 87);
  rectMode(CORNER);
  rect(0, 0, width, 120);

  fill(255);
  textSize(36);
  textAlign(CENTER, CENTER);
  text("🏆 全場比賽結束！", width / 2, 60);

  fill(50);
  textSize(24);
  text(`你的最終得分：${score} / ${QUESTIONS.length}`, width / 2, 220);

  // 根據分數給予評語
  textSize(20);
  let comment = "";
  if (score === QUESTIONS.length) {
    comment = "太神啦！簡直是金靴獎級別的足球通！⚽🔥";
  } else if (score >= 2) {
    comment = "表現不錯！對足球規則已經相當熟悉囉！👏";
  } else {
    comment = "還需要多看幾場比賽來熟悉規則喔！加油！💪";
  }
  fill(217, 72, 15);
  text(comment, width / 2, 290);

  // 再玩一次按鈕
  fill(43, 138, 87);
  rectMode(CENTER);
  rect(width / 2, 400, 220, 60, 10);

  fill(255);
  textSize(20);
  text("再玩一次", width / 2, 400);
}

// 滑鼠點擊互動事件
function mousePressed() {
  if (gameState === "start") {
    if (mouseX > width / 2 - 110 && mouseX < width / 2 + 110 && mouseY > 350 && mouseY < 410) {
      gameState = "play";
      currentQ = 0;
      score = 0;
    }
  } else if (gameState === "play") {
    let qData = QUESTIONS[currentQ];
    for (let i = 0; i < qData.options.length; i++) {
      let btnY = 270 + i * 75;
      if (mouseX > width / 2 - 360 && mouseX < width / 2 + 360 && mouseY > btnY - 27 && mouseY < btnY + 27) {
        selectedOption = i;
        isCorrect = (selectedOption === qData.answer);
        if (isCorrect) {
          score++;
        }
        gameState = "feedback";
      }
    }
  } else if (gameState === "feedback") {
    currentQ++;
    if (currentQ < QUESTIONS.length) {
      gameState = "play";
      selectedOption = -1;
    } else {
      gameState = "result";
    }
  } else if (gameState === "result") {
    if (mouseX > width / 2 - 110 && mouseX < width / 2 + 110 && mouseY > 370 && mouseY < 430) {
      gameState = "start";
      currentQ = 0;
      score = 0;
      selectedOption = -1;
    }
  }
}