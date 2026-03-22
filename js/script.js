const visualizer = document.querySelector('.visualizer');
const box = document.querySelector('.box');
const trackContainer = document.querySelector('.track-info');

try {
  let audio;
  let bufferLength = 128;
  let elementLength = bufferLength;
  let elements = [];

  let settings = {
      blur: 2,
      indexMultiplier: 0,
      tanInner: 0,
      tanOuter: 0,
      maxVolume: 300,
      averageAddition: 1,
      averageMultiplier: 1,
      despawnVolume: 0,
      volumeColorMultiplier: 5,
      heightStart: 125,
      heightMultiplier: 1,
      heightMax: 0,
      scaleX: 1,
      scaleXMin: 0,
      scaleY: 0.1,
      transition: 0.2,
      fps: 60
  };
  let settings_prev = settings;
  

  function init() {
    for(let i = 0; i < (bufferLength); i++) {
        const element = document.createElement('span');
        element.classList.add('element');
        elements.push(element);
        visualizer.appendChild(element);
    }

    trackContainer.innerText = "";
  }

  const clamp = (num, min, max) => {
      if(num >= max) return max;
      if(num <= min) return min;
      return num;
  }

  /** Settings are changed in lively */
  function livelyPropertyListener(name, val) {
    switch (name) {
      case "blur": settings.blur = val; break;

      case "indexMultiplier": settings.indexMultiplier = val; break;

      case "tanInner": settings.tanInner = val; break;
      case "tanOuter": settings.tanOuter = val; break;
      case "maxVolume": settings.maxVolume = val; break;

      case "averageAddition": settings.averageAddition = val; break;
      case "averageMultiplier": settings.averageMultiplier = val; break;

      case "despawnVolume": settings.despawnVolume = val; break;

      case "volumeColorMultiplier": settings.volumeColorMultiplier = val; break;
      
      case "heightStart": settings.heightStart = val; break;
      case "heightMultiplier": settings.heightMultiplier = val; break;
      case "heightMax": settings.heightMax = val; break;

      case "scaleX": settings.scaleX = val; break;
      case "scaleXMin": settings.scaleXMin = val; break;
      case "scaleY": settings.scaleY = val; break;
      
      case "transition": settings.transition = val; break;

      case "fpsLock": settings.fps = val ? 30 : 60; break;
    }
  }

  const update = () => {
      if (settings_prev.blur != settings.blur) {
        box.style.filter = `blur(${settings.blur}px) contrast(10);`
      }
      // setTimeout(function () {
      //   requestAnimationFrame(update);
      // }, 1000 / settings.fps);
      //trackContainer.innerText = dataArray.length;
      bufferLength = audio.length;
      elementLength = elements.length;

      let average = 0;
      for (let v in audio) {average+=v;}
      average/=bufferLength;

      for (let i = 0; i < bufferLength; i++) {
        itemActions(i, average);
      }
      settings_prev = settings;
  };

  async function itemActions(index, average) {
    let item = elements[index];
    let volume = audio[index];

    if (volume < 130) {//volume*=0.4;
    }
    if (volume > 2000) {volume *= 0.05;}
    if (volume > 3000) {volume *= 0.05;}

    volume *= 1+(settings.indexMultiplier*index/bufferLength);

    volume *= 1+settings.averageMultiplier/(average+settings.averageAddition);

    volume = settings.tanOuter*Math.tan(settings.tanInner*volume);
    volume = clamp(volume,0,settings.maxVolume);
    // if (item==0) {
    //   Math.floor(svolume*100)/100+" : "+Math.floor(volume*100)/100;
    // }
    if (volume >= settings.despawnVolume) {
      item.style.background = `
        hsl(${Math.floor(settings.volumeColorMultiplier*volume+(255/bufferLength)*index)},40%,40%)`;
      item.style.transform = `
        rotateZ(${index * ((360/elementLength))}deg) 
        translate(-50%, ${clamp(settings.heightMultiplier*volume + settings.heightStart,0,settings.heightMax)}px) 
        scaleY(${1 + settings.scaleY*volume}) 
        scaleX(${clamp(settings.scaleX*volume, settings.scaleXMin, 5)}) 
      `;

      if (settings_prev.transition != settings.transition) {
        item.style.transition = settings.transition+"s";
      }
      item.style.visibility="visible";
    } else {
      if (item.style.visibility != "hidden") {
        item.style.visibility="hidden";
      }
    }
    // TODO: fix a data leak i think
  }
  function livelyAudioListener(audioArray) {
    audio = audioArray; //TODO: make it smoother (transition speed but builtin)
    update();
  }

  /**  */
  async function livelyCurrentTrack(data) {
    let obj = JSON.parse(data);
    //when no track is playing its null
    if (obj != null) {
      if (obj.Thumbnail != null) {} else {}
    } else {}
  }

  function livelyWallpaperPlaybackChanged(data) {
    var obj = JSON.parse(data);
    isPaused = obj.IsPaused;
  }

  init();
} catch (e) {
    trackContainer.innerText = e;
}