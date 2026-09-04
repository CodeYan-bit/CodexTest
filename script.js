const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const pauseBtn = document.getElementById("pause-btn");

const gridSize = 24;
const cells = canvas.width / gridSize;
const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

let snake;
let direction;
let nextDirection;
let food;
let score = 0;
let bestScore = 0;
let timerId = null;
let isPaused = false;
let isRunning = false;

const randomCell = () => ({
  x: Math.floor(Math.random() * cells),
  y: Math.floor(Math.random() * cells),
});

const resetGame = () => {
  snake = [
    { x: 8, y: 11 },
    { x: 7, y: 11 },
    { x: 6, y: 11 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  score = 0;
  updateScore();
  placeFood();
  updateStatus("准备开始");
};

const placeFood = () => {
  let newFood = randomCell();
  while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
    newFood = randomCell();
  }
  food = newFood;
};

const updateScore = () => {
  scoreEl.textContent = score;
  bestScoreEl.textContent = bestScore;
};

const updateStatus = (message) => {
  statusEl.textContent = message;
};

const drawCell = (x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
};

const drawGrid = () => {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const render = () => {
  drawGrid();
  snake.forEach((segment, index) => {
    const color = index === 0 ? "#38bdf8" : "#22c55e";
    drawCell(segment.x, segment.y, color);
  });
  drawCell(food.x, food.y, "#f97316");
};

const isOpposite = (next, current) =>
  next.x === -current.x && next.y === -current.y;

const step = () => {
  if (!isRunning || isPaused) {
    return;
  }

  if (!isOpposite(nextDirection, direction)) {
    direction = nextDirection;
  }

  const head = snake[0];
  const newHead = {
    x: (head.x + direction.x + cells) % cells,
    y: (head.y + direction.y + cells) % cells,
  };

  if (snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    if (score > bestScore) {
      bestScore = score;
    }
    updateScore();
    placeFood();
  } else {
    snake.pop();
  }

  render();
};

const startGame = () => {
  if (isRunning) {
    return;
  }
  isRunning = true;
  isPaused = false;
  updateStatus("游戏进行中");
  timerId = window.setInterval(step, 120);
};

const endGame = () => {
  isRunning = false;
  isPaused = false;
  window.clearInterval(timerId);
  updateStatus("游戏结束，点击重新开始");
};

const togglePause = () => {
  if (!isRunning) {
    return;
  }
  isPaused = !isPaused;
  updateStatus(isPaused ? "已暂停" : "游戏进行中");
};

const restartGame = () => {
  window.clearInterval(timerId);
  isRunning = false;
  isPaused = false;
  resetGame();
  render();
  startGame();
};

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === " ") {
    event.preventDefault();
    togglePause();
    return;
  }
  if (directions[key]) {
    nextDirection = directions[key];
  }
});

startBtn.addEventListener("click", () => {
  if (!isRunning) {
    resetGame();
    render();
    startGame();
  }
});

restartBtn.addEventListener("click", restartGame);
pauseBtn.addEventListener("click", togglePause);

resetGame();
render();
