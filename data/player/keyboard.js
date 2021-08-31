import notify from './notify.js';

const seekToTime = function (player, value) {
  var seekToTime = player.currentTime + value;
  if (seekToTime < 0 || seekToTime > player.duration)
    return;

  player.currentTime = seekToTime;
};
const keyboard = {};
const v = document.querySelector('video');
let timer = null;
const rules = [
  {
    condition(meta, code, shift) {
      return code === 'ArrowRight';
    },
    action() {
      // document.getElementById('seek-forward').click();
      seekToTime(v, 60_0000);
      return true;
    },
  },
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
      if (timer) {
        clearTimeout(timer);
        timer = null;
        notify.display(`Toggle Speed Stopped!:`);
      } else {
        timer = toggleSpeed(10);
        //   timer = toggleSpeed(2, 4, 5);
        notify.display(`Toggle Speed Started:`);
      }
      return true;
    },
  },
];

function toggleSpeed(intervalInSeconds = 10) {
  let range = [
    1, 1.5, 2, 2.5, 3, 3.2, 3.4, 3.4, 3.6, 3.6, 3.8, 3.8,
    3.8, 4, 4, 4,
  ];
  //   let range = [3, 3.2, 3.4, 3.6, 3.8, 4, 4.2, 4.4, 4.6];
  //   let range = [4.6, 4.4, 4.2, 4, 3.8, 3.6, 3.4, 3.2, 3];
  //   let range = [3, 3.5, 4, 4.5, 5];
  let index = 0;
  timer = setInterval(() => {
    //  setSpeed(
    //    range[Math.floor(Math.random() * range.length)]
    //  );
    setSpeed(range[++index % range.length]);
  }, intervalInSeconds * 1000);
  return timer;
}

// function toggleSpeed(min, max, intervalInSeconds) {
//     let toggle = false;
//     timer = setInterval(() => {
//       if (toggle) {
//         setSpeed(min);
//       } else {
//         setSpeed(max);
//       }
//       toggle = !toggle;
//     }, intervalInSeconds * 1000);
//   return timer;
// }

function setSpeed(newSpeed) {
  const speed = document.getElementById('speed');
  const video = document.querySelector('video');

  newSpeed = parseFloat(newSpeed);
  video.playbackRate = newSpeed;
  speed.dataset.mode = newSpeed;
  speed.title = (() => {
    return `CURRENT: ${newSpeed}:\nAdjust player's speed (2X [DEFAULT], 3X, 3.5X, 4X, 4.5X and 5X)\n (Ctrl + X or Command + X)`;
  })();
  //   notify.display(`Speed: ${newSpeed}`);
}

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
