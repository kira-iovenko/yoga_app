// ==== Timer Elements ====
const setsInput = document.getElementById("sets-input");
const prepareMins = document.getElementById("prepare-mins");
const prepareSecs = document.getElementById("prepare-secs");
const flowMins = document.getElementById("flow-mins");
const flowSecs = document.getElementById("flow-secs");
const restMins = document.getElementById("rest-mins");
const restSecs = document.getElementById("rest-secs");
const relaxMins = document.getElementById("relax-mins");
const relaxSecs = document.getElementById("relax-secs");

const timerDisplay = document.getElementById("timer-display");
const timerWidgetTime = document.getElementById("timer-widget-time");
const startBtn = document.getElementById("start-btn");
const progressBar = document.getElementById("progress-bar");
const progressCircle = document.getElementById("progress-bar__circle");
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

// ==== Timer Logic ====
let phase = "prepare"; // "prepare", "flow", "rest", "relaxation"
let currentSeconds = getPrepareSeconds();
let set = 1;
let timerInterval = null;
let isRunning = false;
let radius = progressCircle.r.baseVal.value;
let circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = `${circumference}`;

function getPrepareSeconds() {
  return parseInt(prepareMins.value) * 60 + parseInt(prepareSecs.value);
}

function getFlowSeconds() {
  return parseInt(flowMins.value) * 60 + parseInt(flowSecs.value);
}

function getRestSeconds() {
  return parseInt(restMins.value) * 60 + parseInt(restSecs.value);
}

function getRelaxationSeconds() {
  return parseInt(relaxMins.value) * 60 + parseInt(relaxSecs.value);
}

function fadeInPopup(el) {
  el.classList.add("popup-fade");
  el.style.display = "flex";
  requestAnimationFrame(() => {
    el.classList.add("show");
    el.classList.remove("hide");
    if (typeof callback === "function") {
      setTimeout(callback, 300);
    }
  });
}

function fadeOutPopup(el, callback) {
  el.classList.remove("show");
  el.classList.add("hide");
  setTimeout(() => {
    el.style.display = "none";
    if (typeof callback === "function") {
      callback();
    }
  }, 300);
}

function updateDisplayImmediate() {
  progressCircle.style.transition = "none";
  updateDisplay();
  requestAnimationFrame(() => (progressCircle.style.transition = "stroke-dashoffset 1s linear"));
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
  const prepare = getPrepareSeconds();
  const flow = getFlowSeconds();
  const rest = getRestSeconds();
  const relax = getRelaxationSeconds();
  const totalSeconds = prepare + sets * (flow + rest) + relax;
  let elapsed = 0;

  if (phase === "prepare") {
    elapsed = prepare - currentSeconds;
  } else if (phase === "flow") {
    elapsed = prepare + (set - 1) * (flow + rest) + (flow - currentSeconds);
  } else if (phase === "rest") {
    elapsed = prepare + (set - 1) * (flow + rest) + flow + (rest - currentSeconds);
  } else if (phase === "relaxation") {
    elapsed = prepare + sets * (flow + rest) + (relax - currentSeconds);
  }

  countdownTimer.textContent = formatTime(currentSeconds);
  timerWidgetTime.textContent = formatTime(totalSeconds);
  totalTimeRemaining.textContent = formatTime(totalSeconds - elapsed);

  phaseLabel.textContent = `${phase.toUpperCase()}${phase === "flow" || phase === "rest" ? ` • Set ${set}/${sets}` : ""}`;

  let phaseTotal = 0;
  if (phase === "prepare") phaseTotal = prepare;
  else if (phase === "flow") phaseTotal = flow;
  else if (phase === "rest") phaseTotal = rest;
  else if (phase === "relaxation") phaseTotal = relax;

  const phaseElapsed = phaseTotal - currentSeconds;
  const percent = phaseElapsed / phaseTotal;
  const offset = percent * circumference;
  progressCircle.style.strokeDashoffset = offset;
}

