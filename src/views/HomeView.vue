<template>
  <div>
    <h1 class="center-text">B·U·T Rise!</h1>
    <h2 class="center-text">Rise that butt!</h2>
    <div class="flex">
      <div>
        <label for="standingTime">Standing Time (minutes):</label>
        <input type="number" id="standingTime" v-model="standingTime" />
      </div>
      <div>
        <label for="sittingTime">Sitting Time (minutes):</label>
        <input type="number" id="sittingTime" v-model="sittingTime" />
      </div>
      <div>
        <button @click="toggleTimer">{{ isStanding ? 'Sit Down' : 'Stand Up' }}</button>
        <button @click="pausePlay()">
          {{ timer ? 'Pause' : 'Start' }}
        </button>
        <button @click="resetTimer()">Reset</button>
        <button @click="notify('appels')">Notify test</button>
      </div>
      <div>
        <h2>{{ isStanding ? 'Time to Stand Up!' : 'Time to Sit Down!' }}</h2>
        <p class="timer">{{ formattedTime }}</p>
        <input
          :key="isStanding ? 'standing' : 'sitting'"
          type="range"
          min="0"
          :max="isStanding ? standingTime * 60 : sittingTime * 60"
          v-model="runningRemainingTime"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed, watch } from 'vue'

const standingTime = ref(25)
const sittingTime = ref(50)

const storedStandingTime = chrome.storage.sync.get('standingTime')
const storedSittingTime = chrome.storage.sync.get('sittingTime')
if (storedStandingTime) {
  standingTime.value = parseInt(storedStandingTime)
}
if (storedSittingTime) {
  sittingTime.value = parseInt(storedSittingTime)
}

const isStanding = ref(true)
const timer = ref(null)
const timeRemainingStanding = ref(
  chrome.storage.sync.get('standingTimeRemaining') || standingTime.value * 60
)
const timeRemainingSitting = ref(
  chrome.storage.sync.get('sittingTimeRemaining') || sittingTime.value * 60
)

const runningRemainingTime = computed({
  get: () => (isStanding.value ? timeRemainingStanding.value : timeRemainingSitting.value),
  set: (value) => {
    console.log('runningRemainingTime set:', value)
    if (isStanding.value) {
      timeRemainingStanding.value = parseInt(value)
    } else {
      timeRemainingSitting.value = parseInt(value)
    }
  }
})

const formattedTime = computed(() => {
  const minutes = Math.floor(runningRemainingTime.value / 60)
  const seconds = runningRemainingTime.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

async function notify(message) {
  fetch('/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message
    })
  })
    .then((response) => response.json())
    .then((data) => console.log('Server response:', data))
    .catch((error) => console.error('Error notify:', error))
}

function startTimer() {
  timer.value = setInterval(() => {
    runningRemainingTime.value--
    if (runningRemainingTime.value <= 0) {
      notify(isStanding.value ? 'Time to sit down!' : 'Time to stand up!')
      resetTimer()
      isStanding.value = !isStanding.value
    }
  }, 1000)
  localStorage.setItem('timerIsRunning', true)
}
function pausePlay() {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
    // localStorage.removeItem('timerIsRunning')
    chrome.storage.sync.set('timerIsRunning', false)
  } else {
    startTimer()
  }
}

if (localStorage.getItem('timerIsRunning')) {
  startTimer()
}

function stopTimer() {
  clearInterval(timer.value)
}

function toggleTimer() {
  resetTimer()
  isStanding.value = !isStanding.value
}

function resetTimer() {
  //stopTimer()
  runningRemainingTime.value = isStanding.value ? standingTime.value * 60 : sittingTime.value * 60
}

onUnmounted(() => {
  stopTimer()
})

watch(standingTime, (newValue) => {
  // localStorage.setItem('standingTime', newValue.toString())
  chrome.storage.sync.set('standingTime', newValue.toString())
})

watch(sittingTime, (newValue) => {
  //localStorage.setItem('sittingTime', newValue.toString())
  chrome.storage.sync.set('sittingTime', newValue.toString())
})

watch(runningRemainingTime, (newValue) => {
  chrome.storage.sync.set(
    isStanding.value ? 'standingTimeRemaining' : 'sittingTimeRemaining',
    newValue.toString()
  )
  // localStorage.setItem(
  //   isStanding.value ? 'standingTimeRemaining' : 'sittingTimeRemaining',
  //   newValue.toString()
  // )
})
</script>

<style scoped>
.timer {
  font-size: 4em;
  font-weight: 100;
}
.flex {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
.center-text {
  text-align: center;
}
</style>
