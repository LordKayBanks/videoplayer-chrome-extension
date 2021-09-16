const notify = {};

const toast = document.createElement('div');
toast.style = `
  position: fixed;
  top: 10px;
  right: 10px;
  white-space: pre;
  font-size:16px;
`;
document.body.appendChild(toast);

let id;
notify.display = (msg, period = 4000) => {
  toast.textContent = msg;
  clearTimeout(id);
  id = setTimeout(() => (toast.textContent = ''), period);
};

export default notify;
