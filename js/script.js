let visualizer = document.querySelector('.visualizer');
let box = document.querySelector('.box');
let trackContainer = document.querySelector('.track-info');

try {
  let audio = [];
  let bufferLength = 128;
  let elementLength = bufferLength;
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
      transition: 0.2,
      baseLocation: 5,
      shakeMultiplier: 1,
      fps: 60
  };
  let settings_prev = settings;

  function init() {
    for(let i = 0; i < (bufferLength); i++) {
        const element = document.createElement('span');
        element.classList.add('element');
        element.style.background = `hsl(${Math.floor(i*(255/bufferLength))},40%,40%)`;

        elements.push(element);
        visualizer.appendChild(element);
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
        box.style.filter = `blur(${settings.blur}px) contrast(10);`
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
      
      case "transition":
        settings.transition = val;
        for (let item of elements) {
          item.style.transition = val + "s";
        }
        break;
      case "baseLocation": settings.baseLocation = val; break;
      case "shakeMultiplier": settings.shakeMultiplier = val; break;

      case "fpsLock": settings.fps = val ? 30 : 60; break;
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    if (audioReady) {update();}
  }
  let shakeX = 0, shakeY = 0;
  let average = 0;
  const update = () => {
      //trackContainer.innerText = dataArray.length;
      for (let i = 0; i < audio.length; i++) {
        average += audio[i];
        if (i==settings.baseLocation && settings.shakeMultiplier!=0) {
          shakeX = 2*(Math.random()-0.5)*audio[i]*settings.shakeMultiplier;
          shakeY = 2*(Math.random()-0.5)*audio[i]*settings.shakeMultiplier;
        }
      }
      average /= audio.length;

      for (let i = 0; i < elements.length; i++) {
        itemActions(i);
      }
  };

  function itemActions(index) {
    let item = elements[index];
    let volume = audio[index];
    const s = settings;

    //if (volume < 130) {volume*=0.4;}
    if (volume > 2000) {volume *= 0.1;}
    if (volume > 2000) {volume *= 0.1;}

    volume += s.averageAddMult/(average+s.averageAddShift);

    volume *= 1+(s.indexMult*index/bufferLength);

    if (s.doAverageMult) {volume *= 
      1+(s.averageMult/(average+s.averageMultShift));}
    if (s.doTan) {volume = s.maxVolume*((Math.PI/2)+
      Math.atan(s.tanMult*volume-s.tanX));
    } else {
      volume = clamp(s.volumeMultiplier*volume,0,s.maxVolume);
    }
    if (volume >= s.despawnVolume) {
      if (settings.volumeColorMult!=0) {
        const color = Math.floor(settings.volumeColorMult*volume+(255/bufferLength)*index);
        const newBackground = `hsl(${color},40%,40%)`;
        if (item.style.background != newBackground) {item.style.background = newBackground;}
      }
      const translateX = `calc(-50%+${shakeX}px)`;
      const translateY = `${clamp(s.heightMultiplier*volume+s.heightMin,0,s.heightMax)+shakeY}px`;
      item.style.transform = `
        rotateZ(${index * (360/bufferLength)}deg)
        translate3d(${translateX}}, ${translateY}px, 0)
        scaleY(${1 + s.scaleY*volume}) 
        scaleX(${clamp(s.scaleX*volume, s.scaleXMin, 5)}) 
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
  async function livelyCurrentTrack(data) {
    // let obj = JSON.parse(data);
    // //when no track is playing its null
    // if (obj != null) {
    //   if (obj.Thumbnail != null) {} else {}
    // } else {}
  }

  function livelyWallpaperPlaybackChanged(data) {
    // var obj = JSON.parse(data);
    // isPaused = obj.IsPaused;
  }

  init();
} catch (e) {
    trackContainer.innerText = e;
}