function updateAdjustButtonStates() {
  const sets = parseInt(setsInput.value);
  document.querySelectorAll('[data-target="sets"][data-step="-1"]').forEach((btn) => (btn.disabled = sets <= 1));
  document.querySelectorAll('[data-target="sets"][data-step="1"]').forEach((btn) => (btn.disabled = sets >= 99));

  const updateTimeButtons = (prefix) => {
    const mins = parseInt(document.getElementById(`${prefix}-mins`).value);
    const secs = parseInt(document.getElementById(`${prefix}-secs`).value);
    const total = mins * 60 + secs;

    document
      .querySelectorAll(`[data-target="${prefix}"][data-step="-5"]`)
      .forEach((btn) => (btn.disabled = total <= 0));
    document
      .querySelectorAll(`[data-target="${prefix}"][data-step="5"]`)
      .forEach((btn) => (btn.disabled = total >= 3599));
  };

  updateTimeButtons("prepare");
  updateTimeButtons("flow");
  updateTimeButtons("rest");
  updateTimeButtons("relax");
  updateTimeButtons("pose");
}

// Reset the timer to initial state
function resetTimer(flag = false) {
  clearInterval(timerInterval);
  isRunning = flag;
  set = 0;
  phase = "prepare";
  currentSeconds = getPrepareSeconds();

  startIcon.classList.replace("fa-pause", "fa-play");
  startBtn.title = "Start";
  pauseResumeBtn.innerHTML = `<i class="fas fa-pause"></i> Pause`;

  prepareMins.disabled = false;
  prepareSecs.disabled = false;
  flowMins.disabled = false;
  flowSecs.disabled = false;
  restMins.disabled = false;
  restSecs.disabled = false;
  relaxMins.disabled = false;
  relaxSecs.disabled = false;
  setsInput.disabled = false;

  updateDisplayImmediate();
}

// Validate time inputs to ensure they are within 00-59 range
function validateTimeInputs(input) {
  input.addEventListener("input", () => {
    let num = Math.min(parseInt(input.value) || 0, 59);
    input.value = num.toString().padStart(2, "0");
    if (!isRunning) updateDisplay();
    updateAdjustButtonStates();
  });
}

// Input listeners
[prepareMins, prepareSecs, flowMins, flowSecs, restMins, restSecs, relaxMins, relaxSecs].forEach(validateTimeInputs);

setsInput.addEventListener("input", () => {
  let value = parseInt(setsInput.value) || 1;
  setsInput.value = Math.max(1, Math.min(99, value));
  updateAdjustButtonStates();
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
      
      total = Math.max(0, Math.min(3599, total));
      minInput.value = Math.floor(total / 60).toString().padStart(2, "0");
      secInput.value = (total % 60).toString().padStart(2, "0");
    }
    if (!isRunning) updateDisplay();
    updateAdjustButtonStates();
  });
});

// ==== Timer Start/Pause Logic ====
startBtn.addEventListener("click", () => {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    startIcon.classList.replace("fa-pause", "fa-play");
    startBtn.title = "Start";
    prepareMins.disabled = flowMins.disabled = restMins.disabled = relaxMins.disabled = false;
    prepareSecs.disabled = flowSecs.disabled = restSecs.disabled = relaxSecs.disabled = false;
    setsInput.disabled = false;
  } else {
    if (parseInt(setsInput.value) < 1 || parseInt(setsInput.value) > 99) {
      alert("Please enter a valid number of sets (1-99).");
      return;
    }
    if (getPrepareSeconds() < 0 || getPrepareSeconds() > 3599) {
      alert("Please enter a valid prepare time.");
      return;
    }
    if (getFlowSeconds() <= 0 || getFlowSeconds() > 3599) {
      alert("Please enter a valid flow time.");
      return;
    }
    if (getRestSeconds() < 0 || getRestSeconds() > 3599) {
      alert("Please enter a valid rest time.");
      return;
    }
    if (getRelaxationSeconds() < 0 || getRelaxationSeconds() > 3599) {
      alert("Please enter a valid relaxation time.");
      return;
    }

    isRunning = true;
    prepareMins.disabled = flowMins.disabled = restMins.disabled = relaxMins.disabled = true;
    prepareSecs.disabled = flowSecs.disabled = restSecs.disabled = relaxSecs.disabled = true;
    setsInput.disabled = true;
    startIcon.classList.replace("fa-play", "fa-pause");
    startBtn.title = "Pause";
    fadeInPopup(timerPopup);
    fadeOutPopup(successPopup);

    if (phase === "prepare" && getPrepareSeconds() > 0) {
      currentSeconds = getPrepareSeconds();
      set = 0;
    } else { 
      phase = "flow"; 
      currentSeconds = getFlowSeconds(); 
      set = 1; 
    }

    updateDisplayImmediate();
    timerInterval = setInterval(tickTimer, 1000);
  }
});

