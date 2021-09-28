import notify from './notify.js';

// const rangeBasic = [2.5, 3.25, 2.5, 3.25, 3, 3.5, 3, 3.5]; /*3.0*/
const rangeBasic = [
  2.5,

  3, 3.5, 3, 3.5, 3, 3.5,
]; /*3.0*/
// const rangeFast = [
//   2.5, 3, 3.25, 3.75, 3.25, 3.75, 3.5, 4, 3.5, 4, 3.5, 4,
// ]; /*3.5*/
const rangeFast = [
  2.5,

  3.5, 4, 3.5, 4, 3.5, 4,
];

const v = document.querySelector('video');
const video = document.querySelector('video');
const keyboard = {};
const config = { timer: null, stopped: true };

const replayConfig = {
  startPosition: 0,
  endPosition: 120,
  unsubscribe: null,
  endOffset: 120,
  startOffset: 30,
  cachedPlaybackRate: 2.0,
};

const alertConfig = {
  alertConfigMidwayTime: null,
  alertConfigOneThirdTime: null,
  alertConfigTwoThirdTime: null,
  speedMode: 1,
  lastKeypressTime: null,
  delta: 500,
};

const shiftKeyDoublePressConfig = {
  lastKeypressTime: 0,
  delta: 200,
};

const rules = [
  {
    condition(meta, code, shift) {
      if (code === 'Minus' || code === 'Equal' || code === 'Digit9' || code === 'Digit0') {
        return true;
      }
    },
    action(e) {
      if (e.code === 'Digit9') {
        replayConfig.startPosition = Math.max(
          replayConfig.startPosition - replayConfig.startOffset,
          0
        );
        replayConfig.startPosition = parseInt(replayConfig.startPosition);
        video.currentTime = replayConfig.startPosition;
      } else if (e.code === 'Digit0') {
        replayConfig.startPosition = Math.min(
          replayConfig.startPosition + replayConfig.startOffset,
          convertToNearest30(replayConfig.endPosition) - replayConfig.endOffset,
          video.duration
        );
        replayConfig.startPosition = parseInt(replayConfig.startPosition);
        video.currentTime = replayConfig.startPosition;
      } else if (e.code === 'Minus') {
        replayConfig.endPosition = Math.max(
          convertToNearest30(replayConfig.endPosition) - replayConfig.startOffset,
          replayConfig.startPosition + replayConfig.endOffset,
          0
        );
        replayConfig.endPosition = parseInt(replayConfig.endPosition);
        //   video.currentTime = replayConfig.startPosition;
      } else if (e.code === 'Equal') {
        replayConfig.endPosition = Math.min(
          replayConfig.endPosition + replayConfig.startOffset,
          video.duration
        );
        replayConfig.endPosition = parseInt(replayConfig.endPosition);
        //   video.currentTime = replayConfig.startPosition;
      }
      notifyReplayStatus();

      return true;
    },
  },
  {
    condition(meta, code, shift) {
      return (
        code === 'Enter' || code === 'Backslash' || code === 'Quote' || code === 'Semicolon'
      );
    },
    action(e) {
      if (e.code === 'Backslash') {
        replayCut(parseInt(video.duration));
      } else if (e.code === 'Quote') {
        replayCut(65);
      } else if (e.code === 'Semicolon') {
        replayCut(35);
      } else if (e.code === 'Enter') {
        notifyReplayStatus();
      }
      return true;
    },
  },
  {
    condition(meta, code, shift) {
      return code === 'KeyM';
    },
    action() {
      video.muted = !video.muted;
      return true;
    },
  },
  {
    condition(meta, code, shift) {
      return code === 'KeyF';
    },
    action() {
      toggleFullScreen();
      return true;
    },
  },
  {
    condition(meta, code, shift) {
      return code === 'ArrowRight';
    },
    action(event) {
      event.preventDefault();
      seekToTime(10);
      return true;
    },
  },
  {
    condition(meta, code, shift) {
      return code === 'ArrowLeft';
    },
    action(event) {
      event.preventDefault();
      seekToTime(-10);
      return true;
    },
  },
  //======================
  {
    condition(meta, code, shift) {
      return code === 'ArrowUp';
      // return code === 'KeyP' && meta && shift;
    },
    action(event) {
      event.preventDefault();
      video.volume = 1;

      if (video.playbackRate > 2) {
        setSpeed(2);
        updateSpeedIcon(2);
      } else {
        setSpeed(4);
        updateSpeedIcon(4);
      }
      return true;
    },
  },
  {
    condition(meta, code, shift) {
      return code === 'ArrowDown';
      // return code === 'KeyN' && meta && shift;
    },
    action(event) {
      event.preventDefault();
      video.volume = 1;
      playPause();

      return true;
    },
  },
  //=================
  {
    condition(meta, code, shift) {
      return code === 'KeyB';
      // return code === 'KeyP' && meta && shift;
    },
    action() {
      document.getElementById('previous').click();
      return true;
    },
  },
  {
    condition(meta, code, shift) {
      return code === 'KeyN';
      // return code === 'KeyN' && meta && shift;
    },
    action() {
      document.getElementById('next').click();
      return true;
    },
  },
  //=================
  {
    // toggle playlist
    condition(meta, code) {
      return code === 'Slash';
      // return code === 'KeyP' && meta;
    },
    action() {
      document.getElementById('p-button').click();

      return true;
    },
  },
  {
    // change volume
    condition(meta, code) {
      if (code === 'KeyQ' || code === 'KeyA') {
        return true;
      }
    },
    action(e) {
      const volume = Math.min(
        1,
        Math.max(0, Math.round(v.volume * 100 + (e.code === 'KeyQ' ? 5 : -5)) / 100)
      );
      try {
        v.volume = volume;
      } catch (e) {
        console.log(volume, e);
      }
      notify.display('Volume: ' + (v.volume * 100).toFixed(0) + '%');
      return true;
    },
  },
  //   {
  //     condition(meta, code) {
  //       return code === 'KeyB' && meta;
  //     },
  //     action() {
  //       document.getElementById('boost').click();

  //       return true;
  //     },
  //   },

  //   {
  //     condition(meta, code) {
  //       return code === 'KeyO';
  //       // return code === 'KeyX' && meta;
  //     },
  //     action() {
  //       document.getElementById('speed').click();

  //       return true;
  //     },
  //   },
  //====================
  {
    condition(meta, code) {
      return code === 'KeyO';
    },
    action() {
      reduceSpeed(5);
      return true;
    },
  },
  {
    condition(meta, code) {
      return code === 'KeyP';
    },
    action() {
      increaseSpeed(5);
      return true;
    },
  },
  {
    condition(meta, code) {
      return code === 'BracketLeft';
    },
    action() {
      reduceSpeed();
      return true;
    },
  },
  {
    condition(meta, code) {
      return code === 'BracketRight';
    },
    action() {
      increaseSpeed();
      return true;
    },
  },
  {
    condition(meta, code) {
      return code === 'MetaRight';
    },
    action(e) {
      video.controls = !video.controls;
      message = ['Speedmode: OFF!', `Controls: ${video.controls}`];
      return false;
    },
  },
  {
    condition(meta, code) {
      return code === 'AltRight';
    },
    action(e) {
      e.preventDefault();
      setSpeed(15);
      updateSpeedIcon(15);
      return false;
    },
  },
  {
    condition(meta, code) {
      return code === 'ShiftRight';
    },
    action() {
      let thisKeypressTime = new Date();
      if (
        thisKeypressTime - shiftKeyDoublePressConfig.lastKeypressTime <=
        shiftKeyDoublePressConfig.delta
      ) {
        setSpeed(15);
        updateSpeedIcon(15);
        thisKeypressTime = 0;
      } else {
        if (video.playbackRate != 3) {
          setSpeed(3);
          updateSpeedIcon(3);
        } else {
          setSpeed(2);
          updateSpeedIcon(2);
        }
      }
      shiftKeyDoublePressConfig.lastKeypressTime = thisKeypressTime;
      return true;
    },
  },

  //=============================

  {
    condition(meta, code) {
      return code === 'KeyX';
    },
    action() {
      if (config.timer) {
        clearTimeout(config.timer);
        config.timer = null;
        notify.display(`Toggle Speed Stopped!:`);
        config.stopped = true;
      } else {
        config.stopped = false;
        notify.display(`Toggle Speed Started Fast:`);
        config.timer = toggleSpeed(5, true);
        config.isFast = true;
      }
      return true;
    },
  },
  {
    condition(meta, code) {
      return code === 'KeyZ';
    },
    action() {
      if (config.timer) {
        clearTimeout(config.timer);
        config.timer = null;
        notify.display(`Toggle Speed Stopped!:`);
        config.stopped = true;
      } else {
        config.stopped = true;
        notify.display(`Toggle Speed Started Normal:`);
        config.timer = toggleSpeed(5);
        config.isFast = false;
      }
      return true;
    },
  },
  {
    condition(meta, code) {
      return code === 'Space';
    },
    action(e) {
      e.preventDefault();
      let thisKeypressTime = new Date();
      const timeSinceSpaceKeyPressed = thisKeypressTime - alertConfig.lastKeypressTime;
      if (timeSinceSpaceKeyPressed >= alertConfig.delta) {
        //   check for single-press of Spacebar
        playPause();
      } else {
        //   check for single-press of Spacebar
        let message;
        if (alertConfig.speedMode == 0) {
          message = 'Speedmode: Slowmode Activated';
          alertConfig.speedMode = 1;
          alertMidWay();
        } else if (alertConfig.speedMode == 1) {
          message = 'Speedmode: Fastmode Activated';
          alertConfig.speedMode = 2;
          alertMidWay();
        } else if (alertConfig.speedMode == 2) {
          message = 'Speedmode: OFF!';
          alertConfig.speedMode = 0;
          alertMidWay();
        }
        notify.display(message);
      }
      alertConfig.lastKeypressTime = thisKeypressTime;
      return true;
    },
  },
];

