const setsInput = document.getElementById("sets-input");
const workoutMins = document.getElementById("work-mins");
const workoutSecs = document.getElementById("work-secs");
const breakMins = document.getElementById("rest-mins");
const breakSecs = document.getElementById("rest-secs");

const timerDisplay = document.getElementById("timer-display");
const timerWidgetTime = document.getElementById("timer-widget-time");
const startBtn = document.getElementById("start-btn");
const progressBar = document.getElementById("progress-bar");

const startIcon = document.getElementById("start-icon");

const timerPopup = document.getElementById("timer-popup");
const closePopupBtn = document.getElementById("close-popup-btn");
const pauseResumeBtn = document.getElementById("pause-resume-btn");
const skipBtn = document.getElementById("skip-btn");
const countdownTimer = document.getElementById("countdown-timer");
const phaseLabel = document.getElementById("phase-label");
const totalTimeRemaining = document.getElementById("total-time-remaining");

const successPopup = document.getElementById("success-popup");
const closeBtn = document.getElementById("close-btn");
const restartBtn = document.getElementById("restart-btn");

let isWorkout = true;
let currentSeconds = 0;
let set = 1;
let timerInterval = null;
let isRunning = false;

function getWorkSeconds() {
  return parseInt(workoutMins.value) * 60 + parseInt(workoutSecs.value);
}

function getBreakSeconds() {
  return parseInt(breakMins.value) * 60 + parseInt(breakSecs.value);
}

function fadeInPopup(el) {
  el.classList.add("popup-fade");
  el.style.display = "flex";
  requestAnimationFrame(() => {
    el.classList.add("show");
    el.classList.remove("hide");
  });
}

function fadeOutPopup(el) {
  el.classList.remove("show");
  el.classList.add("hide");
  setTimeout(() => {
    el.style.display = "none";
  }, 300);
}

function updateDisplay() {
  const pad = (num) => num.toString().padStart(2, "0");
  const formatTime = (s) => {
    const h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      sec = s % 60;
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  };

  const sets = parseInt(setsInput.value) || 1;
  const work = getWorkSeconds();
  const rest = getBreakSeconds();
  const totalSeconds = sets * (work + rest);
  const elapsed = (set - 1) * (work + rest) + (isWorkout ? work - currentSeconds : work + rest - currentSeconds);

  countdownTimer.textContent = formatTime(currentSeconds);
  timerWidgetTime.textContent = formatTime(totalSeconds);
  totalTimeRemaining.textContent = formatTime(totalSeconds - elapsed);

  phaseLabel.textContent = `${isWorkout ? "WORKOUT" : "REST"} • Set ${set}/${sets}`;

  const percent = ((totalSeconds - elapsed) / totalSeconds) * 100;
  progressBar.style.width = `${percent}%`;
}

// Reset the timer to initial state
function resetTimer(flag = false) {
  clearInterval(timerInterval);
  isRunning = flag;
  set = 1;
  isWorkout = true;
  currentSeconds = getWorkSeconds();

  startIcon.classList.replace("fa-pause", "fa-play");
  startBtn.title = "Start";
  pauseResumeBtn.innerHTML = `<i class="fas fa-pause"></i> Pause`;

  workoutMins.disabled = false;
  workoutSecs.disabled = false;
  breakMins.disabled = false;
  breakSecs.disabled = false;
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
        total += step > 0 ? 5 - mod : -mod;
      } else {
        total += step;
      }

      total = Math.max(0, Math.min(3599, total)); // clamp to 59:59

      minInput.value = Math.floor(total / 60)
        .toString()
        .padStart(2, "0");
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
    startIcon.classList.replace("fa-pause", "fa-play");
    startBtn.title = "Start";

    workoutMins.disabled = false;
    workoutSecs.disabled = false;
    breakMins.disabled = false;
    breakSecs.disabled = false;
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
    setsInput.disabled = true;

    startIcon.classList.replace("fa-play", "fa-pause");
    startBtn.title = "Pause";
    fadeInPopup(timerPopup);
    fadeOutPopup(successPopup);

    if (currentSeconds === 0) {
      currentSeconds = getWorkSeconds();
      isWorkout = true;
      set = 1;
    }

    updateDisplay();

    timerInterval = setInterval(() => {
      if (currentSeconds > 0) {
        currentSeconds--;
        updateDisplay();
      } else {
        if (!isWorkout) {
          set++;
          if (set > parseInt(setsInput.value)) {
            clearInterval(timerInterval);
            isRunning = false;
            fadeOutPopup(timerPopup);
            fadeInPopup(successPopup);
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

// Close the timer popup, stop the timer, and reset everything
closePopupBtn.addEventListener("click", () => {
  fadeOutPopup(timerPopup);
  fadeOutPopup(successPopup);
  clearInterval(timerInterval);
  isRunning = false;
  resetTimer();
});

// Toggle between pausing and resuming the timer
pauseResumeBtn.addEventListener("click", () => {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    pauseResumeBtn.innerHTML = `<i class="fas fa-play"></i> Resume`;
  } else {
    isRunning = true;
    pauseResumeBtn.innerHTML = `<i class="fas fa-pause"></i> Pause`;
    timerInterval = setInterval(() => {
      if (currentSeconds > 0) {
        currentSeconds--;
        updateDisplay();
      } else {
        if (!isWorkout) {
          set++;
          if (set > parseInt(setsInput.value)) {
            clearInterval(timerInterval);
            isRunning = false;
            fadeOutPopup(timerPopup);
            fadeInPopup(successPopup);
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

// Skip to the next phase (workout <-> rest) and advance the round
skipBtn.addEventListener("click", () => {
  if (isWorkout) {
    // Skip workout → switch to rest
    isWorkout = false;
    currentSeconds = getBreakSeconds();
  } else {
    // Skip rest → increment round or finish if done
    set++;
    if (set > parseInt(setsInput.value)) {
      clearInterval(timerInterval);
      isRunning = false;
      fadeOutPopup(timerPopup);
      fadeInPopup(successPopup);
      return;
    }
    isWorkout = true;
    currentSeconds = getWorkSeconds();
  }
  updateDisplay();
});

closeBtn.addEventListener("click", () => {
  fadeOutPopup(timerPopup);
  fadeOutPopup(successPopup);
  resetTimer();
});


restartBtn.addEventListener("click", () => {
  fadeInPopup(timerPopup);
  fadeOutPopup(successPopup);
  resetTimer(true);

  timerInterval = setInterval(() => {
    if (currentSeconds > 0) {
      currentSeconds--;
      updateDisplay();
    } else {
      if (!isWorkout) {
        set++;
        if (set > parseInt(setsInput.value)) {
          clearInterval(timerInterval);
          isRunning = false;
          fadeOutPopup(timerPopup);
          fadeInPopup(successPopup);
          return;
        }
      }
      isWorkout = !isWorkout;
      currentSeconds = isWorkout ? getWorkSeconds() : getBreakSeconds();
      updateDisplay();
    }
  }, 1000);
});

