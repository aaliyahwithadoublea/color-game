// DOM Elements
const colorBox = document.getElementById("colorBox");
const colorOptions = document.getElementById("colorOptions");
const gameStatus = document.getElementById("gameStatus");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const streakDisplay = document.getElementById("streak");
const accuracyDisplay = document.getElementById("accuracy");
const newGameButton = document.getElementById("newGameButton");
const playAgainButton = document.getElementById("playAgainButton");
const difficultySelect = document.getElementById("difficulty");
const timerFill = document.getElementById("timerFill");
const timerText = document.getElementById("timerText");
const gameOverModal = document.getElementById("gameOverModal");
const finalScoreDisplay = document.getElementById("finalScore");
const bestStreakDisplay = document.getElementById("bestStreak");
const finalAccuracyDisplay = document.getElementById("finalAccuracy");
const colorHexDisplay = document.getElementById("colorHex");

// Game State
let gameState = {
  score: 0,
  highScore: parseInt(localStorage.getItem("highScore")) || 0,
  streak: 0,
  bestStreak: parseInt(localStorage.getItem("bestStreak")) || 0,
  totalCorrect: 0,
  totalAttempts: 0,
  targetColor: "",
  difficulty: "medium",
  timer: null,
  timeRemaining: 30,
  isGameActive: false
};

// Difficulty Settings
const difficultySettings = {
  easy: {
    colorVariation: 100,
    timeLimit: 45,
    numOptions: 4
  },
  medium: {
    colorVariation: 60,
    timeLimit: 30,
    numOptions: 6
  },
  hard: {
    colorVariation: 30,
    timeLimit: 20,
    numOptions: 8
  },
  expert: {
    colorVariation: 15,
    timeLimit: 15,
    numOptions: 10
  }
};

// Initialize
function init() {
  updateDisplay();
  newGameButton.addEventListener("click", startNewGame);
  playAgainButton.addEventListener("click", () => {
    gameOverModal.classList.remove("show");
    startNewGame();
  });
  difficultySelect.addEventListener("change", (e) => {
    gameState.difficulty = e.target.value;
    if (gameState.isGameActive) {
      startNewGame();
    }
  });
  startNewGame();
}

// Generate random color
function generateRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return { r, g, b, hex: rgbToHex(r, g, b) };
}

// Convert RGB to HEX
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("").toUpperCase();
}

// Generate similar colors based on difficulty
function generateSimilarColors(baseColor, difficulty) {
  const settings = difficultySettings[difficulty];
  const colors = [baseColor];
  
  // Generate similar colors
  for (let i = 1; i < settings.numOptions; i++) {
    const variation = settings.colorVariation;
    const r = clamp(baseColor.r + Math.floor(Math.random() * variation * 2) - variation, 0, 255);
    const g = clamp(baseColor.g + Math.floor(Math.random() * variation * 2) - variation, 0, 255);
    const b = clamp(baseColor.b + Math.floor(Math.random() * variation * 2) - variation, 0, 255);
    
    colors.push({
      r,
      g,
      b,
      hex: rgbToHex(r, g, b)
    });
  }
  
  return shuffleArray(colors);
}

// Clamp value between min and max
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Start new game
function startNewGame() {
  gameState.score = 0;
  gameState.streak = 0;
  gameState.totalCorrect = 0;
  gameState.totalAttempts = 0;
  gameState.isGameActive = true;
  gameStatus.textContent = "";
  gameStatus.classList.remove("correct", "wrong");
  
  updateDisplay();
  nextRound();
}

// Start next round
function nextRound() {
  if (!gameState.isGameActive) return;
  
  const settings = difficultySettings[gameState.difficulty];
  gameState.timeRemaining = settings.timeLimit;
  
  // Generate target color
  const baseColor = generateRandomColor();
  gameState.targetColor = baseColor;
  
  // Display target color
  colorBox.style.backgroundColor = baseColor.hex;
  colorHexDisplay.textContent = baseColor.hex;
  
  // Generate similar colors
  const colorSet = generateSimilarColors(baseColor, gameState.difficulty);
  
  // Clear and create color options
  colorOptions.innerHTML = "";
  colorSet.forEach((color) => {
    const colorButton = document.createElement("div");
    colorButton.classList.add("color-option");
    colorButton.style.backgroundColor = color.hex;
    colorButton.setAttribute("data-testid", "colorOption");
    
    const isCorrect = color.hex === gameState.targetColor.hex;
    colorButton.addEventListener("click", () => checkGuess(color.hex, isCorrect));
    
    colorOptions.appendChild(colorButton);
  });
  
  // Start timer
  startTimer();
}