const convertToNearest30 = (num) => Math.round(num / 30) * 30;

const seekToTime = function (value) {
  const video = document.querySelector('video');
  let seekToTime = video.currentTime + value;

  if (seekToTime < 0) {
    video.currentTime = 0;
  } else if (seekToTime > video.duration) video.duration;

  video.currentTime = seekToTime;
  notify.display(
    `Current Position: <${toMinutesandSeconds(video.currentTime)}> of <${toMinutesandSeconds(
      video.duration
    )}>`
  );
};
function reduceSpeed(value = 0.25) {
  const MIN_SPEED = 0.5;
  let newSpeed = getSpeed() - value;
  newSpeed = newSpeed < MIN_SPEED ? MIN_SPEED : newSpeed;
  setSpeed(newSpeed);
  updateSpeedIcon(newSpeed);
}
function increaseSpeed(value = 0.25) {
  const MAX_SPEED = 15;
  let newSpeed = getSpeed() + value;
  newSpeed = newSpeed > MAX_SPEED ? MAX_SPEED : newSpeed;
  setSpeed(newSpeed);
  updateSpeedIcon(newSpeed);
}

const notifyReplayStatus = () =>
  notify.display(
    `Replay: is ${
      !!replayConfig.unsubscribe ? 'ON!:' : 'OFF!:'
    }\r\nStartPosition: ${toMinutesandSeconds(replayConfig.startPosition)}`,
    `\r\nEndPosition:  <${toMinutesandSeconds(replayConfig.endPosition)}>`
  );

