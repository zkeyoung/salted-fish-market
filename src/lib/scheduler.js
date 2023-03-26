import { refreshToken } from './utils';
const time = 14 * 60 * 1000;
let interval;

function startInterval(openId) {
  setInterval(async () => {
    refreshToken(openId)
      .catch(() => {
        stopInterval();
      });
  }, time);
}

function stopInterval() {
  if (interval) clearInterval(interval);
}

export {
  startInterval,
  stopInterval,
}