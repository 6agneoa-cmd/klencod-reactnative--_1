import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ============================================================
// الفئات والوحدات (بسيطة جداً)
// ============================================================
type Unit = {
  id: string;
  name: string;
  factor: number; // معامل التحويل إلى الوحدة الأساسية
};

type Category = {
  id: string;
  name: string;
  baseUnitId: string;
  units: Unit[];
  isTemperature?: boolean;
};

const CATEGORIES: Category[] = [
  {
    id: 'length',
    name: 'الطول',
    baseUnitId: 'm',
    units: [
      {id: 'mm', name: 'مم', factor: 0.001},
      {id: 'cm', name: 'سم', factor: 0.01},
      {id: 'm', name: 'متر', factor: 1},
      {id: 'km', name: 'كم', factor: 1000},
    ],
  },
  {
    id: 'weight',
    name: 'الوزن',
    baseUnitId: 'kg',
    units: [
      {id: 'g', name: 'جرام', factor: 0.001},
      {id: 'kg', name: 'كجم', factor: 1},
      {id: 'ton', name: 'طن', factor: 1000},
      {id: 'lb', name: 'رطل', factor: 0.453592},
    ],
  },
  {
    id: 'temperature',
    name: 'الحرارة',
    baseUnitId: 'c',
    isTemperature: true,
    units: [
      {id: 'c', name: 'سيلزيوس', factor: 1},
      {id: 'f', name: 'فهرنهايت', factor: 1},
      {id: 'k', name: 'كلفن', factor: 1},
    ],
  },
];

// ============================================================
// التحويل (دالة واحدة بسيطة)
// ============================================================
function convert(value: number, fromId: string, toId: string, category: Category): number {
  // حالة الحرارة (منطق خاص)
  if (category.isTemperature) {
    let celsius = value;
    if (fromId === 'f') celsius = (value - 32) * 5 / 9;
    else if (fromId === 'k') celsius = value - 273.15;

    if (toId === 'c') return celsius;
    if (toId === 'f') return celsius * 9 / 5 + 32;
    return celsius + 273.15;
  }

  // الحالة العادية
  const fromUnit = category.units.find(u => u.id === fromId);
  const toUnit = category.units.find(u => u.id === toId);
  if (!fromUnit || !toUnit) return 0;

  const valueInBase = value * fromUnit.factor;
  return valueInBase / toUnit.factor;
}

// ============================================================
// تنسيق الرقم
// ============================================================
function fmt(n: number): string {
  if (!isFinite(n)) return '0';
  if (n === 0) return '0';
  if (Math.abs(n) < 0.0001) return n.toExponential(3);
  if (Math.abs(n) > 1000000) return n.toExponential(3);
  return (Math.round(n * 10000) / 10000).toString();
}