function playPause() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function replayCut(offSet) {
  if (replayConfig.unsubscribe) {
    clearInterval(replayConfig.unsubscribe);
    replayConfig.unsubscribe = null;
    //  replayConfig.startPosition = 0;

    setSpeed(replayConfig.cachedPlaybackRate || 3);
    video.currentTime = replayConfig.endPosition;
    notify.display('Replay: Stopped!');
  } else {
    replayConfig.startPosition = Math.max(convertToNearest30(video.currentTime) - offSet, 0);
    replayConfig.endPosition = Math.min(replayConfig.startPosition + offSet, video.duration);

    setSpeed(2);
    video.currentTime = replayConfig.startPosition;
    replayConfig.unsubscribe = setInterval(() => {
      if (
        video.currentTime >= replayConfig.endPosition - 5 ||
        video.currentTime < replayConfig.startPosition
      ) {
        video.currentTime = replayConfig.startPosition;
        notifyReplayStatus();
      }
    }, 1000);

    notifyReplayStatus();
  }
}

function toggleSpeed(intervalInSeconds = 10, isFAST = false) {
  alertConfig.speedMode = 0;
  alertMidWay();
  //   ==============>

  let index = 0;
  const timer = setInterval(() => {
    if (isFAST) {
      setSpeed(rangeFast[++index % rangeFast.length], false);
    } else {
      setSpeed(rangeBasic[++index % rangeBasic.length], false);
    }
  }, intervalInSeconds * 1000);
  return timer;
}

