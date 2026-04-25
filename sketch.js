let seaweeds = [];
let bubbles = [];
let fishGroup = [];
let waterBubbles = [];
let seaweedColors = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'];

// 全域變數，用於追蹤當前正在動畫的氣泡
let currentAnimatingBubble = null;
let sidebar;
let textContentDiv;
let userInput;
let sizeSlider;
let shells = [];
let crab;

// 作品資料設定：可以隨時增加週數
let assignments = [
  { title: "文字頁面", url: "https://breeze520tw-rgb.github.io/Text-page/" },
  { title: "海葵製作", url: "https://breeze520tw-rgb.github.io/sea-anemone/" },
  { title: "笑臉", url: "https://breeze520tw-rgb.github.io/smile/" },
  { title: "電流急急棒", url: "https://breeze520tw-rgb.github.io/Electric-Current-Avoider/" },
  { title: "踩地雷", url: "https://breeze520tw-rgb.github.io/-Minesweeper/" },
  { title: "攝影機", url: "https://breeze520tw-rgb.github.io/camera/" }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  initSidebar();

  // 初始化 50 根海草，均衡產生在視窗寬度內
  for (let i = 0; i < 50; i++) {
    let x = (width / 50) * i + random(-10, 10);
    let h = random(height * 0.3, height * 0.7);
    let c = color(random(seaweedColors));
    c.setAlpha(180); // 加入透明特效
    let w = random(6, 15); // 加粗粗細
    let freq = random(0.01, 0.03); // 搖晃頻率
    seaweeds.push(new Seaweed(x, h, c, w, freq));
  }

  // 初始化氣泡按鈕
  for (let i = 0; i < assignments.length; i++) {
    let spacing = width / (assignments.length + 1);
    bubbles.push(new Bubble(spacing * (i + 1), height * 0.5, assignments[i]));
  }

  // 初始化小丑魚 (10隻)
  for (let i = 0; i < 10; i++) {
    fishGroup.push(new Fish());
  }

  // 初始化文字輸入框與滑桿
  userInput = createInput('在此輸入文字');
  userInput.position(width - 300, 20);
  userInput.style('width', '250px');
  userInput.style('font-size', '18px');

  sizeSlider = createSlider(30, 100, 30);
  sizeSlider.position(width - 300, 60);
  sizeSlider.style('width', '250px');

  // 初始化貝殼 (3~4個)
  let shellCount = floor(random(3, 5));
  for (let i = 0; i < shellCount; i++) {
    shells.push(new Shell());
  }
  crab = new Crab();
}

function draw() {
  // 水底漸層背景
  background(20, 40, 80);
  blendMode(BLEND);
  
  // 繪製海草
  for (let s of seaweeds) {
    s.display();
  }

  // 繪製並更新上升水泡
  if (frameCount % 10 == 0) {
    waterBubbles.push(new WaterBubble());
  }

  for (let i = waterBubbles.length - 1; i >= 0; i--) {
    waterBubbles[i].update();
    waterBubbles[i].display();
    if (waterBubbles[i].isFinished) {
      waterBubbles.splice(i, 1);
    }
  }

  // 繪製魚群 (利用 vertex 製作)
  for (let f of fishGroup) {
    f.update();
    f.display();
  }

  // --- 底部沙地生態層 ---
  // 繪製沙地
  fill(235, 200, 150);
  noStroke();
  rect(0, height * 0.95, width, height * 0.05);

  for (let s of shells) s.display();
  crab.update();
  crab.display();

  // 繪製氣泡與互動
  for (let b of bubbles) {
    b.update();
    b.display();
  }

  // --- 側邊選單自動隱藏邏輯 ---
  if (mouseX < 50) {
    sidebar.style('left', '0px');
  } else if (mouseX > 250) {
    // 當滑鼠遠離選單範圍後才隱藏，提供更好的操作體驗
    sidebar.style('left', '-220px');
  }

  // 繪製使用者輸入的文字 (最後圖層，顯示於畫面上方 20% 處，並帶有立體效果)
  push();
  noStroke();
  textAlign(CENTER, CENTER);

  let textVal = userInput.value();
  let currentTextSize = sizeSlider.value();
  let textX = width / 2;
  let textY = height * 0.2;
  let depthLayers = 5; // 立體效果的層數
  let shadowColor = color(50, 50, 50, 150); // 陰影的基礎顏色 (深灰，半透明)
  let topColor = color(255); // 最上層文字的顏色 (白色)

  textSize(currentTextSize); // 設定文字大小

  for (let i = depthLayers; i > 0; i--) {
    let c = lerpColor(shadowColor, topColor, map(i, 1, depthLayers, 0.2, 1)); // 顏色漸變
    fill(c);
    text(textVal, textX + i * 0.8, textY + i * 0.8); // 偏移繪製，製造深度感
  }
  fill(topColor); // 繪製最上層的文字
  text(textVal, textX, textY);
  pop();
}

