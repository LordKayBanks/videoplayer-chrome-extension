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
  font-size:16px;
  padding:8px;
  background-color: rgba(0,0,0,0.6);
  color:white;
  visibility: hidden;
  border-radius: 10px;
  border: 2px solid red;
  border-bottom: 2px solid lime;
  border-left: 2px solid lime;
  animation: blinking 3s infinite;
  animation-timing-function: cubic-bezier(0.230, 1.000, 0.320, 1.000);
}
`;
toast.appendChild(blandText);
toast.appendChild(colorText);
document.body.appendChild(toast);

let id;
notify.display = (msg, colorMsg = '', period = 10000) => {
  clearTimeout(id);
  colorText.textContent = colorMsg;
  blandText.textContent = msg;
  toast.style.visibility = 'visible';
  id = setTimeout(() => {
    toast.style.visibility = 'hidden';
    colorText.textContent = '';
    blandText.textContent = '';
  }, period);
};

export default notify;
