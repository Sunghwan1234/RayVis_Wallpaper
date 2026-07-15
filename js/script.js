const version = `3.3.1`;

const trackContainer = document.querySelector('.track-info');
const box = document.querySelector('.box');
const background = document.querySelector('#background');

const canvas = document.querySelector('#rayCanvas');
const ctx = canvas.getContext('2d', { alpha: true });

const preloadCanvas = document.createElement('canvas');
const preloadCtx = preloadCanvas.getContext('2d');


const bufferLength = 128;
let audio = new Array(bufferLength).fill(0);
let audioTarget = new Array(bufferLength).fill(0);
let prevAudioTarget = new Array(bufferLength).fill(0);
let audioReady = false;

const settings = {
  backgroundBlur: 4,
  foregroundBlur: 4,
  blur: 0,
  contrast: 100,
  filters: "",
  visualizerSize: 300,
  indexMult: 0,
  doAverageMult: false,
  averageMultShift: 1,
  averageMult: 1,
  doTan: true,
  tanMult: 0,
  tanX: 0,
  volumeMultiplier: 1,
  maxVolume: 300,
  despawnVolume: 0,
  volumeColorMult: 5,
  heightMin: 125,
  heightMax: 0,
  heightMultiplier: 1,
  scaleX: 1,
  scaleXMin: 0,
  scaleY: 0.1,
  transition: 0.5, // AKA Lerp
  baseLocation: 5,
  shakeMultiplier: 1,
  diff: 0.0001,
  fps: 60
};

/** Performance Cache */
const perfCache = {
  /** Angle around a circle */
  angleStep: [],
  /** Sine */
  sin: [],
  cos: [],
  /** Precomputed colors */
  colors: new Int32Array(bufferLength),
  hslHue: [],
};

let image = new Image();
let imageVars = {
  x: 0, y: 0,
  width: 0, height: 0,
};
image.src = "../media/background.jpg";
let preloadedImage = false;
preloadImage();