function mousePressed() {
  // 如果視窗已經開啟，點擊背景或任何地方先嘗試關閉視窗邏輯由按鈕處理
  let container = document.getElementById('iframeContainer');
  if (container && container.style.display === "block") {
    // 如果點擊的不是氣泡，且視窗開著，可以選擇在此不做事，強制使用 X 按鈕
    // 或者保留原本的點擊空白處關閉邏輯：
    // closeIframe(); 
    // return;
  }

  for (let b of bubbles) {
    if (b.isClicked(mouseX, mouseY)) {
      if (!currentAnimatingBubble) {
        b.startAnimation();
        currentAnimatingBubble = b;
      }
      return false;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  userInput.position(width - 300, 20);
  sizeSlider.position(width - 300, 60);
}

// --- 新增輔助功能與類別 ---

function initSidebar() {
  // 建立側邊選單容器
  sidebar = createDiv('');
  sidebar.style('position', 'fixed');
  sidebar.style('top', '0');
  sidebar.style('left', '-220px'); // 初始隱藏
  sidebar.style('width', '200px');
  sidebar.style('height', '100%');
  sidebar.style('background-color', 'rgba(0, 30, 60, 0.7)'); // 半透明深藍
  sidebar.style('color', 'white');
  sidebar.style('padding', '20px');
  sidebar.style('z-index', '2000');
  sidebar.style('transition', 'left 0.4s ease');
  sidebar.style('font-family', 'sans-serif');
  sidebar.style('box-shadow', '4px 0 15px rgba(0,0,0,0.3)');

  // 個人資訊
  let info = createDiv('教科一B<br>414XXX183 王O崴');
  info.style('font-size', '18px');
  info.style('margin-bottom', '30px');
  info.style('line-height', '1.5');
  info.style('border-bottom', '1px solid rgba(255,255,255,0.3)');
  info.style('padding-bottom', '10px');
  sidebar.child(info);

  // 選項樣式定義
  const btnStyle = `
    display: block; width: 100%; padding: 12px; margin: 10px 0;
    background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3);
    border-radius: 8px; cursor: pointer; text-align: left; font-size: 14px; transition: 0.2s;
  `;

  // 選項一
  let btn1 = createButton('【主題概念說明】');
  btn1.style(btnStyle);
  btn1.mousePressed(() => {
    showTextContent('主題概念說明', '整體以可愛的水族箱為主題，將每一週的作品設計成一顆顆漂浮的文字氣泡，就像在水中緩緩飄動的訊息。點擊氣泡時，會跳出對應的作品內容，讓使用者像在「戳泡泡」一樣，一邊玩一邊瀏覽學習成果。<br><br>水草的搖曳讓畫面更有水中氛圍；而小丑魚在水裡游動時會避開滑鼠，像是在和使用者玩捉迷藏，增加整體的互動感與趣味性。<br><br>右上角使用者可自行輸入文字，並且可以隨著個人喜好變更字體大小，就像在為這個水族箱命名一樣');
  });
  sidebar.child(btn1);

  // 選項二
  let btn2 = createButton('【指令說明】');
  btn2.style(btnStyle);
  btn2.mousePressed(() => {
    showTextContent('指令說明', '1.首先，背景的海草使用了「海葵製作」中的 vertex 造型、class 產生的海草，並透過陣列控制的元件來完成。<br>2.背景中的小丑魚會根據使用者的滑鼠位置產生變化，這部分是運用「電流急急棒」的概念實作；當使用者觸碰到電流感應處（小丑魚）時，便會產生對應的反應，例如遊戲失敗或小丑魚游走。<br>3.點選氣泡後顯示視窗的功能，則是透過展示視窗（iframe）的指令來呈現。<br>4.右上角使用者可自行輸入文字，並且可以隨著個人喜好變更字體大小，這個部分則是運用了網頁元素(DOM)的指令來完成<br><br>補充：左側選單使用上學期所學的「子選單」製作，除了讓畫面保持整齊，也方便使用者進行閱覽。');
  });
  sidebar.child(btn2);
}

function easeOutQuad(t) {
  return t * (2 - t);
}

class BurstParticle {
  constructor(x, y, angle, speed, size, col) {
    this.x = x;
    this.y = y;
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    this.size = size;
    this.alpha = 255;
    this.color = col;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 10;
    this.size *= 0.95;
  }
  display() {
    noStroke();
    let c = color(red(this.color), green(this.color), blue(this.color), this.alpha);
    fill(c);
    circle(this.x, this.y, this.size);
  }
  isFinished() {
    return this.alpha <= 0;
  }
}

function displayIframe(url) {
  let container = document.getElementById('iframeContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'iframeContainer';
    // 設定容器樣式：90% 寬高並置中
    container.style.cssText = `
      position: fixed;
      top: 5vh;
      left: 5vw;
      width: 90vw;
      height: 90vh;
      background: white;
      z-index: 1000;
      border-radius: 20px;
      box-shadow: 0 0 50px rgba(0,0,0,0.5);
      display: none;
      overflow: hidden;
      border: 5px solid rgba(255,255,255,0.8);
    `;
    
    let iframe = document.createElement('iframe');
    iframe.id = 'myIframe';
    iframe.style.cssText = "width:100%; height:100%; border:none;";
    // 加入權限許可，確保攝影機與全螢幕功能正常
    iframe.setAttribute('allow', 'camera; microphone; gyroscope; accelerometer; fullscreen');

    // 建立文字內容容器 (預設隱藏)
    textContentDiv = document.createElement('div');
    textContentDiv.id = 'textContent';
    textContentDiv.style.cssText = `
      display: none; width: 100%; height: 100%; padding: 40px; 
      font-size: 18px; line-height: 1.8; color: #333; overflow-y: auto;
      box-sizing: border-box; font-family: sans-serif;
    `;
    
    let closeBtn = document.createElement('button');
    closeBtn.innerHTML = "×";
    closeBtn.style.cssText = `
      position: absolute;
      top: 15px;
      right: 15px;
      width: 40px;
      height: 40px;
      font-size: 30px;
      background: rgba(255,0,0,0.7);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      line-height: 35px;
      text-align: center;
      z-index: 1001;
    `;
    closeBtn.onclick = closeIframe;
    
    container.appendChild(closeBtn);
    container.appendChild(iframe);
    container.appendChild(textContentDiv);
    document.body.appendChild(container);
  }
  
  // 顯示 iframe，隱藏純文字
  document.getElementById('myIframe').style.display = "block";
  textContentDiv.style.display = "none";

  // 先顯示容器，再設定 src，確保作品能正確取得 90% 視窗的寬高
  container.style.display = "block";
  document.getElementById('myIframe').src = url;
}

function showTextContent(title, text) {
  displayIframe(""); // 先初始化容器
  const iframe = document.getElementById('myIframe');
  iframe.style.display = "none"; // 隱藏 iframe
  
  textContentDiv.innerHTML = `<h2 style="margin-top:0; color:#004080;">${title}</h2>${text}`;
  textContentDiv.style.display = "block";
  document.getElementById('iframeContainer').style.display = "block";
}

function closeIframe() {
  let container = document.getElementById('iframeContainer');
  if (container) {
    container.style.display = "none";
    // 關閉時清空 src，釋放記憶體並確保下次開啟時重新載入
    document.getElementById('myIframe').src = "about:blank";
  }
  // 重置所有氣泡，確保它們回到畫面中
  if (currentAnimatingBubble) {
    currentAnimatingBubble.resetAnimation();
    currentAnimatingBubble = null;
  }
}

// --- 類別與功能函數 ---

class Seaweed {
  constructor(x, maxH, col, weight, freq) {
    this.x = x;
    this.maxH = maxH;
    this.color = col;
    this.weight = weight;
    this.freq = freq;
    this.offset = random(1000);
  }

  display() {
    stroke(this.color);
    strokeWeight(this.weight);
    noFill();
    beginShape();
    
    // curveVertex 需要第一個點作為控制點
    let startDx = map(noise(this.offset + frameCount * this.freq), 0, 1, -40, 40);
    curveVertex(this.x + startDx, height + 50);

    for (let i = 0; i <= this.maxH; i += 30) {
      // 加大搖晃距離
      let swayRange = map(i, 0, this.maxH, 0, 80); 
      let dx = map(noise(this.offset + frameCount * this.freq + i * 0.005), 0, 1, -swayRange, swayRange);
      vertex(this.x + dx, height - i);
    }
    
    // 最後一個點也要重複或是作為控制點
    let endDx = map(noise(this.offset + frameCount * this.freq + this.maxH * 0.005), 0, 1, -80, 80);
    curveVertex(this.x + endDx, height - this.maxH);
    endShape();
  }
}

class WaterBubble {
  constructor() {
    this.x = random(width);
    this.y = height + 20;
    this.size = random(10, 25);
    this.speed = random(1, 3);
    this.burstY = random(height * 0.1, height * 0.6);
    this.isPopped = false;
    this.popTimer = 10;
    this.isFinished = false;
  }

  update() {
    if (!this.isPopped) {
      this.y -= this.speed;
      this.x += sin(frameCount * 0.05) * 0.5;
      if (this.y < this.burstY) {
        this.isPopped = true;
      }
    } else {
      this.popTimer--;
      if (this.popTimer <= 0) {
        this.isFinished = true;
      }
    }
  }

  display() {
    if (!this.isPopped) {
      push();
      translate(this.x, this.y);
      
      // 水泡主體 (白色，透明度 0.5)
      fill(255, 127); 
      noStroke();
      circle(0, 0, this.size);
      
      // 水泡反光圓圈 (白色，透明度 0.7)
      fill(255, 178);
      circle(-this.size * 0.2, -this.size * 0.2, this.size * 0.3);
      pop();
    } else {
      // 破掉的效果
      push();
      stroke(255, map(this.popTimer, 10, 0, 178, 0));
      noFill();
      strokeWeight(2);
      // 產生四散的小線段模擬破裂
      for (let i = 0; i < 8; i++) {
        let angle = TWO_PI / 8 * i;
        let r1 = this.size * 0.5;
        let r2 = this.size * 0.8;
        line(this.x + cos(angle) * r1, this.y + sin(angle) * r1, 
             this.x + cos(angle) * r2, this.y + sin(angle) * r2);
      }
      pop();
    }
  }
}

class Bubble {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.r = 65;
    this.data = data;
    this.floatOffset = random(1000);

    // 動畫相關屬性
    this.isAnimating = false; // 是否正在放大動畫
    this.animationStartTime = 0; // 動畫開始時間
    this.animationDuration = 400; // 動畫持續時間 (毫秒)
    this.currentR = this.r; // 當前半徑
    this.originalR = this.r; // 原始半徑
    this.targetR = 0; // 目標半徑 (放大到螢幕大小)

    this.bursting = false; // 是否正在爆破
    this.burstParticles = []; // 爆破粒子陣列
    this.burstDuration = 30; // 爆破效果持續的幀數
  }

  // 啟動氣泡放大動畫
  startAnimation() {
    this.isAnimating = true;
    this.animationStartTime = millis();
    this.currentR = this.originalR;
    // 計算目標半徑，使其能覆蓋整個畫面
    this.targetR = dist(this.x, this.y, width / 2, height / 2) + max(width, height) / 2;
    this.bursting = false;
    this.burstParticles = [];
  }

  // 重置氣泡動畫狀態
  resetAnimation() {
    this.isAnimating = false;
    this.bursting = false;
    this.currentR = this.originalR;
    this.burstParticles = [];
  }

  update() {
    if (!this.isAnimating && !this.bursting) {
      // 正常狀態下，氣泡上下浮動
      this.y += sin(this.floatOffset + frameCount * 0.05) * 0.5;
    } else if (this.isAnimating) {
      // 氣泡放大動畫中
      let elapsedTime = millis() - this.animationStartTime;
      let progress = min(1, elapsedTime / this.animationDuration); // 動畫進度 0 到 1
      this.currentR = lerp(this.originalR, this.targetR, easeOutQuad(progress)); // 使用緩動函數

      if (progress >= 1 && !this.bursting) {
        // 動畫結束，進入爆破狀態
        this.bursting = true;
        this.burstTimer = this.burstDuration;
        // 生成爆破粒子
        let particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
          let angle = map(i, 0, particleCount, 0, TWO_PI);
          let speed = random(3, 7);
          let particleSize = random(5, 15);
          this.burstParticles.push(new BurstParticle(this.x, this.y, angle, speed, particleSize, color(255, 255, 255, 200)));
        }
        // 爆破開始時，顯示 Iframe 視窗
        displayIframe(this.data.url);
      }
    } else if (this.bursting) {
      // 氣泡爆破動畫中
      for (let i = this.burstParticles.length - 1; i >= 0; i--) {
        this.burstParticles[i].update();
        if (this.burstParticles[i].isFinished()) {
          this.burstParticles.splice(i, 1);
        }
      }
      this.burstTimer--;
      if (this.burstTimer <= 0 && this.burstParticles.length === 0) {
        // 爆破結束，重置氣泡狀態
        this.resetAnimation();
        currentAnimatingBubble = null; // 清除當前動畫中的氣泡
      }
    }
  }

  display() {
    if (this.isAnimating && !this.bursting) {
      // 繪製放大的氣泡，逐漸透明
      let alpha = map(this.currentR, this.originalR, this.targetR, 100, 0);
      fill(255, 255, 255, alpha);
      stroke(255, alpha);
      circle(this.x, this.y, this.currentR * 2);
    } else if (this.bursting) {
      // 繪製爆破粒子
      for (let p of this.burstParticles) {
        p.display();
      }
    } else {
      // 正常氣泡顯示
      if (this.isClicked(mouseX, mouseY)) {
        fill(173, 216, 230, 150); // 懸停時顯示半透明水藍色
      } else {
        fill(255, 255, 255, 100); // 原始顏色
      }
      stroke(255);
      circle(this.x, this.y, this.r * 2);
      
      fill(255);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(14);
      text(this.data.title, this.x, this.y);
    }
  }

  isClicked(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.r;
  }
}

