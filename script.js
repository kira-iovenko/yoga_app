const setsInput = document.getElementById("sets-input");
const workoutMins = document.getElementById("work-mins");
const workoutSecs = document.getElementById("work-secs");
const breakMins = document.getElementById("rest-mins");
const breakSecs = document.getElementById("rest-secs");

const timerDisplay = document.getElementById("timer-display");
const timerTypeEl = document.getElementById("timer-type");
const startBtn = document.getElementById("start-btn");
const switchBtn = document.getElementById("switch-btn");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");

const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");

let isWorkout = true;
let currentSeconds = 0;
let round = 1;
let timerInterval = null;
let isRunning = false;

function getWorkSeconds() {
  return parseInt(workoutMins.value) * 60 + parseInt(workoutSecs.value);
}

function getBreakSeconds() {
  return parseInt(breakMins.value) * 60 + parseInt(breakSecs.value);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(currentSeconds);
  timerTypeEl.textContent = isWorkout
    ? `Work - Round ${round} of ${parseInt(setsInput.value)}`
    : `Rest - Round ${round} of ${parseInt(setsInput.value)}`;
  const total = isWorkout ? getWorkSeconds() : getBreakSeconds();
  const percent = (currentSeconds / total) * 100;
  progressBar.style.width = percent + "%";
}

// Reset the timer to initial state
function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  round = 1;
  isWorkout = true;
  currentSeconds = getWorkSeconds();

  playIcon.style.display = "block";
  pauseIcon.style.display = "none";
  startBtn.title = "Start";

  progressContainer.style.display = "block";

  workoutMins.disabled = false;
  workoutSecs.disabled = false;
  breakMins.disabled = false;
  breakSecs.disabled = false;
  switchBtn.disabled = false;
  setsInput.disabled = false;

  updateDisplay();
}

// Validate time inputs to ensure they are within 00-59 range
function validateTimeInputs(input) {
  input.addEventListener("input", () => {
    let num = Math.min(parseInt(input.value) || 0, 59);
    input.value = num.toString().padStart(2, "0");
    if (!isRunning) {
      currentSeconds = isWorkout ? getWorkSeconds() : getBreakSeconds();
      updateDisplay();
    }
  });
}

// Input listeners
[workoutMins, workoutSecs, breakMins, breakSecs].forEach(validateTimeInputs);

setsInput.addEventListener("input", () => {
  let value = parseInt(setsInput.value) || 1;
  setsInput.value = Math.max(1, Math.min(99, value));
});

document.querySelectorAll(".adjust-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const step = parseInt(btn.dataset.step, 10);
    const target = btn.dataset.target;

    if (target === "sets") {
      let val = parseInt(setsInput.value) || 1;
      setsInput.value = Math.max(1, Math.min(99, val + step));
    } else {
      const minInput = document.getElementById(`${target}-mins`);
      const secInput = document.getElementById(`${target}-secs`);

      let total = parseInt(minInput.value) * 60 + parseInt(secInput.value);

      // Snap to nearest 5s boundary before applying step
      if (total % 5 !== 0) {
        const mod = total % 5;
        total += step > 0 ? (5 - mod) : -mod;
      } else {
        total += step;
      }

      total = Math.max(0, Math.min(3599, total)); // clamp to 59:59

      minInput.value = Math.floor(total / 60).toString().padStart(2, "0");
      secInput.value = (total % 60).toString().padStart(2, "0");
    }

    if (!isRunning) {
      currentSeconds = isWorkout ? getWorkSeconds() : getBreakSeconds();
      updateDisplay();
    }
  });
});


// Start/Pause button
startBtn.addEventListener("click", () => {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
    startBtn.title = "Start";

    workoutMins.disabled = false;
    workoutSecs.disabled = false;
    breakMins.disabled = false;
    breakSecs.disabled = false;
    switchBtn.disabled = false;
    setsInput.disabled = false;
  } else {
    if (getWorkSeconds() <= 0) {
      alert("Please enter a valid workout time.");
      return;
    }
    if (getBreakSeconds() < 0) {
      alert("Please enter a valid break time (0 or more seconds).");
      return;
    }

    isRunning = true;
    workoutMins.disabled = true;
    workoutSecs.disabled = true;
    breakMins.disabled = true;
    breakSecs.disabled = true;
    switchBtn.disabled = true;
    setsInput.disabled = true;

    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
    startBtn.title = "Pause";

    if (currentSeconds === 0) {
      currentSeconds = getWorkSeconds();
      isWorkout = true;
      round = 1;
    }

    updateDisplay();

    timerInterval = setInterval(() => {
      if (currentSeconds > 0) {
        currentSeconds--;
        updateDisplay();
      } else {
        if (!isWorkout) {
          round++;
          if (round > parseInt(setsInput.value)) {
            alert("Workout complete! Great job!");
            clearInterval(timerInterval);
            isRunning = false;
            resetTimer();
            return;
          }
        }
        isWorkout = !isWorkout;
        currentSeconds = isWorkout ? getWorkSeconds() : getBreakSeconds();
        updateDisplay();
      }
    }, 1000);
  }
});

// Switch button
switchBtn.addEventListener("click", () => {
  if (isRunning) {
    alert("Pause the timer before switching phases.");
    return;
  }
  isWorkout = !isWorkout;
  round = 1;
  currentSeconds = isWorkout ? getWorkSeconds() : getBreakSeconds();
  updateDisplay();
});

resetTimer();

// Tab Switching Setup — runs once when page loads
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => (content.style.display = "none"));
    button.classList.add("active");
    const target = document.getElementById(button.dataset.tab);
    if (target) target.style.display = "block";
  });
});
