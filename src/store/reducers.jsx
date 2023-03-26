import InitState from './state';
import { combineReducers } from 'redux';
import ActionType from './action';

function userReducer(state = InitState.user, action) {
  switch(action.type) {
    case ActionType.SET_USER:
      return Object.assign({}, state, action.user);
    case ActionType.RESET_USER:
      return Object.assign({}, state, InitState.user);
    default:
      return state;
  }
}

function tokenReducer(state = InitState.token, action) {
  switch (action.type) {
    case ActionType.SET_TOKEN:
      return Object.assign({}, state, action.token);
    case ActionType.RESET_TOKEN:
      return Object.assign({}, state, InitState.token);
    default: 
      return state;
  }
}

function pageReducer(state = InitState.page, action) {
  switch (action.type) {
    case ActionType.REFRESH_PAGE:
      return Object.assign({}, state, action.page);
    default: 
      return state;
  }
}

function socketReducer(state = InitState.socket, action) {
  switch(action.type) {
    case ActionType.SET_SOCKET:
      return Object.assign({}, state, action.socket);
    case ActionType.RESET_SOCKET:
      return Object.assign({}, state, InitState.socket);
    default:
      return state;
  }
}

function msgReducer(state = InitState.msg, action) {
  switch(action.type) {
    case ActionType.SET_MSG:
      return Object.assign({}, state, action.msg);
    case ActionType.RESET_MSG:
      return Object.assign({}, state, InitState.msg);
    default:
      return state;
  }
}

export default combineReducers({
  user: userReducer,
  token: tokenReducer,
  page: pageReducer,
  socket: socketReducer,
  msg: msgReducer
});