class Fish {
  constructor() {
    this.x = random(width);
    this.y = random(height * 0.2, height * 0.8);
    this.vx = random() > 0.5 ? random(1, 2) : random(-2, -1);
    this.vy = random(-0.5, 0.5);
    this.w = 60;
    this.h = 35;
  }

  update() {
    // --- 避開滑鼠邏輯 ---
    let d = dist(this.x, this.y, mouseX, mouseY);
    let avoidRadius = 150; // 偵測範圍
    if (d < avoidRadius) {
      let angle = atan2(this.y - mouseY, this.x - mouseX);
      let pushForce = map(d, 0, avoidRadius, 1.5, 0); // 越近推力越大
      this.vx += cos(angle) * pushForce;
      this.vy += sin(angle) * pushForce;
      
      // 加速效果：在逃跑時允許更高的速度上限
      this.vx = constrain(this.vx, -8, 8);
      this.vy = constrain(this.vy, -4, 4);
    } else {
      // 平時的速度限制
      this.vx = constrain(this.vx, -3, 3);
      this.vy = constrain(this.vy, -1, 1);
    }

    this.x += this.vx + cos(frameCount * 0.02); // 加入微小波動
    this.y += this.vy;

    // 邊界反彈
    if (this.x < -50 || this.x > width + 50) this.vx *= -1;
    if (this.y < 50 || this.y > height - 50) this.vy *= -1;

    // 隨機改變方向
    if (random(1) < 0.01) {
      this.vx += random(-0.5, 0.5);
      this.vy += random(-0.3, 0.3);
    }
  }

