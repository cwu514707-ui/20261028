<!
          setTimeout(() => synthSoundWrong.stop(), 200);
        }DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>足球規則小達人 - 多媒體測驗系統</title>
  <!-- 載入 Tailwind CSS 與 p5.js CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/addons/p5.sound.min.js"></script>
  <style>
    body {
      font-family: 'Microsoft JhengHei', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
      -webkit-user-select: none;
    }
    #canvas-container canvas {
      border-radius: 16px;
      box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.45), 0 8px 12px -6px rgba(0, 0, 0, 0.3);
      display: block;
    }
  </style>
</head>
<body class="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 select-none">

  <!-- 標題欄 (統一球場草綠色 #2B8A57 主調) -->
  <header class="text-center mb-4 w-full max-w-4xl">
    <div class="bg-[#2B8A57] py-4 px-6 rounded-2xl shadow-lg border border-emerald-600/40 flex flex-col items-center justify-center">
      <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-wider flex items-center justify-center gap-3 drop-shadow-md">
        <span>⚽</span> 足球規則小達人 <span>⚽</span>
      </h1>
      <p class="text-emerald-100 text-xs md:text-sm mt-1 font-medium tracking-wide">
        互動式多媒體測驗系統 ‧ 掌握越位、紅黃牌與罰球關鍵判決
      </p>
    </div>
  </header>

  <!-- p5.js 畫布容器 -->
  <main id="canvas-container" class="flex justify-center items-center w-full max-w-4xl"></main>

  <!-- 頁尾輔助提示 -->
  <footer class="mt-4 text-slate-400 text-xs text-center font-medium">
    <p>💡 點擊選項即可作答；答題後點擊畫面任意處即可輕鬆進入下一題。</p>
  </footer>

  <script>
    // ==========================================
    // 足球規則小達人 - p5.js 核心程式邏輯
    // ==========================================

    let gameState = "start"; // 遊戲狀態: "start", "play", "feedback", "result"
    let currentQ = 0;
    let score = 0;
    let selectedOption = -1;
    let isCorrect = false;

    // Web Audio 音效合成器
    let synthSoundCorrect, synthSoundWrong;

    // 主配色標竿
    const THEME_GREEN = "#2B8A57";
    const THEME_ORANGE = "#D9480F";

    // 完整題目與多媒体圖示資料庫
    const QUESTIONS = [
      {
        q: "當進攻球員傳球瞬間，接球者前方「只剩下對方守門員」，這算越位嗎？",
        options: ["1. 算越位（接球者前方防守球員少於 2 人）", "2. 不算越位（只要對方場上有守門員即可）", "3. 不一定，由主審裁判隨機決定"],
        answer: 0,
        explain: "越位規則規定：傳球瞬間，接球球員與對方底線之間必須至少有 2 名防守球員（守門員通常算 1 人）。若只剩守門員，即構成越位！",
        type: "offside_diagram"
      },
      {
        q: "球員在禁區內故意用手把對方即將射入球門的球拍掉，裁判會如何判決？",
        options: ["1. 口頭警告並給予對方邊界球", "2. 出示黃牌警告 + 判罰間接自由球", "3. 出示紅牌驅逐出場 + 判罰 12 碼罰球 (PK)"],
        answer: 2,
        explain: "此舉屬於嚴重的「手球破壞明顯進球得分機會 (DOGSO)」，裁判將直接出示紅牌罰下場，並給予對方 12 碼罰球！",
        type: "red_card_diagram"
      },
      {
        q: "比賽中於禁區外發生一般拉扯或絆人犯規，裁判會如何重新開啟比賽？",
        options: ["1. 判罰直接自由球（可直接射門或傳球）", "2. 判罰十二碼罰球 (PK)", "3. 雙方球員至中圈跳球爭奪"],
        answer: 0,
        explain: "禁區外的一般肢體犯規判罰「自由球」；只有在防守方自己的禁區內發生犯規，才會判罰 12 碼罰球！",
        type: "foul_diagram"
      },
      {
        q: "足球場上裁判對某位球員舉起「黃牌」代表什麼意思？",
        options: ["1. 嚴重警告一次（單場累積 2 張將轉為紅牌離場）", "2. 離場休息 10 分鐘後可再進場比賽", "3. 直接取消全隊該場比賽資格"],
        answer: 0,
        explain: "黃牌代表嚴重警告。若同一名球員在單場比賽中吃到第 2 張黃牌，將合併為紅牌並強制驅逐出場！",
        type: "yellow_card_diagram"
      }
    ];

    function setup() {
      const canvas = createCanvas(800, 600);
      canvas.parent('canvas-container');
      textAlign(CENTER, CENTER);

      try {
        synthSoundCorrect = new p5.Oscillator('triangle');
        synthSoundWrong = new p5.Oscillator('sawtooth');
      } catch (e) {
        console.log("Audio Notice: System muted or p5.sound loading fallback active.");
      }
    }

    function draw() {
      background(245, 248, 245); // 柔和底色

      if (gameState === "start") {
        drawStartScreen();
      } else if (gameState === "play" || gameState === "feedback") {
        drawQuizScreen();
      } else if (gameState === "result") {
        drawResultScreen();
      }
    }

    // ------------------------------------------
    // 1. 開始畫面
    // ------------------------------------------
    function drawStartScreen() {
      // 頂部草皮 Banner（色號與主視覺調和一致）
      fill(43, 138, 87);
      noStroke();
      rectMode(CORNER);
      rect(0, 0, width, 140);

      fill(255);
      textSize(34);
      textStyle(BOLD);
      text("⚽ 足球規則小達人 ⚽", width / 2, 70);

      // 主畫面引導文字
      fill(50);
      textSize(17);
      textStyle(NORMAL);
      text("觀看精彩足球情境圖解，輕鬆學會越位、紅黃牌與罰球規則！", width / 2, 220);

      // 足球視覺圖案
      push();
      translate(width / 2, 310);
      fill(255);
      stroke(40);
      strokeWeight(3);
      ellipse(0, 0, 75, 75);
      fill(40);
      polygon(0, 0, 16, 5); // 足球中央五邊形
      pop();

      // 開始按鈕
      let btnHover = isHovering(width / 2, 440, 230, 60);
      fill(btnHover ? color(240, 85, 20) : color(217, 72, 15));
      stroke(255);
      strokeWeight(2);
      rectMode(CENTER);
      rect(width / 2, 440, 230, 60, 12);

      fill(255);
      noStroke();
      textSize(22);
      textStyle(BOLD);
      text("開始挑戰", width / 2, 440);
    }

    // ------------------------------------------
    // 2. 作答與回饋畫面
    // ------------------------------------------
    function drawQuizScreen() {
      // 頂部狀態 Banner
      fill(43, 138, 87);
      rectMode(CORNER);
      noStroke();
      rect(0, 0, width, 55);

      fill(255);
      textSize(16);
      textStyle(BOLD);
      textAlign(LEFT, CENTER);
      text(`第 ${currentQ + 1} 題 / 共 ${QUESTIONS.length} 題`, 25, 27);
      textAlign(RIGHT, CENTER);
      text(`目前得分：${score}`, width - 25, 27);
      textAlign(CENTER, CENTER);

      // 題目文字展示區塊
      fill(255);
      stroke(210);
      strokeWeight(1);
      rectMode(CENTER);
      rect(width / 2, 105, 740, 65, 10);

      fill(40);
      textSize(15);
      textStyle(BOLD);
      text(QUESTIONS[currentQ].q, width / 2, 105, 710, 55);

      // 畫布中央多媒體情境圖示渲染
      drawScenarioMedia(QUESTIONS[currentQ].type);

      // 選項按鈕列表渲染
      let qData = QUESTIONS[currentQ];
      for (let i = 0; i < qData.options.length; i++) {
        let btnY = 375 + i * 54;
        
        if (gameState === "feedback") {
          if (i === qData.answer) {
            fill(40, 167, 69); // 對應正確答案選項：高亮綠
          } else if (i === selectedOption) {
            fill(220, 53, 69); // 選錯選項：顯眼紅
          } else {
            fill(238);
          }
        } else {
          let hover = isHovering(width / 2, btnY, 740, 46);
          fill(hover ? color(230, 245, 235) : color(255));
          stroke(43, 138, 87);
          strokeWeight(2);
        }

        rectMode(CENTER);
        rect(width / 2, btnY, 740, 46, 8);

        fill(gameState === "feedback" && (i === qData.answer || i === selectedOption) ? 255 : 40);
        noStroke();
        textSize(15);
        textStyle(NORMAL);
        text(qData.options[i], width / 2, btnY);
      }

      // 答題反饋與說明卡片
      if (gameState === "feedback") {
        fill(255, 244, 210);
        stroke(245, 220, 150);
        strokeWeight(1);
        rect(width / 2, 550, 740, 60, 8);

        fill(120, 85, 0);
        noStroke();
        textSize(13);
        textStyle(NORMAL);
        text("💡 解析：" + qData.explain, width / 2, 538, 710, 36);

        fill(217, 72, 15);
        textSize(12);
        textStyle(BOLD);
        text("【點擊螢幕任意處繼續下一題】", width / 2, 566);
      }
    }

    // ------------------------------------------
    // 3. 多媒體情境圖示精細繪製 (drawScenarioMedia)
    // ------------------------------------------
    function drawScenarioMedia(type) {
      push();
      // 球場背景卡片
      fill(34, 112, 62);
      stroke(255);
      strokeWeight(2);
      rectMode(CENTER);
      rect(width / 2, 235, 740, 160, 10);

      if (type === "offside_diagram") {
        // 越位線標記 (亮黃虛線)
        stroke(255, 215, 0);
        strokeWeight(2);
        drawingContext.setLineDash([6, 6]);
        line(520, 165, 520, 305);
        drawingContext.setLineDash([]); // 恢復實線

        // 球門與禁區線
        noFill();
        stroke(255);
        rect(715, 235, 45, 100);

        // 防守方陣容（藍色球員）
        fill(50, 130, 255);
        noStroke();
        ellipse(715, 235, 18, 18); // 守門員 (GK)
        ellipse(520, 185, 18, 18); // 後衛防守球員 A (定義越位線)
        ellipse(570, 275, 18, 18); // 後衛防守球員 B

        // 進攻方陣容（紅色球員）
        fill(255, 60, 60);
        ellipse(310, 235, 18, 18); // 傳球者
        ellipse(560, 225, 18, 18); // 接球者 (越位位置)

        // 足球與傳球軌跡線
        fill(255);
        ellipse(325, 235, 10, 10);
        stroke(255, 255, 0);
        strokeWeight(1.5);
        drawingContext.setLineDash([4, 4]);
        line(330, 235, 545, 225);
        drawingContext.setLineDash([]);

        // 文字說明
        fill(255);
        noStroke();
        textSize(12);
        textStyle(BOLD);
        text("黃色虛線為越位線：接球者傳球瞬間越過最後第 2 名防守者 ➔ 越位！", width / 2, 303);

      } else if (type === "red_card_diagram") {
        // 紅牌圖案
        fill(220, 53, 69);
        stroke(255);
        strokeWeight(2);
        rect(width / 2 - 110, 225, 50, 75, 5);

        fill(255);
        noStroke();
        textSize(36);
        text("✋⚽", width / 2 + 50, 220);

        fill(255);
        textSize(13);
        textStyle(BOLD);
        text("禁區內故意用手擋出必進球 ➔ 判罰紅牌離場 + 12 碼罰球 (PK)", width / 2, 303);

      } else if (type === "foul_diagram") {
        // 自由球犯規圖案
        fill(255, 215, 0);
        noStroke();
        ellipse(width / 2, 220, 14, 14);

        noFill();
        stroke(255, 255, 0);
        strokeWeight(2);
        ellipse(width / 2, 220, 32, 32);

        fill(255);
        noStroke();
        textSize(13);
        textStyle(BOLD);
        text("禁區外一般拉扯犯規 ➔ 裁判吹哨判罰「直接自由球」", width / 2, 303);

      } else if (type === "yellow_card_diagram") {
        // 黃牌圖案
        fill(255, 193, 7);
        stroke(255);
        strokeWeight(2);
        rect(width / 2, 220, 55, 80, 5);

        fill(40);
        textSize(12);
        textStyle(BOLD);
        text("YELLOW", width / 2, 220);

        fill(255);
        textSize(13);
        textStyle(BOLD);
        text("黃牌警告一次：單場比賽累積兩張黃牌將變紅牌驅逐出場！", width / 2, 303);
      }
      pop();
    }

    // ------------------------------------------
    // 4. 結算畫面
    // ------------------------------------------
    function drawResultScreen() {
      fill(43, 138, 87);
      rectMode(CORNER);
      noStroke();
      rect(0, 0, width, 140);

      fill(255);
      textSize(36);
      textStyle(BOLD);
      text("🏆 全場比賽結束！ 🏆", width / 2, 70);

      fill(40);
      textSize(24);
      text(`你的最終得分：${score} / ${QUESTIONS.length}`, width / 2, 220);

      textSize(18);
      let comment = "";
      if (score === QUESTIONS.length) {
        comment = "太神啦！簡直是金靴獎級別的足球權威！⚽🔥";
      } else if (score >= 2) {
        comment = "表現不錯！對足球規則已經相當熟悉囉！👏";
      } else {
        comment = "還需要多看幾場比賽來熟悉規則喔！加油！💪";
      }
      fill(217, 72, 15);
      text(comment, width / 2, 280);

      // 再玩一次按鈕
      let btnHover = isHovering(width / 2, 410, 230, 60);
      fill(btnHover ? color(34, 120, 70) : color(43, 138, 87));
      stroke(255);
      strokeWeight(2);
      rectMode(CENTER);
      rect(width / 2, 410, 230, 60, 12);

      fill(255);
      noStroke();
      textSize(20);
      textStyle(BOLD);
      text("再玩一次", width / 2, 410);
    }

    // ------------------------------------------
    // 互動與邊界判定輔助函數
    // ------------------------------------------
    function isHovering(x, y, w, h) {
      return mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;
    }

    function mousePressed() {
      if (gameState === "start") {
        if (isHovering(width / 2, 440, 230, 60)) {
          gameState = "play";
          currentQ = 0;
          score = 0;
          playSoundEffect(true);
        }
      } else if (gameState === "play") {
        let qData = QUESTIONS[currentQ];
        for (let i = 0; i < qData.options.length; i++) {
          let btnY = 375 + i * 54;
          if (isHovering(width / 2, btnY, 740, 46)) {
            selectedOption = i;
            isCorrect = (selectedOption === qData.answer);
            if (isCorrect) score++;
            playSoundEffect(isCorrect);
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
        if (isHovering(width / 2, 410, 230, 60)) {
          gameState = "start";
          currentQ = 0;
          score = 0;
          selectedOption = -1;
        }
      }
    }

    function polygon(x, y, radius, npoints) {
      let angle = TWO_PI / npoints;
      beginShape();
      for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius;
        let sy = y + sin(a) * radius;
        vertex(sx, sy);
      }
      endShape(CLOSE);
    }

    function playSoundEffect(correct) {
      try {
        if (correct && synthSoundCorrect) {
          synthSoundCorrect.start();
          synthSoundCorrect.freq(587.33); // D5 提示聲
          setTimeout(() => synthSoundCorrect.stop(), 150);
        } else if (!correct && synthSoundWrong) {
          synthSoundWrong.start();
          synthSoundWrong.freq(160); // 低沉錯誤聲
          setTimeout(() => synthSoundWrong.stop(), 200);
        }
      } catch (e) {}
    }
  </script>
</body>
</html>
}
