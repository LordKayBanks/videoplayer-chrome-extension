const notify = {};

const toast = document.createElement('div');
const colorText = document.createElement('span');
const blandText = document.createElement('span');
colorText.style = `
  color: red;
  font-weight:bold;`;

toast.style = `
  position: fixed;
  top: 10px;
  left: 10px;
  white-space: pre;
  font-size:18px;
  padding:15px;
  background-color: black;
  color:white;
  opacity: 0;
`;
toast.appendChild(blandText);
toast.appendChild(colorText);
document.body.appendChild(toast);

let id;
notify.display = (msg, period = 4000, colorMsg = '') => {
  colorText.textContent = `\r\n${colorMsg}`;
  blandText.textContent = msg;
  toast.style.opacity = 1;
  clearTimeout(id);
  //   id = setTimeout(() => (toast.textContent = ''), period);
  id = setTimeout(() => {
    toast.style.opacity = 0;
    colorText.textContent = '';
    blandText.textContent = '';
  }, period);
};

export default notify;