  display() {
    push();
    translate(this.x, this.y + sin(frameCount * 0.1) * 5);
    
    // 根據移動方向翻轉
    if (this.vx < 0) {
      scale(-1, 1);
    }

    noStroke();

    // 1. 尾鰭 (在身體下方)
    fill(255, 140, 0);
    beginShape();
    vertex(-20, 0);
    bezierVertex(-40, -25, -50, -20, -45, 0);
    bezierVertex(-50, 20, -40, 25, -20, 0);
    endShape(CLOSE);

    // 2. 魚身 (圓潤橢圓)
    fill(255, 140, 0);
    ellipse(0, 0, 60, 42);

    // 3. 白色條紋 (使用圓角矩形並精確定位在身體內)
    fill(255);
    // 中間條紋
    rect(-8, -19, 12, 38, 10);
    // 前部條紋 (靠頭部)
    rect(10, -15, 9, 30, 10);

    // 4. 胸鰭 (稍微深一點的橘色增加層次)
    fill(230, 110, 0);
    ellipse(2, 8, 15, 12);

    // 5. 眼睛 (一個圓潤的黑點)
    fill(0);
    circle(20, -6, 5);
    
    pop();
  }
}

class Shell {
  constructor() {
    this.x = random(50, width - 50);
    this.y = random(height * 0.96, height * 0.99);
    this.size = random(15, 25);
    this.rot = random(TWO_PI);
    this.color = color(random(240, 255), random(220, 240), random(190, 210));
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rot);
    fill(this.color);
    stroke(180, 150, 120);
    strokeWeight(1);
    // 扇形貝殼造型
    beginShape();
    for (let a = 0; a < PI; a += 0.5) {
      let r = this.size * (0.8 + 0.2 * Math.sin(a * 5));
      vertex(cos(a) * r, -sin(a) * r);
    }
    endShape(CLOSE);
    pop();
  }
}

class Crab {
  constructor() {
    this.x = random(50, width - 50);
    this.y = height - 15;
    this.vx = random(-1.5, 1.5);
    this.w = 40;
    this.h = 25;
  }

  update() {
    this.x += this.vx;

    // 左右邊界碰撞檢查 (沙地範圍內)
    if (this.x < 40 || this.x > width - 40) {
      this.vx *= -1;
    }

    // 隨機停頓或改變速度
    if (random(1) < 0.02) {
      this.vx = random(-2, 2);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // 螃蟹腳的擺動效果
    stroke(200, 50, 40);
    strokeWeight(3);
    let legMove = sin(frameCount * 0.2) * 5;
    for (let i = -1; i <= 1; i += 2) {
      line(i * 15, 5, i * 25, 10 + legMove);
      line(i * 15, 0, i * 28, 5 - legMove);
    }

    // 身體
    noStroke();
    fill(220, 60, 50);
    ellipse(0, 0, this.w, this.h);
    
    // 眼睛
    fill(255);
    circle(-8, -10, 6);
    circle(8, -10, 6);
    fill(0);
    circle(-8, -10, 3);
    circle(8, -10, 3);
    pop();
  }
}