export function updateSpeedIcon(newSpeed) {
  const speed = document.getElementById('speed');
  const text = document.querySelector('#speed > svg > text');

  newSpeed = parseFloat(newSpeed);
  speed.dataset.mode = `${newSpeed}X`;
  text.innerHTML = `${newSpeed}X`;
  speed.title = (() => {
    return `CURRENT: ${newSpeed}x:\n
    Adjust player's speed (2X [DEFAULT], 3X, 3.5X, 4X, 4.5X and 5X)\n (Ctrl + X or Command + X)`;
  })();
  newSpeed >= 6 ? (video.muted = true) : (video.muted = false);
}

function setSpeed(newSpeed, showNotification = true) {
  replayConfig.cachedPlaybackRate = video.playbackRate;
  newSpeed = parseFloat(newSpeed);
  video.playbackRate = newSpeed;

  updateSpeedIcon(newSpeed);
  showNotification && notify.display(`Speed: ${newSpeed}`);
}
function getSpeed() {
  const video = document.querySelector('video');
  return video.playbackRate;
}

function alertMidWay() {
  clearTimeout(config.timer);

  clearInterval(alertConfig.alertConfigMidwayTime);
  clearInterval(alertConfig.alertConfigTwoThirdTime);
  clearInterval(alertConfig.alertConfigOneThirdTime);

  alertConfig.speedMode == 1 && setSpeed(2.5, false);
  alertConfig.speedMode == 2 && setSpeed(2.5, false);
  //   =================

  const standardLength = 10 * 60; //10mins
  //   const minimumLength = 6 * 60; //6mins
  //   if (video.duration < minimumLength) return;
  //   =================>
  alertConfig.alertConfigOneThirdTime = setInterval(() => {
    const _25PercentTime = video.duration * 0.25; //80%
    if (
      // video.duration > standardLength &&
      video.currentTime > _25PercentTime &&
      video.currentTime < _25PercentTime * 2
    ) {
      alertConfig.speedMode === 1 && setSpeed(3, false);
      alertConfig.speedMode === 2 && setSpeed(3.5, false);
      const remainTime = video.duration - _25PercentTime; //25%
      notify.display(
        `Alert:\r\nJust Past 25%`,
        `\r\n\r\n[${toMinutesandSeconds(remainTime, false)}]`
      );
      clearInterval(alertConfig.alertConfigOneThirdTime);
    }
  }, 2000);
  //   =================>

  alertConfig.alertConfigMidwayTime = setInterval(() => {
    const midwayTime = video.duration * 0.5; //60%
    if (video.currentTime > midwayTime) {
      alertConfig.speedMode == 1 && setSpeed(3, false);
      alertConfig.speedMode == 2 && setSpeed(4, false);
      const remainTime = video.duration - midwayTime; //40%
      notify.display(
        `Alert:\r\nJust Past 50%`,
        `\r\n\r\n[${toMinutesandSeconds(remainTime, false)}]`
      );
      clearInterval(alertConfig.alertConfigMidwayTime);
    }
  }, 2000);

  //   =====================>
  alertConfig.alertConfigTwoThirdTime = setInterval(() => {
    const _75PercentTime = video.duration * 0.75; //80%
    if (
      // video.duration > standardLength &&
      video.currentTime > _75PercentTime
    ) {
      alertConfig.speedMode == 1 && setSpeed(3.5, false);
      alertConfig.speedMode == 2 && setSpeed(4.5, false);
      const remainTime = video.duration - _75PercentTime; //25%
      notify.display(
        `Alert:\r\nJust Past 75%`,
        `\r\n\r\n[${toMinutesandSeconds(remainTime, false)}]`
      );
      clearInterval(alertConfig.alertConfigTwoThirdTime);
    }
  }, 2000);
}