function tickTimer() {
  if (currentSeconds > 0) { 
    currentSeconds--; 
    updateDisplay(); 
    return; 
  }
  if (phase === "prepare") { 
    phase = "flow"; 
    set = 1; 
    currentSeconds = getFlowSeconds(); 
  } else if (phase === "flow") { 
    phase = "rest"; 
    currentSeconds = getRestSeconds(); 
  } else if (phase === "rest") {
    set++;
    if (set > parseInt(setsInput.value)) { 
      phase = "relaxation"; 
      currentSeconds = getRelaxationSeconds(); 
    } else { 
      phase = "flow"; 
      currentSeconds = getFlowSeconds(); 
    }
  } else if (phase === "relaxation") {
    phase = "prepare"
    clearInterval(timerInterval); 
    isRunning = false;
    fadeOutPopup(timerPopup); 
    fadeInPopup(successPopup); 
    return;
  }
  updateDisplayImmediate();
}

closePopupBtn.addEventListener("click", () => { 
  clearInterval(timerInterval); 
  isRunning = false; 
  fadeOutPopup(timerPopup); 
  fadeOutPopup(successPopup); 
  resetTimer(); 
});

pauseResumeBtn.addEventListener("click", () => { 
  if (isRunning) { 
    clearInterval(timerInterval); 
    isRunning = false; 
    pauseResumeBtn.innerHTML = `<i class="fas fa-play"></i> Resume`; 
  } else { 
    isRunning = true; 
    pauseResumeBtn.innerHTML = `<i class="fas fa-pause"></i> Pause`; 
    timerInterval = setInterval(tickTimer, 1000); 
  } 
});

skipBtn.addEventListener("click", () => { 
  tickTimer(); 
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
  timerInterval = setInterval(tickTimer, 1000); 
});

resetTimer();
updateAdjustButtonStates();

// ==== Tabs ====
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => (content.style.display = "none"));
    button.classList.add("active");
    const target = document.getElementById(button.dataset.tab);
    if (target) target.style.display = "flex";
  });
});

// ==== Sequences + Poses ====
const sequencePopup = document.getElementById("sequence-popup");
const sequenceNameInput = document.getElementById("sequence-name");
const createSequenceBtn = document.getElementById("create-sequence-btn");
const backToSequencesBtn = document.getElementById("back-to-sequences");

const posePopup = document.getElementById("pose-popup");
const posePopupTitle = document.querySelector("#pose-popup .title");
const addPoseBtn = document.getElementById("add-pose-btn");
const backToSequenceBtn = document.getElementById("back-to-sequence");
const savePoseBtn = document.getElementById("save-pose-btn");
const cancelPoseBtn = document.getElementById("cancel-pose-btn");

const poseNameInput = document.getElementById("pose-name");
const poseMinsInput = document.getElementById("pose-mins");
const poseSecsInput = document.getElementById("pose-secs");
const poseTypeInput = document.getElementById("pose-type");

const sequencesTabList = document.querySelector("#sequences-tab .list-container");
const sequenceList = document.querySelector("#sequence-popup .list-container");

[poseMinsInput, poseSecsInput].forEach(validateTimeInputs);

// ==== Data ====
let sequences = [
  {
    name: "Morning Flow",
    poses: [
      { name: "Sun Salutation", mins: "03", secs: "00", type: "Pose" },
      { name: "Breathing Warmup", mins: "02", secs: "30", type: "Breathing" },
      { name: "Mindful Rest", mins: "05", secs: "00", type: "Meditation" }
    ]
  }
];

let editingSequenceIndex = null;
let editingPoseIndex = null;

// ==== Helpers ====
function resetPoseForm() {
  fadeOutPopup(posePopup, () => {
    poseNameInput.value = "";
    poseMinsInput.value = "00";
    poseSecsInput.value = "30";
    poseTypeInput.value = "Pose";
    posePopupTitle.textContent = "Add Pose";
  });
  fadeInPopup(sequencePopup);
}
function validatePoseForm() {
  const name = poseNameInput.value.trim();
  const totalSeconds = parseInt(poseMinsInput.value) * 60 + parseInt(poseSecsInput.value);
  if (!name) { alert("Pose name cannot be empty."); return false; }
  if (totalSeconds <= 0) { alert("Duration must be greater than 00:00."); return false; }
  if (totalSeconds > 3599) { alert("Duration cannot exceed 59:59."); return false; }
  return true;
}

