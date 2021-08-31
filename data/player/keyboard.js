import notify from './notify.js';

const seekToTime = function (value) {
  const video = document.querySelector('video');

  let seekToTime = video.currentTime + value;
  if (seekToTime < 0 || seekToTime > video.duration) return;

  video.currentTime = seekToTime;
};

const keyboard = {};
const v = document.querySelector('video');
const config = { timer: null, stopped: true };
const rules = [
  {
    condition(meta, code, shift) {
      return code === 'ArrowRight';
    },
    action() {
      seekToTime(45);
      return true;
    },
  },
  {
    condition(meta, code, shift) {
      return code === 'ArrowLeft';
    },
    action() {
      seekToTime(-45);
      return true;
    },
  },
  //======================
  {
    condition(meta, code, shift) {
      return code === 'ArrowUp';
      // return code === 'KeyP' && meta && shift;
    },
    action() {
      document.getElementById('previous').click();

      return true;
    },
  },
  {
    condition(meta, code, shift) {
      return code === 'ArrowDown';
      // return code === 'KeyN' && meta && shift;
    },
    action() {
      document.getElementById('next').click();

      return true;
    },
  },
  {
    // toggle playlist
    condition(meta, code) {
      return code === 'KeyP';
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
          Math.round(
            v.volume * 100 + (e.code === 'KeyQ' ? 5 : -5)
          ) / 100
        )
      );
      try {
        v.volume = volume;
      } catch (e) {
        console.log(volume, e);
      }
      notify.display(
        'Volume: ' + (v.volume * 100).toFixed(0) + '%'
      );
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
  {
    condition(meta, code) {
      return code === 'KeyO';
      // return code === 'KeyX' && meta;
    },
    action() {
      document.getElementById('speed').click();

      return true;
    },
  },
  //====================
  {
    condition(meta, code) {
      return code === 'Semicolon';
    },
    action() {
      setSpeed(3);
      return true;
    },
  },
  {
    condition(meta, code) {
      return code === 'Quote';
    },
    action() {
      setSpeed(2);
      return true;
    },
  },
  {
    condition(meta, code) {
      return code === 'Backslash';
    },
    action() {
      setSpeed(3.5);
      return true;
    },
  },
  {
    condition(meta, code) {
      return code === 'Enter';
    },
    action() {
      setSpeed(4);
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

function toggleSpeed(
  intervalInSeconds = 10,
  isFAST = false
) {
  let rangeFast = [
    1.5, 2, 2.5, 3, 3.2, 3.4, 3.4, 3.5, 3.5, 3.6, 3.6, 3.7,
    3.7, 3.7, 3.8, 3.8, 3.8, 3.9, 3.9, 3.9, 4, 4, 4,
  ]
    .sort((a, b) => (a < b ? 1 : -1))
    .concat([2, 2.5, 3, 3.2, 3.4, 3.6, 3.8]);

  let rangeBasic = [
    1.5, 2, 2.5, 3, 3.2, 3.2, 3.3, 3.3, 3.3, 3.4, 3.4, 3.4,
    3.4, 3.4, 3.5, 3.5, 3.5, 3.5, 3.5,
  ]
    .sort((a, b) => (a < b ? 1 : -1))
    .concat([2, 2.5, 3, 3.2, 3.4]);

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

function setSpeed(newSpeed) {
  const speed = document.getElementById('speed');
  const video = document.querySelector('video');

  newSpeed = parseFloat(newSpeed);
  video.playbackRate = newSpeed;
  speed.dataset.mode = newSpeed;
  speed.title = (() => {
    return `CURRENT: ${newSpeed}:\nAdjust player's speed (2X [DEFAULT], 3X, 3.5X, 4X, 4.5X and 5X)\n (Ctrl + X or Command + X)`;
  })();
  notify.display(`Speed: ${newSpeed}`);
}

document
  .querySelector('video')
  .addEventListener('play', () => {
    if (config.stopped) return;
    clearTimeout(config.timer);
    config.timer = config.isFast
      ? toggleSpeed(5, true)
      : toggleSpeed(5);
    notify.display(`Toggle Speed Started:`);
  });
document
  .querySelector('video')
  .addEventListener('pause', () => {
    //  if (config.stopped) return;
    clearTimeout(config.timer);
    config.timer = null;
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
keyboard.register = (rule) => rules.push(rule);

export default keyboard;
