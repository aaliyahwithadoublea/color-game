const colorBox = document.getElementById("colorBox");
const colorOptions = document.getElementById("colorOptions");
const gameInstructions = document.getElementById("gameInstructions");
const gameStatus = document.getElementById("gameStatus");
const scoreDisplay = document.getElementById("score");
const newGameButton = document.getElementById("newGameButton");

let score = 0;
let colors = ["#FF5733", "#33FF57", "#5733FF", "#FF33A1", "#33A1FF", "#A1FF33"];
let targetColor = "";

// Function to pick a random color and set up the game
function startNewGame() {
  // Reset score and game status
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  gameStatus.textContent = "";

  // Start the first round
  nextRound();
}

// Function to start the next round
function nextRound() {
  // Randomly select the target color
  targetColor = colors[Math.floor(Math.random() * colors.length)];

  colorBox.style.backgroundColor = targetColor;

  //display colors randomly
  const shuffledColors = shuffleArray(colors);
  colorOptions.innerHTML = "";

  shuffledColors.forEach((color) => {
    const colorButton = document.createElement("button");
    colorButton.classList.add("color-option");
    colorButton.style.backgroundColor = color;
    colorButton.addEventListener("click", () => checkGuess(color));
    colorButton.setAttribute("data-testid", "colorOption");
    colorOptions.appendChild(colorButton);
  });
}

// Function to check if the guessed color is correct
function checkGuess(guess) {
  gameStatus.classList.remove("correct", "wrong");

  if (guess === targetColor) {
    score++;
    gameStatus.textContent = "Correct! ";
    gameStatus.classList.add("correct");
  } else {
    gameStatus.textContent = "Wrong! Try again.";
    gameStatus.classList.add("wrong");
  }

  scoreDisplay.textContent = `Score: ${score}`;

  setTimeout(() => {
    gameStatus.classList.remove("correct", "wrong");
  }, 1000);

  setTimeout(nextRound, 1300);
}


// Function to shuffle the colors array
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}


newGameButton.addEventListener("click", startNewGame);


startNewGame();