// ==== Render Functions ====
function renderSequences() {
  sequencesTabList.innerHTML = "";
  sequences.forEach((seq, seqIndex) => {
    const totalSeconds = seq.poses.reduce((acc, p) => acc + parseInt(p.mins) * 60 + parseInt(p.secs), 0);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;

    const card = document.createElement("div");
    card.classList.add("card-container");
    card.innerHTML = `
      <div class="card-header">
        <strong>${seq.name}</strong>
        <div class="card-actions">
          <button class="control" title="Play"><i class="fas fa-play"></i></button>
          <button class="control" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="control" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="card-details">
        <span class="badge time-badge">${m}m ${s}s</span>
        <span class="badge count-badge">${seq.poses.length} poses</span>
      </div>
    `;

    card.querySelector('[title="Edit"]').addEventListener("click", () => {
      editingSequenceIndex = seqIndex;
      sequenceNameInput.value = sequences[seqIndex].name;
      fadeInPopup(sequencePopup);
      renderPoses(seqIndex);
    });
    card.querySelector('[title="Delete"]').addEventListener("click", () => {
      if (confirm("Delete this sequence?")) {
        sequences.splice(seqIndex, 1);
        renderSequences();
      }
    });
    sequencesTabList.appendChild(card);
  });
}
function renderPoses(seqIndex) {
  sequenceList.innerHTML = "";
  sequences[seqIndex].poses.forEach((pose, poseIndex) => {
    const card = document.createElement("div");
    card.classList.add("card-container");
    card.innerHTML = `
      <div class="card-header">
        <strong>${pose.name}</strong>
        <div class="card-actions">
          <button class="control" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="control" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="card-details">
        <span class="badge time-badge">${parseInt(pose.mins)}m ${parseInt(pose.secs)}s</span>
        <span class="badge count-badge">${pose.type}</span>
      </div>
    `;

    // Edit button
    card.querySelector('[title="Edit"]').addEventListener("click", () => {
      editingPoseIndex = poseIndex;
      editingSequenceIndex = seqIndex;
      posePopupTitle.textContent = "Edit Pose";
      poseNameInput.value = pose.name;
      poseMinsInput.value = pose.mins;
      poseSecsInput.value = pose.secs;
      poseTypeInput.value = pose.type;
      fadeOutPopup(sequencePopup);
      fadeInPopup(posePopup);
    });

    // Delete button
    card.querySelector('[title="Delete"]').addEventListener("click", () => {
      if (confirm("Delete this pose?")) {
        sequences[seqIndex].poses.splice(poseIndex, 1);
        renderPoses(seqIndex);
        renderSequences();
      }
    });
    sequenceList.appendChild(card);
  });
}

// ==== Events ====
if (createSequenceBtn) {
  createSequenceBtn.addEventListener("click", () => { 
    const newSequence = { name: "New Sequence", poses: [] };
    sequences.push(newSequence);
    editingSequenceIndex = sequences.length - 1;

    sequenceNameInput.value = newSequence.name;
    fadeInPopup(sequencePopup);
    renderPoses(editingSequenceIndex);
  });
}

if (backToSequencesBtn) { 
  backToSequencesBtn.addEventListener("click", () => { 
    if (editingSequenceIndex !== null) {
      // Save whatever is typed into the input
      sequences[editingSequenceIndex].name = sequenceNameInput.value.trim() || "New Sequence";
      renderSequences();
    }
    fadeOutPopup(sequencePopup); 
  });
}

if (addPoseBtn) {
  addPoseBtn.addEventListener("click", () => {
    editingPoseIndex = null;
    posePopupTitle.textContent = "Add Pose";
    fadeOutPopup(sequencePopup);
    fadeInPopup(posePopup);
  });
}
if (backToSequenceBtn || cancelPoseBtn) {
  [backToSequenceBtn, cancelPoseBtn].forEach((btn) => btn.addEventListener("click", () => resetPoseForm()));
}
if (savePoseBtn) {
  savePoseBtn.addEventListener("click", () => {
    if (!validatePoseForm()) return;
    const newPose = {
      name: poseNameInput.value.trim(),
      mins: poseMinsInput.value.padStart(2, "0"),
      secs: poseSecsInput.value.padStart(2, "0"),
      type: poseTypeInput.value
    };
    if (editingPoseIndex !== null) {
      sequences[editingSequenceIndex].poses[editingPoseIndex] = newPose;
      editingPoseIndex = null;
    } else {
      sequences[editingSequenceIndex].poses.push(newPose);
    }
    renderPoses(editingSequenceIndex);
    resetPoseForm();
  });
}

// ==== Initial Render ====
renderSequences();
