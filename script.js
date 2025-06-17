const workoutMins = document.getElementById('workout-mins');
const workoutSecs = document.getElementById('workout-secs');
const breakMins = document.getElementById('break-mins');
const breakSecs = document.getElementById('break-secs');

const timerDisplay = document.getElementById('timer-display');
const timerTypeEl = document.getElementById('timer-type');
const startBtn = document.getElementById('start-btn');
const switchBtn = document.getElementById('switch-btn');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');

const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');

const TOTAL_ROUNDS = 8;

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
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(currentSeconds);
    timerTypeEl.textContent = isWorkout
        ? `Work - Round ${round} of ${TOTAL_ROUNDS}`
        : `Rest - Round ${round} of ${TOTAL_ROUNDS}`;
    const total = isWorkout ? getWorkSeconds() : getBreakSeconds();
    const percent = (currentSeconds / total) * 100;
    progressBar.style.width = percent + '%';
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    round = 1;
    isWorkout = true;
    currentSeconds = getWorkSeconds();

    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    startBtn.title = 'Start';

    progressContainer.style.display = 'block';

    workoutMins.disabled = false;
    workoutSecs.disabled = false;
    breakMins.disabled = false;
    breakSecs.disabled = false;
    switchBtn.disabled = false;

    updateDisplay();
}

// Input listeners
[workoutMins, workoutSecs].forEach(input => {
    input.addEventListener('input', () => {
        if (!isRunning && isWorkout) {
            currentSeconds = getWorkSeconds();
            updateDisplay();
        }
    });
});

[breakMins, breakSecs].forEach(input => {
    input.addEventListener('input', () => {
        if (!isRunning && !isWorkout) {
            currentSeconds = getBreakSeconds();
            updateDisplay();
        }
    });
});

// Start/Pause button
startBtn.addEventListener('click', () => {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        startBtn.title = 'Start';

        workoutMins.disabled = false;
        workoutSecs.disabled = false;
        breakMins.disabled = false;
        breakSecs.disabled = false;
        switchBtn.disabled = false;
    } else {
        if (getWorkSeconds() <= 0) {
            alert('Please enter a valid workout time.');
            return;
        }
        if (getBreakSeconds() < 0) {
            alert('Please enter a valid break time (0 or more seconds).');
            return;
        }

        isRunning = true;
        workoutMins.disabled = true;
        workoutSecs.disabled = true;
        breakMins.disabled = true;
        breakSecs.disabled = true;
        switchBtn.disabled = true;

        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        startBtn.title = 'Pause';

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
                    if (round > TOTAL_ROUNDS) {
                        alert('Tabata complete! Great job!');
                        clearInterval(timerInterval);
                        isRunning = false;
                        playIcon.style.display = 'block';
                        pauseIcon.style.display = 'none';
                        startBtn.title = 'Start';

                        workoutMins.disabled = false;
                        workoutSecs.disabled = false;
                        breakMins.disabled = false;
                        breakSecs.disabled = false;
                        switchBtn.disabled = false;
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
switchBtn.addEventListener('click', () => {
    if (isRunning) {
        alert('Pause the timer before switching phases.');
        return;
    }
    isWorkout = !isWorkout;
    round = 1;
    currentSeconds = isWorkout ? getWorkSeconds() : getBreakSeconds();
    updateDisplay();
});

// Tab Switching Setup — runs once when page loads
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.style.display = 'none');

        button.classList.add('active');
        const target = document.getElementById(button.dataset.tab);
        if (target) target.style.display = 'block';
    });
});

resetTimer();
