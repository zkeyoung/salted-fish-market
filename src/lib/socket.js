import { io } from 'socket.io-client';
import { refreshUnreadMsgAmount } from '../layouts/footer';
import store from '../store';
import ActionType from '../store/action';
import Constans from './constans';
import  { Modal } from 'antd-mobile';
import  { ExclamationCircleOutline } from 'antd-mobile-icons';

let socket = null;

function get() {
  return socket;
}

function init() {
  if (socket) return socket;
  socket = new io(Constans.Hostname.socket,{ path: '/ws/v1/socket.io', reconnectionAttempts: 10 });
  refreshAuth();
  socket.on('connect', () => {
    store.dispatch({ type: ActionType.SET_SOCKET, socket: { connected: true } });
    refreshUnreadMsgAmount();
    const { user } = store.getState();
    socket.on(`${user.id}:tip`, () => {
      refreshUnreadMsgAmount();
    });
  });
  socket.on('exception', function(data) {
    console.log('exception', data);
    refreshAuth();
  });
  socket.on('disconnect', function(reason) {
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });
  return socket;
} 

function refreshAuth() {
  const { token } = store.getState();
  if (socket) {
    socket.auth = { token: `Bearer ${token.accessToken}` }
    socket.disconnect().connect();
  }
}

function exit() {
 if (socket) {
  socket.disconnect().close();
  socket = null;
 }
}

function emit(event, data) {
  return new Promise((resolve, reject) => {
    socket.emit(event, data, ({ statusCode, message }) => {
      if (statusCode === 200) return resolve(message);
      const error = new Error(message);
      error.response = { status: statusCode, message: error.message };
      error.statusCode = statusCode;
      if (statusCode === 401) {
        Modal.confirm({
          title: <ExclamationCircleOutline color='var(--adm-color-warning)' fontSize={36} />,
          content: '未登录或登录已失效，请先登录',
          onConfirm: () => {
            window.location.href = '/login';
          },
          confirmText: '登录',
        });
      }
      return reject(error)
    });
  });
}

export const Socket = {
  init,
  get,
  refreshAuth,
  exit,
  emit,
};