// Check guess
function checkGuess(guess, isCorrect) {
  if (!gameState.isGameActive) return;
  
  clearTimer();
  gameState.totalAttempts++;
  gameStatus.classList.remove("correct", "wrong");
  
  // Find the clicked button
  const buttons = Array.from(colorOptions.children);
  const clickedButton = buttons.find(btn => btn.style.backgroundColor.toUpperCase() === guess.toUpperCase());
  
  if (isCorrect) {
    gameState.score++;
    gameState.streak++;
    gameState.totalCorrect++;
    gameStatus.textContent = "✓ Correct! Well done!";
    gameStatus.classList.add("correct");
    
    if (clickedButton) {
      clickedButton.classList.add("correct-answer");
    }
    
    // Update best streak
    if (gameState.streak > gameState.bestStreak) {
      gameState.bestStreak = gameState.streak;
      localStorage.setItem("bestStreak", gameState.bestStreak.toString());
    }
    
    // Bonus points for streak
    if (gameState.streak > 1 && gameState.streak % 5 === 0) {
      gameState.score += 2;
      gameStatus.textContent = `✓ Correct! ${gameState.streak} streak bonus! +2 points!`;
    }
  } else {
    gameState.streak = 0;
    gameStatus.textContent = "✗ Wrong! Try again!";
    gameStatus.classList.add("wrong");
    
    if (clickedButton) {
      clickedButton.classList.add("wrong-answer");
    }
    
    // Highlight correct answer
    const correctButton = buttons.find(btn => {
      return btn.style.backgroundColor.toUpperCase() === gameState.targetColor.hex.toUpperCase();
    });
    if (correctButton) {
      correctButton.classList.add("correct-answer");
      setTimeout(() => correctButton.classList.remove("correct-answer"), 1000);
    }
  }
  
  // Update high score
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem("highScore", gameState.highScore.toString());
  }
  
  updateDisplay();
  
  // Remove animation classes
  setTimeout(() => {
    if (clickedButton) {
      clickedButton.classList.remove("correct-answer", "wrong-answer");
    }
    gameStatus.classList.remove("correct", "wrong");
  }, 1000);
  
  // Continue to next round
  setTimeout(() => {
    if (gameState.isGameActive) {
      nextRound();
    }
  }, 1500);
}

// Timer functions
function startTimer() {
  const settings = difficultySettings[gameState.difficulty];
  const timerDisplay = document.getElementById("timer");
  
  updateTimerDisplay();
  
  gameState.timer = setInterval(() => {
    gameState.timeRemaining--;
    updateTimerDisplay();
    
    if (gameState.timeRemaining <= 0) {
      timeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const settings = difficultySettings[gameState.difficulty];
  const percentage = (gameState.timeRemaining / settings.timeLimit) * 100;
  timerFill.style.width = `${percentage}%`;
  
  const timerDisplay = document.getElementById("timer");
  timerDisplay.textContent = `${gameState.timeRemaining}s`;
  
  // Change timer color based on time remaining
  timerFill.classList.remove("warning", "danger");
  if (percentage <= 30) {
    timerFill.classList.add("danger");
  } else if (percentage <= 60) {
    timerFill.classList.add("warning");
  }
}

function clearTimer() {
  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
}

function timeUp() {
  clearTimer();
  gameState.isGameActive = false;
  
  gameStatus.textContent = "⏱️ Time's up!";
  gameStatus.classList.add("wrong");
  
  setTimeout(() => {
    showGameOver();
  }, 1000);
}

// Show game over modal
function showGameOver() {
  finalScoreDisplay.textContent = gameState.score;
  bestStreakDisplay.textContent = gameState.bestStreak;
  const accuracy = gameState.totalAttempts > 0 
    ? Math.round((gameState.totalCorrect / gameState.totalAttempts) * 100) 
    : 0;
  finalAccuracyDisplay.textContent = `${accuracy}%`;
  
  gameOverModal.classList.add("show");
}

// Update display
function updateDisplay() {
  scoreDisplay.textContent = gameState.score;
  highScoreDisplay.textContent = gameState.highScore;
  streakDisplay.textContent = gameState.streak;
  
  const accuracy = gameState.totalAttempts > 0 
    ? Math.round((gameState.totalCorrect / gameState.totalAttempts) * 100) 
    : 0;
  accuracyDisplay.textContent = `${accuracy}%`;
}

// Initialize game on load
init();
