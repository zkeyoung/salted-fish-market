import request, { refreshRequest } from "../lib/request";
import imageCompression from 'browser-image-compression';
import Constans from "../lib/constans";
import Logo from '../logo.svg';
import store from "../store";
import { v4 as uuid } from 'uuid' ;

/** 获取图片验证码 */
function getCaptcha() {
  let deviceId = localStorage.getItem(Constans.SALTED_FISH_DEVICE);
  if (!deviceId || deviceId.length !== 32) {
    deviceId = uuid().replaceAll('-', '');
    localStorage.setItem(Constans.SALTED_FISH_DEVICE, deviceId);
  }
  return request.post('/auth/captcha', { deviceId: deviceId});
}

/** 用户登录 */
function authLogin(data) {
  return request.post('/auth/token', data, { withCredentials: true });
}

function logout(data) {
  return request.delete('/auth/token/' + data.refreshToken);
}

/** 用户注册 */
function authRegister(data) {
  return request.post('/auth/user', data);
}

/** 刷新token */
function authRefreshToken(data) {
  return refreshRequest.patch('/auth/token/' + data.refreshToken);
}

/** 上传图片 */
async function uploadFile(file, compressOption = { initialQuality: 0.6 }) {
  const compressedFile = await imageCompression(file, compressOption);
  const formData = new FormData();
  formData.append('file', compressedFile)
  const ossKey = await request.post('/files', formData, {
    headers: {
      'content-type': 'multipart/form-data',
    }
  });
  const url = URL.createObjectURL(compressedFile);
  return { url, ossKey, file };
}

async function getFilePreview(ossKey) {
  const resBlob = await request.get(`${Constans.Hostname.cos}/${ossKey}`, { responseType: 'blob' });
  const previewUrl = URL.createObjectURL(resBlob);
  return Promise.resolve({ previewUrl: previewUrl });
}

/** 发布商品 */
function publishGood(data) {
  return request.post('/goods/one', data)
}

/** 获取图片预览多图 */
async function getManyPreviews(fileUrls) {
  const prevews = await Promise.all(fileUrls.map(fileUrl => getFilePreview(fileUrl)));
  return prevews.map(o => o.previewUrl);
}

/** 获取用户发布的商品列表 */
async function getUserGoods(query) {
  const goods = await request.get(`/goods/users/mine`, { params: query });
  const previews = await getManyPreviews(goods.map(good => good.preview));
  return goods.map((good, i) => {
    good.preview = previews[i];
    return good;
  })
}

/** 获取商品 */
async function queryGoods(query) {
  const goods = await request.get(`/goods`, { params: query });
  if (!goods.length) return [];
  const previews = await getManyPreviews(goods.map(good => good.preview));
  return goods.map((good, i) => {
    good.preview = previews[i];
    return good;
  })
}

/** 获取商品详情 */
async function queryGoodDetail(id) {
  const goodDetail = await request.get(`/goods/${id}`);
  const fileUrlsSigned = await getManyPreviews(goodDetail.fileUrls);
  goodDetail.user.showAvatar = goodDetail.user.avatar ? (await getFilePreview(goodDetail.user.avatar)).previewUrl : Logo;
  goodDetail.fileUrlsSigned = fileUrlsSigned;
  return goodDetail;
}

/** 审核商品详情 */
function auditGood(id, data) {
  return request.patch(`/goods/${id}/audit`, data);
}

/** 修改用户商品信息 */
function patchUsersGood(id, data) {
  return request.patch(`/goods/${id}`, data);
}

/** 获取用户信息 */
async function getUserInfo() {
  const userInfo = await request.get('/users/mine');
  if (userInfo.avatar) {
    const { previewUrl } = await getFilePreview(userInfo.avatar, { ignoreWater: true });
    userInfo.avatarSigned = previewUrl;
  }
  if (userInfo.auditProfile && [Constans.UserProfileAuditStatus.WAIT, Constans.UserProfileAuditStatus.REFUSE].some(status => status === userInfo.auditProfile.status)) {
    const { previewUrl } = await getFilePreview(userInfo.auditProfile.avatar, { ignoreWater: true });
    userInfo.auditAvatarSigned = previewUrl;
  }
  if (userInfo.auditProfile && [Constans.UserProfileAuditStatus.WAIT, Constans.UserProfileAuditStatus.REFUSE].some(status => status === userInfo.auditProfile.status)) {
    userInfo.showAvatar = userInfo.auditAvatarSigned;
    userInfo.pickOssKey = userInfo.auditProfile.avatar;
    userInfo.showNickname = userInfo.auditProfile.nickname;
  } else {
    userInfo.showAvatar = userInfo.avatarSigned;
    userInfo.pickOssKey = userInfo.avatar;
    userInfo.showNickname = userInfo.nickname;
  }
  if (!userInfo.showAvatar) userInfo.showAvatar = Logo;
  return userInfo;
}