// ============================================================
// التطبيق
// ============================================================
export default function App() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [fromId, setFromId] = useState('mm');
  const [toId, setToId] = useState('m');
  const [input, setInput] = useState('1');

  const category = CATEGORIES[categoryIndex];

  // حساب النتيجة مباشرة
  const numInput = parseFloat(input) || 0;
  const result = convert(numInput, fromId, toId, category);

  // تغيير الفئة
  const changeCategory = (idx: number) => {
    setCategoryIndex(idx);
    const newCat = CATEGORIES[idx];
    setFromId(newCat.units[0].id);
    setToId(newCat.units[1].id);
    setInput('1');
  };

  // تبديل
  const swap = () => {
    const tmp = fromId;
    setFromId(toId);
    setToId(tmp);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>اقنيوا</Text>
      </View>

      {/* التبويبات */}
      <View style={styles.tabsRow}>
        {CATEGORIES.map((cat, idx) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.tab, idx === categoryIndex && styles.tabActive]}
            onPress={() => changeCategory(idx)}>
            <Text style={[styles.tabText, idx === categoryIndex && styles.tabTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* حقل الإدخال */}
        <Text style={styles.label}>القيمة</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={input}
          onChangeText={setInput}
          placeholder="1"
          placeholderTextColor="#5A6472"
        />

        {/* اختيار الوحدة من */}
        <Text style={styles.label}>من</Text>
        <View style={styles.chipsRow}>
          {category.units.map(unit => (
            <TouchableOpacity
              key={unit.id}
              style={[styles.chip, unit.id === fromId && styles.chipActive]}
              onPress={() => setFromId(unit.id)}>
              <Text style={[styles.chipText, unit.id === fromId && styles.chipTextActive]}>
                {unit.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* زر التبديل */}
        <TouchableOpacity style={styles.swapBtn} onPress={swap}>
          <Text style={styles.swapBtnText}>تبديل الوحدات</Text>
        </TouchableOpacity>

        {/* اختيار الوحدة إلى */}
        <Text style={styles.label}>إلى</Text>
        <View style={styles.chipsRow}>
          {category.units.map(unit => (
            <TouchableOpacity
              key={unit.id}
              style={[styles.chip, unit.id === toId && styles.chipActive]}
              onPress={() => setToId(unit.id)}>
              <Text style={[styles.chipText, unit.id === toId && styles.chipTextActive]}>
                {unit.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* النتيجة */}
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>النتيجة</Text>
          <Text style={styles.resultValue}>{fmt(result)}</Text>
          <Text style={styles.formula}>
            {numInput} {category.units.find(u => u.id === fromId)?.name} = {fmt(result)} {category.units.find(u => u.id === toId)?.name}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// الأنماط
// ============================================================
const C = {
  bg: '#0A0E14',
  surface: '#141B24',
  surfaceAlt: '#1B242F',
  border: '#303E4D',
  text: '#F5F7FA',
  muted: '#9DABBB',
  primary: '#3791FF',
  primaryDark: '#2570CC',
  success: '#36C284',
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: C.bg},
  header: {padding: 20, paddingBottom: 12},
  title: {color: C.text, fontSize: 26, fontWeight: '800', textAlign: 'right'},
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
  },
  tabActive: {backgroundColor: C.primary, borderColor: C.primary},
  tabText: {color: C.muted, fontSize: 13, fontWeight: '600'},
  tabTextActive: {color: '#FFFFFF'},
  body: {flex: 1},
  bodyContent: {padding: 16, paddingBottom: 40},
  label: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'right',
  },
  input: {
    color: C.text,
    fontSize: 28,
    fontWeight: '700',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.surface,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: C.border,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: {backgroundColor: C.primaryDark, borderColor: C.primary},
  chipText: {color: C.muted, fontSize: 13, fontWeight: '600'},
  chipTextActive: {color: '#FFFFFF'},
  swapBtn: {
    alignSelf: 'center',
    marginVertical: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  swapBtnText: {color: C.primary, fontSize: 14, fontWeight: '700'},
  resultBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: 18,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.primary,
  },
  resultLabel: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 6,
  },
  resultValue: {
    color: C.success,
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'right',
  },
  formula: {
    color: C.muted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 10,
  },
});<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>حارس المجرة</title>
<style>
*{box-sizing:border-box}
body{
 margin:0;background:#070b1b;color:white;
 font-family:Arial,sans-serif;text-align:center;
}
.game{max-width:500px;margin:auto;padding:12px}
h1{color:#63f5ff}
.stats{display:flex;justify-content:space-around;margin:12px 0}
canvas{
 width:100%;background:#050916;
 border:2px solid #63f5ff;border-radius:14px;
 touch-action:none;
}
button{
 padding:13px 18px;margin:5px;border:0;
 border-radius:12px;font-weight:bold;
 background:#63f5ff;color:#071020;font-size:16px;
 touch-action:manipulation;
}
.controls{display:flex;justify-content:center;flex-wrap:wrap}
#message{line-height:1.8;color:#d4d9ed}
</style>
</head>
<body>
<div class="game">
<h1>🚀 حارس المجرة</h1>
<div class="stats">
<span>النقاط: <b id="score">0</b></span>
<span>❤️ <b id="lives">3</b></span>
<span>المستوى: <b id="level">1</b></span>
</div>

<canvas id="game" width="400" height="600"></canvas>

<div id="message">احمِ المجرة من الغزاة!</div>

<div class="controls">
<button id="start">ابدأ اللعبة</button>
<button id="left">◀ يسار</button>
<button id="fire">🔥 إطلاق</button>
<button id="right">يمين ▶</button>
<button id="pause">إيقاف مؤقت</button>
</div>
</div><script>
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const levelText = document.getElementById("level");
const message = document.getElementById("message");

const W = canvas.width;
const H = canvas.height;

let player = { x: W / 2, y: H - 55, w: 30 };
let bullets = [];
let enemies = [];
let stars = [];
let score = 0;
let lives = 3;
let level = 1;
let running = false;
let paused = false;
let gameOver = false;
let frame = 0;
let lastShot = 0;
let keys = { left: false, right: false, fire: false };

let best = 0;
try {
  best = Number(localStorage.getItem("galaxyBest")) || 0;
} catch (e) {}

for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * W,
    y: Math.random() * H,
    speed: 0.5 + Math.random() * 2,
    size: 1 + Math.random() * 2
  });
}

function updateUI() {
  scoreText.textContent = score;
  livesText.textContent = lives;
  levelText.textContent = level;
}

function startGame() {
  score = 0;
  lives = 3;
  level = 1;
  frame = 0;
  lastShot = 0;
  bullets = [];
  enemies = [];
  player.x = W / 2;
  running = true;
  paused = false;
  gameOver = false;
  message.textContent = "دافع عن المجرة!";
  updateUI();
  requestAnimationFrame(loop);
}

function shoot() {
  if (frame - lastShot < 10) return;

  bullets.push({
    x: player.x,
    y: player.y - 20,
    speed: 8
  });

  lastShot = frame;
}

function createEnemy() {
  enemies.push({
    x: 20 + Math.random() * (W - 40),
    y: -25,
    size: 22,
    speed: 1 + Math.random() * 1.5 + level * 0.2
  });
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#63f5ff";
  ctx.fillStyle = "#63f5ff";

  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(16, 16);
  ctx.lineTo(0, 9);
  ctx.lineTo(-16, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.fillRect(-3, -5, 6, 12);
  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#ff4e9b";
  ctx.fillStyle = "#ff4e9b";

  ctx.beginPath();
  ctx.moveTo(-enemy.size, -8);
  ctx.lineTo(-10, -enemy.size);
  ctx.lineTo(10, -enemy.size);
  ctx.lineTo(enemy.size, -8);
  ctx.lineTo(12, 12);
  ctx.lineTo(0, 6);
  ctx.lineTo(-12, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "#050916";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ffffff";

  for (const star of stars) {
    ctx.globalAlpha = 0.4 + Math.random() * 0.5;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }

  ctx.globalAlpha = 1;

  for (const bullet of bullets) {
    ctx.fillStyle = "#63f5ff";
    ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 14);
  }

  enemies.forEach(drawEnemy);
  drawPlayer();

  if (paused || gameOver || !running) {
    ctx.fillStyle = "#000000bb";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#63f5ff";
    ctx.textAlign = "center";
    ctx.font = "bold 27px Arial";
    ctx.fillText(
      gameOver ? "انتهت اللعبة" :
      paused ? "إيقاف مؤقت" : "حارس المجرة",
      W / 2, H / 2
    );
  }
}

function collision(a, b) {
  return Math.abs(a.x - b.x) < 22 &&
         Math.abs(a.y - b.y) < 24;
}

function finishGame() {
  running = false;
  gameOver = true;

  if (score > best) {
    best = score;
    try {
      localStorage.setItem("galaxyBest", best);
    } catch (e) {}
  }

  message.textContent =
    `انتهت اللعبة! نقاطك: ${score} | أفضل نتيجة: ${best}`;

  draw();
}

function update() {
  frame++;

  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > H) {
      star.y = 0;
      star.x = Math.random() * W;
    }
  });

  if (keys.left) player.x -= 5;
  if (keys.right) player.x += 5;

  player.x = Math.max(18, Math.min(W - 18, player.x));

  if (keys.fire) shoot();

  if (frame % Math.max(15, 55 - level * 3) === 0) {
    createEnemy();
  }

  bullets.forEach(b => b.y -= b.speed);
  bullets = bullets.filter(b => b.y > -20);

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.y += enemy.speed;

    if (enemy.y > H) {
      enemies.splice(i, 1);
      lives--;
      updateUI();

      if (lives <= 0) {
        finishGame();
        return;
      }
      continue;
    }

    if (collision(player, enemy)) {
      enemies.splice(i, 1);
      lives--;
      updateUI();

      if (lives <= 0) {
        finishGame();
        return;
      }
      continue;
    }

    for (let j = bullets.length - 1; j >= 0; j--) {
      if (collision(bullets[j], enemy)) {
        bullets.splice(j, 1);
        enemies.splice(i, 1);
        score += 10;

        level = Math.floor(score / 150) + 1;
        updateUI();
        break;
      }
    }
  }
}

function loop() {
  if (!running || paused) return;

  update();
  draw();

  if (running && !paused) {
    requestAnimationFrame(loop);
  }
}

// أزرار الهاتف
function bindButton(id, key) {
  const button = document.getElementById(id);

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    keys[key] = true;
  });

  for (const event of ["pointerup", "pointercancel", "pointerleave"]) {
    button.addEventListener(event, () => {
      keys[key] = false;
    });
  }
}

bindButton("left", "left");
bindButton("right", "right");
bindButton("fire", "fire");

document.getElementById("start").onclick = startGame;

document.getElementById("pause").onclick = () => {
  if (!running && !paused) return;

  paused = !paused;

  if (paused) {
    message.textContent = "اللعبة متوقفة مؤقتًا";
    draw();
  } else {
    message.textContent = "كمّل الدفاع عن المجرة!";
    requestAnimationFrame(loop);
  }
};

// التحكم بلوحة المفاتيح
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
  if (e.code === "Space") {
    e.preventDefault();
    keys.fire = true;
  }
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
  if (e.code === "Space") keys.fire = false;
});

updateUI();
draw();
</script>
</body>
</html>