function init() {
  initPerfCache();
  resizeCanvas();

  trackContainer.innerText = "";
  requestAnimationFrame(loop);
}
function initPerfCache() {
  for (let i=0;i<bufferLength;i++) {
    perfCache.angleStep[i] = i * (Math.PI * 2) / bufferLength;
    perfCache.sin[i] = Math.sin(perfCache.angleStep[i]);
    perfCache.cos[i] = Math.cos(perfCache.angleStep[i]);
    perfCache.colors[i] = Math.floor(360 * i / bufferLength);
  }
  for (let i=0;i<360;i++) {
    perfCache.hslHue[i] = `hsl(${i},50%,50%)`;
  }
}
const clamp = (num, min, max) => {
  if (num >= max) return max; if (num <= min) return min; return num;
}
function logText(e) {
  trackContainer.innerText = e;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/** Settings are changed in lively */
function livelyPropertyListener(name, val) {
  switch (name) {
    case "backgroundBlur":
      settings.backgroundBlur = val;
      updateCanvasFilters();
      preloadImage();
      break;
    case "foregroundBlur":
      settings.foregroundBlur = val;
      updateCanvasFilters();
      preloadImage();
      break;
    case "blur":
      settings.blur = val;
      updateCanvasFilters();
      break;
    case "contrast":
      settings.contrast = val;
      updateCanvasFilters();
      break;
    case "filters":
      settings.filters = val;
      updateCanvasFilters();
      break;
    case "visualizerSize":
      settings.visualizerSize = val;
      break;
    // case "averageAddMult": settings.averageAddMult = val; break;
    // case "averageAddShift": settings.averageAddShift = val; break;

    case "indexMultiplier": settings.indexMult = val; break;

    case "doAverageMult": settings.doAverageMult = val; break;
    case "averageMultShift": settings.averageMultShift = val; break;
    case "averageMult": settings.averageMult = val; break;
    case "doTan": settings.doTan = val; break;
    case "tanMultiplier": settings.tanMult = val; break;
    case "tanX": settings.tanX = val; break;
    case "volumeMultiplier": settings.volumeMultiplier = val; break;
    case "maxVolume": settings.maxVolume = val; break;

    case "despawnVolume": settings.despawnVolume = val; break;

    case "volumeColorMult": settings.volumeColorMult = val; break;

    case "heightMin": settings.heightMin = val; break;
    case "heightMax": settings.heightMax = val; break;
    case "heightMultiplier": settings.heightMultiplier = val; break;

    case "scaleX": settings.scaleX = val; break;
    case "scaleXMin": settings.scaleXMin = val; break;
    case "scaleY": settings.scaleY = val; break;

    case "transition": settings.transition = val; break;
    case "baseLocation": settings.baseLocation = val; break;
    case "shakeMultiplier": settings.shakeMultiplier = val; break;

    case "diff": settings.diff = val; break;
    case "fpsLock": settings.fps = val ? 30 : 60; break;
  }
}
function updateCanvasFilters() {
  canvas.style.filter = `blur(${settings.blur}px) contrast(${settings.contrast}%) ${settings.filters}`;
}
let lastFrameTime = 0;
/** Runs the animation loop */
function loop(time) {
  const frame = 1000/settings.fps;

  if (audioReady && (time-lastFrameTime >= frame)) {
    lastFrameTime = time;
    update();
  }
  requestAnimationFrame(loop);
}
let frames = 0;
let lastTime = performance.now();
function countFrames() {
  frames++;
  if (performance.now() - lastTime > 1000) {
      //do something with frames here
      frames = 0;
      lastTime = performance.now();
  }
}
/** Update inside loop() */
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //ctx.filter = `blur(${settings.blur}px) contrast(${settings.contrast})`;

  const s = settings;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  let average = 0;
  const transition = s.transition
  for (let i = 0; i < audio.length; i++) {
    audioTarget[i] += (audio[i] - audioTarget[i]) * transition;
    average += audioTarget[i];
  }
  average /= audioTarget.length;

  let shakeX=0, shakeY=0, bshakeX=0, bshakeY=0;
  if (s.shakeMultiplier !== 0) {
    const shakeVolume = audioTarget[s.baseLocation];
    shakeX = 0.1 * (Math.random() - 0.5) * shakeVolume * s.shakeMultiplier;
    shakeY = 0.1 * (Math.random() - 0.5) * shakeVolume * s.shakeMultiplier;
    bshakeX = 0.05 * (Math.random() - 0.5) * shakeVolume * s.shakeMultiplier;
    bshakeY = 0.05 * (Math.random() - 0.5) * shakeVolume * s.shakeMultiplier;
  }

  /** Draw the full image first */
  ctx.drawImage(preloadCanvas, imageVars.x + bshakeX, imageVars.y + bshakeY, imageVars.width, imageVars.height);
  // Draw the little circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, s.visualizerSize/2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(preloadCanvas, imageVars.x + shakeX, imageVars.y + shakeY, imageVars.width, imageVars.height);
  ctx.restore();

  const visualizerRadius = s.visualizerSize / 2;
  const heightMax = s.heightMax === 0 ? canvas.height : s.heightMax;
  const averageMult = 1 + (s.averageMult / (average + s.averageMultShift));

  for (let i = 0; i < bufferLength; i++) {
    if (s.diff != 0 && Math.abs(audioTarget[i] - prevAudioTarget[i]) <= s.diff) { continue; }
    let volume = audioTarget[i];

    if (s.indexMult>0) {
      volume *= 1 + (s.indexMult * i / bufferLength);
    }
    if (s.doAverageMult) {volume *= averageMult;}
    if (s.doTan) {
      volume = s.maxVolume * ((Math.PI / 2) + Math.atan(s.tanMult * volume - s.tanX));
    } else {
      volume = clamp(s.volumeMultiplier * volume, 0, s.maxVolume);
    }
    if (volume < s.despawnVolume) {continue;}

    const angle = perfCache.angleStep[i];
    const translateY = clamp(visualizerRadius + s.heightMin + s.heightMultiplier*volume, 0, visualizerRadius + heightMax);
    const scaleX = clamp(s.scaleX * volume, s.scaleXMin, 5);

    const barWidth = scaleX*4<1 ? 1 : scaleX*4; // Min 1
    const barHeight = 1 + (s.scaleY * volume * 10);

    const cos = perfCache.cos[i];
    const sin = perfCache.sin[i];
    /** Rotate the bars */
    ctx.setTransform(
      cos, sin, -sin, cos,
      centerX + shakeX, centerY + shakeY
    );

    const baseColor = perfCache.colors[i];
    const finalHue = s.volumeColorMult!==0 ? (Math.floor(s.volumeColorMult * volume) + baseColor) : baseColor;
    ctx.fillStyle = perfCache.hslHue[finalHue<0 ? (finalHue % 360) + 360 : finalHue % 360];

    ctx.fillRect(-barWidth / 2, translateY, barWidth, barHeight);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};


function livelyAudioListener(audioArray) {
  audio = audioArray; audioReady = true;
}

/**  */
function livelyCurrentTrack(data) {
  const obj = JSON.parse(data);
  let trackImage = "../media/background.jpg";
  if (obj && obj.Thumbnail) {
    //songTitle = obj.Title; songArtist = obj.Artist;
    trackImage = !obj.Thumbnail.startsWith("data:image/")
      ? "data:image/png;base64," + obj.Thumbnail
      : obj.Thumbnail;
    //style.backgroundAttachment = "fixed"; // Keeps it from scrolling?
  }
  image.src = trackImage;

  background.src = trackImage;
}

image.onload = () => { preloadImage(); };

function livelyWallpaperPlaybackChanged(data) {
  // var obj = JSON.parse(data);
  // isPaused = obj.IsPaused;
}

function preloadImage() {
  const hRatio = canvas.width / image.width;
  const vRatio = canvas.height / image.height;
  const ratio = Math.min(hRatio, vRatio);
  imageVars.width = image.width * ratio;
  imageVars.height = image.height * ratio;

  imageVars.x = (canvas.width - imageVars.width) / 2;
  imageVars.y = (canvas.height - imageVars.height) / 2;

  preloadCanvas.width = imageVars.width;
  preloadCanvas.height = imageVars.height;
  if (ratio > 1) {
    preloadCtx.filter = `blur(${settings.backgroundBlur}px)`;
  }
  preloadCtx.clearRect(0, 0, preloadCanvas.width, preloadCanvas.height);
  preloadCtx.drawImage(image, 0, 0, imageVars.width, imageVars.height);

  preloadedImage = true;
}

init();

window.onerror = function(message, source, lineno, colno, error) {
  logText(message+" At line:"+lineno);
};