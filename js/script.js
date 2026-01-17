const visualizer = document.querySelector('.visualizer');
const box = document.querySelector('.box');
const trackContainer = document.querySelector('.track-info');

try {
  let dataArray;
  let bufferLength = 128;
  let elementLength = bufferLength*2;
  let elements = [];

  let settings = {
      blur: 2,
      indexMultiplier: 0,
      tanInner: 0,
      tanOuter: 0,
      maxVolume: 300,
      despawnVolume: 0,
      volumeColorMultiplier: 5,
      heightStart: 125,
      heightMax: 0,
      scaleX: 1,
      scaleXMin: 0,
      scaleY: 0.1,
      transition: 0.2,
      fps: 60
  };
  let settings_prev = settings;
  

  async function init() {
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

      case "despawnVolume": settings.despawnVolume = val; break;

      case "volumeColorMultiplier": settings.volumeColorMultiplier = val;
        break;
      
      case "heightStart": settings.heightStart = val; break;
      case "heightMax": settings.heightMax = val; break;

      case "scaleX": settings.scaleX = val; break;
      case "scaleXMin": settings.scaleXMin = val; break;
      case "scaleY": settings.scaleY = val; break;
      
      case "transition": settings.transition = val; break;

      case "fpsLock": settings.fps = val ? 30 : 60;
        break;
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
      bufferLength = dataArray.length;
      elementLength = elements.length;
      
      for (let i = 0; i < bufferLength; i++) {
        itemActions(i, dataArray[i]);
        //itemActions(elements.length-i, dataArray[i]);
      }
      settings_prev = settings;
  };

  async function itemActions(item, volume) {
    let svolume=volume;

    if (volume < 130) {
        //volume*=0.4;
    }
    if (volume > 2000) {
        volume *= 0.05;
    }
    if (volume > 3000) {
        volume *= 0.5;
    }
    volume *= 1+(settings.indexMultiplier*item/bufferLength);
    volume = settings.tanOuter*Math.tan(settings.tanInner*volume);
    volume = clamp(volume,0,settings.maxVolume);

    // if (item==0) {
    //   Math.floor(svolume*100)/100+" : "+Math.floor(volume*100)/100;
    // }

    if (volume >= settings.despawnVolume) {
      elements[item].style.background = `
        hsl(${Math.floor(settings.volumeColorMultiplier*volume+(255/bufferLength)*item)},40%,40%)`;
      elements[item].style.transform = `
        rotateZ(${item * ((360/elementLength))}deg) 
        translate(-50%, ${clamp(volume + settings.heightStart,0,settings.heightMax)}px) 
        scaleY(${1 + settings.scaleY*volume}) 
        scaleX(${clamp(settings.scaleX*volume, settings.scaleXMin, 5)}) 
      `;

      if (settings_prev.transition != settings.transition) {
        elements[item].style.transition = settings.transition+"s";
      }

      elements[item].style.visibility="visible";
    } else {
      elements[item].style.visibility="hidden";
    }
    // TODO: fix a data leak i think
  }

  init();

  function livelyAudioListener(audioArray) {
    dataArray = audioArray;

    update();
  }

  /**  */
  async function livelyCurrentTrack(data) {
    let obj = JSON.parse(data);
    //when no track is playing its null
    if (obj != null) {
      
      

      if (obj.Thumbnail != null) {
        
      } else {
        
      }
    } else {

    }
  }

  function livelyWallpaperPlaybackChanged(data) {
    var obj = JSON.parse(data);
    isPaused = obj.IsPaused;
  }
} catch (e) {
    trackContainer.innerText = e;
}