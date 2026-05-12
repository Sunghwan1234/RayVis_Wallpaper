const trackContainer = document.querySelector('.track-info');
const box = document.querySelector('.box');
const background = document.querySelector('#background');
const thumbnail = document.querySelector('#thumbnail');
const visualizer = document.querySelector('.visualizer');
const container = document.querySelector('.container');

try {
  let bufferLength = 128;
  let audio = new Array(bufferLength).fill(0);
  let audioTarget = new Array(bufferLength).fill(0);
  let prevAudioTarget = new Array(bufferLength).fill(0);
  let elements = [];
  let audioReady = false;

  let settings = {
      blur: 2,
      visualizerSize: 300,
      averageAddMult: 0,
      averageAddShift: 1,
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
  let settings_prev = settings;

  function init() {
    for(let i = 0; i < (bufferLength); i++) {
        const element = document.createElement('span');
        element.classList.add('element');
        element.style.background = `hsl(${Math.floor(i*(255/bufferLength))},40%,40%)`;

        elements.push(element);
        container.appendChild(element);
    }
    trackContainer.innerText = "";
    animate();
  }
  const clamp = (num, min, max) => {
      if(num >= max) return max; if(num <= min) return min; return num;
  }

  /** Settings are changed in lively */
  function livelyPropertyListener(name, val) {
    switch (name) {
      case "blur":
        settings.blur = val;
        box.style.filter = `blur(${settings.blur}px)`;
        break;
      case "visualizerSize":
        settings.visualizerSize = val;
        visualizer.style.width = settings.visualizerSize+"px";
        visualizer.style.height = settings.visualizerSize+"px";
        break;
      case "averageAddMult": settings.averageAddMult = val; break;
      case "averageAddShift": settings.averageAddShift = val; break;

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

  function animate() {
    requestAnimationFrame(animate);
    if (audioReady) {update();}
  }
  let average = 0;
  const update = () => {
    for (let i = 0; i < audio.length; i++) {
      audioTarget[i] += (audio[i]-audioTarget[i]) * settings.transition;

      average += audioTarget[i];
      if (i==settings.baseLocation && settings.shakeMultiplier!=0) {
        const shakeX = 0.1*(Math.random()-0.5)*audioTarget[i]*settings.shakeMultiplier;
        const shakeY = 0.1*(Math.random()-0.5)*audioTarget[i]*settings.shakeMultiplier;
        visualizer.style.transform = `translate3d(${shakeX}px, ${shakeY}px, 0)`;

        const bshakeX = 0.05*(Math.random()-0.5)*audioTarget[i]*settings.shakeMultiplier;
        const bshakeY = 0.05*(Math.random()-0.5)*audioTarget[i]*settings.shakeMultiplier;
        thumbnail.style.transform = `translate3d(${bshakeX}px, ${bshakeY}px, 0)`;
      }
    }
    average /= audioTarget.length;
    
    
    for (let i = 0; i < elements.length; i++) {
      itemActions(i);
    }
    //trackContainer.innerText = audioTarget;
  };

  function itemActions(index) {
    if (settings.diff!=0&&Math.abs(audioTarget[index]-prevAudioTarget[index])<=settings.diff) {return;}
    let item = elements[index];
    let volume = audioTarget[index];
    let s = settings;

    if (s.averageAddMult!=0) {volume+=s.averageAddMult/(average+s.averageAddShift);}

    volume *= 1+(s.indexMult*index/bufferLength);

    if (s.doAverageMult) {volume*=1+ (s.averageMult/(average+s.averageMultShift));}
    if (s.doTan) {volume=s.maxVolume*((Math.PI/2) + Math.atan(s.tanMult*volume-s.tanX));
    } else {
      volume = clamp(s.volumeMultiplier*volume,0,s.maxVolume);
    }
    if (volume >= s.despawnVolume) {
      if (settings.volumeColorMult!=0) {
        const color = Math.floor(settings.volumeColorMult*volume+(255/bufferLength)*index);
        const newBackground = `hsl(${color},40%,40%)`;
        if (item.style.background != newBackground) {item.style.background = newBackground;}
      }
      const translateY = clamp(s.heightMultiplier*volume+s.heightMin,0,s.heightMax);
      const scaleX = clamp(s.scaleX*volume, s.scaleXMin, 5);
      item.style.transform = `
        rotateZ(${index * (360/bufferLength)}deg) 
        translate(-50%, ${translateY}px) 
        scale(${scaleX}, ${1 + s.scaleY*volume}) 
      `;
      if (item.style.visibility != "visible") {item.style.visibility="visible";}
    } else {
      if (item.style.visibility != "hidden") {item.style.visibility="hidden";}
    }
  }

  function livelyAudioListener(audioArray) {
    audio = audioArray;
    audioReady = true;
  }

  /**  */
  function livelyCurrentTrack(data) {
    let obj = JSON.parse(data);
    if (obj == null) {
    } else {
      //songTitle = obj.Title;
      //songArtist = obj.Artist;

      if (obj.Thumbnail != null) {
        const base64String = !obj.Thumbnail.startsWith("data:image/")
        ? "data:image/png;base64," + obj.Thumbnail
        : obj.Thumbnail;
        thumbnail.src = base64String;

        background.src = base64String;

        let style = visualizer.style;

        style.backgroundImage = `url(${base64String})`;
        // Fix sizing and repeating
        style.backgroundRepeat = "no-repeat";
        style.backgroundSize = "auto 100vh"; // For full-scale
        //style.backgroundSize = "cover";
        style.backgroundPosition = "center";
        //style.backgroundAttachment = "fixed"; // Keeps it from scrolling
      } else {
        thumbnail.src = "../media/background.jpg";
      }
    }
  }

  function livelyWallpaperPlaybackChanged(data) {
    // var obj = JSON.parse(data);
    // isPaused = obj.IsPaused;
  }

  init();
} catch (e) {
    trackContainer.innerText = e;
}