/** 获取和某用户的聊天记录 */
function getContactsMessageRecord(sessionId, query) {
  return request.get(`/messages/sessions/${sessionId}`, {
    params: query
  });
}

/** 获取未读消息总量 */
function getUnreadMsgAmount() {
  return request.get(`/messages/unread-amount`);
}

/** 获取会话列表 */
async function getSessionsList(query) {
  const user = store.getState().user;
  const sessionList = await request.get('/sessions', { params: query });
  const files = [];
  sessionList.forEach((session, idx) => {
    const connector = session.users.find(u => u.id !== user.id);
    session.connector = connector;
    if (connector.avatar) {
      files.push(connector.avatar);
    }
  });
  const showAvatars = await getManyPreviews(files);
  sessionList.forEach((session) => {
    if (session.connector.avatar) {
      session.connector.showAvatar = showAvatars.shift();
    } else {
      session.connector.showAvatar = Logo;
    }
  });
  return sessionList;
}

/** 消息已读 */
function readMessages(ids) {
  return request.patch('/messages/read-status', { msgIds: ids });
}

/** 删除商品 */
function deleteGoodById(id) {
  return request.delete(`/goods/${id}`);
}

function getImageBlob(url) {
  return request.get(`/files/${url}`, { responseType: 'blob' });
}

/** 获取邮箱验证码 */
function sendEmailVerifyCode(data) {
  return request.post('/captcha/email', data);
}

/** 更新商品关注状态 */
function modifyGoodConcern(goodId) {
  return request.post(`/concerns/one`, { id: goodId });
}

/** 获取商品关注列表 */
async function findGoodConcernList(query) {
  const goods = await request.get('/goods/concern/list', { params: query });
  const previews = await getManyPreviews(goods.map(good => good.preview));
  return goods.map((good, i) => {
    good.preview = previews[i];
    return good;
  });
}

/** 修改用户信息 */
function patchUserInfo(data) {
  return request.patch('/users/mine', data);
}

/** 获取待审核的用户列表 */
async function getAuditUserProfileList(data) {
  const users = await request.get('/users/list', { params: Object.assign(data, {auditStatus: Constans.UserProfileAuditStatus.WAIT }) });
  const pickedAvatars = users.map(user => user.auditAvatar);
  const auditAvatarSigneds = await getManyPreviews(pickedAvatars.filter(avatar => avatar));
  return users.map((user, idx) => {
    user.auditAvatarSigned = pickedAvatars[idx] ? auditAvatarSigneds.shift() : Logo;
    return user;
  });
}

/** 创建会话 */
function postOneSession(userId) {
  return request.post('/sessions/one', { connector: userId });
}

/** 审核用户信息 */
function auditUserProfile(userId, data) {
  return request.patch(`/users/${userId}/audit`, data);
}

/** 获取邀请码 */
function getInviteCodes(query) {
  return request.get('/invite_code', { params: query });
}

/** 生成邀请码 */
function postInviteCodes(data) {
  return request.post('/invite_code', data);
}

export const apis = {
  getCaptcha,
  authLogin,
  authRegister,
  uploadFile,
  publishGood,
  getFilePreview,
  authRefreshToken,
  getUserGoods,
  queryGoods,
  queryGoodDetail,
  auditGood,
  patchUsersGood,
  getUserInfo,
  getContactsMessageRecord,
  getUnreadMsgAmount,
  getSessionsList,
  readMessages,
  deleteGoodById,
  getImageBlob,
  sendEmailVerifyCode,
  modifyGoodConcern,
  findGoodConcernList,
  logout,
  patchUserInfo,
  getAuditUserProfileList,
  auditUserProfile,
  getInviteCodes,
  postInviteCodes,
  postOneSession,
};