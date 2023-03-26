const InitState = {
  user: {
    id: '',
    roles: [],
    nickname: '',
    auditStatus: '',
  },
  token: {
    accessToken: '',
    refreshToken: ''
  },
  page: {
    refresh: false,
  },
  socket: {
    connected: false,
  },
  msg: {
    amount: 0,
  },
}
export default InitState;