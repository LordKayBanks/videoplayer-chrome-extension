import notify from './notify.js';

//   let rangeFast = [
//     2, 2.5, 3, 3.2, 3.4, 3.4, 3.5, 3.5, 3.6, 3.6, 3.7, 3.7,
//     3.7, 3.8, 3.8, 3.8, 3.9, 3.9, 3.9, 4, 4, 4,
//   ]
//     .sort((a, b) => (a < b ? 1 : -1))
//     .concat([2.5, 3, 3.2, 3.4, 3.6, 3.8]);
const rangeFast = [
  3.5, 3.5, 3.6, 3.6, 3.7, 3.7, 3.7, 3.8, 3.8, 3.8, 3.9, 3.9, 3.9, 4,
  4, 4,
]
  .sort((a, b) => (a < b ? 1 : -1))
  .concat([2.5, 3, 3.2, 3.4, 3.6, 3.8]);

const rangeBasic = [
  2, 2.5, 3, 3.2, 3.2, 3.3, 3.3, 3.3, 3.4, 3.4, 3.4, 3.4, 3.4, 3.5,
  3.5, 3.5, 3.5, 3.5,
]
  .sort((a, b) => (a < b ? 1 : -1))
  .concat([2.5, 3, 3.2, 3.4]);

const seekToTime = function (value) {
  const video = document.querySelector('video');
  //   video.controls = false;
  //   setTimeout(() => (video.controls = true), 1000);
  let seekToTime = video.currentTime + value;

  if (seekToTime < 0) {
    video.currentTime = 0;
  } else if (seekToTime > video.duration) video.duration;

  video.currentTime = seekToTime;
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

const shiftKeyDoublePressConfig = {
  lastKeypressTime: null,
  delta: 250,
};

const keyboard = {};
const v = document.querySelector('video');
const config = { timer: null, stopped: true };

const video = document.querySelector('video');
const replayConfig = {
  startPosition: 0,
  endPosition: 120,
  unsubscribe: null,
  endOffset: 120,
  startOffset: 30,
};
const convertToNearest30 = (num) => Math.round(num / 30) * 30;
const rules = [
  {
    condition(meta, code, shift) {
      if (
        code === 'Minus' ||
        code === 'Equal' ||
        code === 'Digit9' ||
        code === 'Digit0'
      ) {
        return true;
      }
    },
    action(e) {
      if (e.code === 'Digit9') {
        replayConfig.startPosition = Math.max(
          replayConfig.startPosition - replayConfig.startOffset,
          0
        );
        replayConfig.startPosition = parseInt(
          replayConfig.startPosition
        );
        video.currentTime = replayConfig.startPosition;
      } else if (e.code === 'Digit0') {
        replayConfig.startPosition = Math.min(
          replayConfig.startPosition + replayConfig.startOffset,
          convertToNearest30(replayConfig.endPosition) -
            replayConfig.endOffset,
          video.duration
        );
        replayConfig.startPosition = parseInt(
          replayConfig.startPosition
        );
        video.currentTime = replayConfig.startPosition;
      } else if (e.code === 'Minus') {
        replayConfig.endPosition = Math.max(
          convertToNearest30(replayConfig.endPosition) -
            replayConfig.startOffset,
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

      notify.display(
        `Replay:\r\nFirstPosition=${toMinutesandSeconds(
          replayConfig.startPosition
        )}\r\nLastPosition=${toMinutesandSeconds(
          replayConfig.endPosition
        )}
        `
      );
      return true;
    },
  },
  {
    condition(meta, code, shift) {
      // return code === 'Period';
      return code === 'Enter';
    },
    action() {
      replayCut();
      return true;
    },
  },
  {
    condition(meta, code, shift) {
      // return code === 'Period';
      return code === 'Enter';
    },
    action() {
      replayCut();
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

      if (video.playbackRate > 3.5) {
        setSpeed(3.5);
        updateSpeedIcon(3.5);
      } else {
        setSpeed(15);
        updateSpeedIcon(15);
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
      const video = document.querySelector('video');
      video.volume = 1;

      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }

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
      if (code === 'KeyQ' || code === 'KeyW') {
        return true;
      }
    },
    action(e) {
      const volume = Math.min(
        1,
        Math.max(
          0,
          Math.round(v.volume * 100 + (e.code === 'KeyQ' ? 5 : -5)) /
            100
        )
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
      return code === 'ShiftRight';
    },
    action() {
      let thisKeypressTime = new Date();
      if (
        thisKeypressTime -
          shiftKeyDoublePressConfig.lastKeypressTime <=
        shiftKeyDoublePressConfig.delta
      ) {
        setSpeed(4);
        updateSpeedIcon(4);

        // optional - if we'd rather not detect a triple-press
        // as a second double-press, reset the timestamp
        thisKeypressTime = 0;
      } else {
        if (video.playbackRate < 3) {
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
];

function replayCut() {
  if (replayConfig.unsubscribe) {
    clearInterval(replayConfig.unsubscribe);
    replayConfig.unsubscribe = null;
    replayConfig.startPosition = 0;
    notify.display('Replay: Stopped!');
  } else {
    replayConfig.startPosition = Math.max(
      convertToNearest30(video.currentTime) -
        replayConfig.startOffset,
      0
    );

    replayConfig.endPosition = Math.min(
      replayConfig.startPosition + replayConfig.endOffset,
      video.duration
    );

    video.currentTime = replayConfig.startPosition;
    replayConfig.unsubscribe = setInterval(() => {
      if (
        video.currentTime >= replayConfig.endPosition - 10 ||
        video.currentTime < replayConfig.startPosition
      ) {
        video.currentTime = replayConfig.startPosition;
        notify.display(
          `Replay:  <<===>>\r\nFirstPosition=${toMinutesandSeconds(
            replayConfig.startPosition
          )}\r\nLastPosition=${toMinutesandSeconds(
            replayConfig.endPosition
          )}`
        );
      }
    }, 1000);

    notify.display(
      `Replay:  <<===>>\r\nFirstPosition=${toMinutesandSeconds(
        replayConfig.startPosition
      )}\r\nLastPosition=${toMinutesandSeconds(
        replayConfig.endPosition
      )}`
    );
  }
}
// function replayCut() {
//   if (replayConfig.startPosition == 0) {
//     replayConfig.startPosition = video.currentTime;
//     notify.display('Replay: First Position Set');
//   } else {
//     if (replayConfig.unsubscribe) {
//       clearInterval(replayConfig.unsubscribe);
//       replayConfig.unsubscribe = null;
//       replayConfig.startPosition = 0;
//       notify.display('Replay: Stopped!');
//     } else {
//       replayConfig.endPosition = video.currentTime;
//       video.currentTime = replayConfig.startPosition;
//       replayConfig.unsubscribe = setInterval(() => {
//         if (video.currentTime >= replayConfig.endPosition) {
//           video.currentTime = replayConfig.startPosition;
//         }
//       }, 2000);
//       notify.display('Replay: Started!');
//     }
//   }
// }

function toggleSpeed(intervalInSeconds = 10, isFAST = false) {
  let index = 0;
  const timer = setInterval(() => {
    if (isFAST) {
      setSpeed(rangeFast[++index % rangeFast.length]);
    } else {
      setSpeed(rangeBasic[++index % rangeBasic.length]);
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

function setSpeed(newSpeed) {
  const video = document.querySelector('video');
  newSpeed = parseFloat(newSpeed);
  video.playbackRate = newSpeed;

  updateSpeedIcon(newSpeed);
  notify.display(`Speed: ${newSpeed}`);
}
function getSpeed() {
  const video = document.querySelector('video');
  return video.playbackRate;
}

document.querySelector('video').addEventListener('play', () => {
  if (config.stopped) return;
  clearTimeout(config.timer);
  config.isFast
    ? (config.timer = toggleSpeed(5, true))
    : (config.timer = toggleSpeed(5));
  notify.display(`Toggle Speed Started:`);
});
document.querySelector('video').addEventListener('ended', () => {
  if (config.stopped) return;
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
  } else if (
    isKeyDown &&
    multipleKeysMap[8] &&
    multipleKeysMap[187]
  ) {
    //   backspace & Equal
    replayConfig.endPosition = Math.min(
      convertToNearest30(replayConfig.endPosition) +
        replayConfig.startOffset,
      video.duration
    );
    replayConfig.startPosition = Math.max(
      convertToNearest30(replayConfig.endPosition) -
        replayConfig.endOffset,
      0
    );
    //  console.error('dn-startPosition==: ', replayConfig.startPosition);
    //  console.error('dn-endPosition: ', replayConfig.endPosition);
    video.currentTime = replayConfig.startPosition;
  }
}
window.addEventListener('keyup', handleMultipleKeyPress);
window.addEventListener('keydown', handleMultipleKeyPress);

function toMinutesandSeconds(seconds) {
  const format = (val) => `0${Math.floor(val)}`.slice(-2);
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;

  return [hours, minutes, seconds % 60].map(format).join(':');
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
      document.documentElement.webkitRequestFullscreen(
        Element.ALLOW_KEYBOARD_INPUT
      );
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