video.addEventListener('seeked', alertMidWay);
video.addEventListener('loadeddata', () => {
  alertMidWay();
  const videoTitle = `${video.origin.name}  `;
  notify.display(videoTitle, `[${toMinutesandSeconds(video.duration)}]`);
});

video.addEventListener('play', () => {
  if (config.stopped) return;
  clearTimeout(config.timer);
  config.isFast ? (config.timer = toggleSpeed(5, true)) : (config.timer = toggleSpeed(5));
  notify.display(`Toggle Speed Started:`);
});

video.addEventListener('ended', () => {
  if (replayConfig.unsubscribe) {
    video.currentTime = replayConfig.startPosition;
    notifyReplayStatus();
  }
  if (config.stopped) return;
  //   setSpeed(replayConfig.cachedPlaybackRate || 3);
  clearTimeout(config.timer);
  config.timer = null;

  clearInterval(replayConfig.unsubscribe);
  replayConfig = {};
  notify.display(`Toggle Speed Stopped:`);
});

document.addEventListener('keydown', (e) => {
  const meta = e.metaKey || e.ctrlKey;
  for (const { condition, action } of rules) {
    if (condition(meta, e.code, e.shiftKey)) {
      if (action(e)) {
        e.preventDefault();
      }
      break;
    }
  }
});

var multipleKeysMap = {};
function handleMultipleKeyPress(evt) {
  let { keyCode, type } = evt || Event; // to deal with IE
  let isKeyDown = type == 'keydown';
  multipleKeysMap[keyCode] = isKeyDown;

  if (isKeyDown && multipleKeysMap[8] && multipleKeysMap[189]) {
    //   backspace & Minus
    replayConfig.startPosition = Math.max(
      replayConfig.startPosition - replayConfig.startOffset,
      0
    );
    replayConfig.endPosition = Math.min(
      replayConfig.startPosition + replayConfig.endOffset,
      video.duration
    );
    video.currentTime = replayConfig.startPosition;
  } else if (isKeyDown && multipleKeysMap[8] && multipleKeysMap[187]) {
    //   backspace & Equal
    replayConfig.endPosition = Math.min(
      convertToNearest30(replayConfig.endPosition) + replayConfig.startOffset,
      video.duration
    );
    replayConfig.startPosition = Math.max(
      convertToNearest30(replayConfig.endPosition) - replayConfig.endOffset,
      0
    );
    //  console.error('dn-startPosition==: ', replayConfig.startPosition);
    //  console.error('dn-endPosition: ', replayConfig.endPosition);
    video.currentTime = replayConfig.startPosition;
  }
}
window.addEventListener('keyup', handleMultipleKeyPress);
window.addEventListener('keydown', handleMultipleKeyPress);

function toMinutesandSeconds(seconds, getFullFormat = true) {
  const format = (val) => `0${Math.floor(val)}`.slice(-2);
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;

  const fullFormat = [hours, minutes, seconds % 60].map(format).join(':');
  const hourMinuteOnlyFormat = [hours, minutes].map(format).join(':');
  return getFullFormat ? fullFormat : hourMinuteOnlyFormat;
}

function toggleFullScreen() {
  if (
    !document.fullscreenElement && // alternative standard method
    !document.mozFullScreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

keyboard.register = (rule) => rules.push(rule);
export default keyboard;
