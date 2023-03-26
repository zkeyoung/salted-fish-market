import axios from 'axios';
import store from '../store';
import  { Modal, Toast } from 'antd-mobile';
import  { ExclamationCircleOutline } from 'antd-mobile-icons';
import Constans from './constans';

const axiosOption = {
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: Constans.Hostname.api,
  // 超时
  timeout: 10 * 1000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
};

// 创建axios实例
const request = axios.create(axiosOption);
// refresh token实例
export const refreshRequest = axios.create(axiosOption);

// request拦截器
request.interceptors.request.use(
  config => {
    const token = store.getState().token.accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config
  },
)

// 响应拦截器
request.interceptors.response.use(
  res => {
    return res.data;
  },
  async error => {
    if (error.response?.status === 401) {
      Modal.confirm({
        title: <ExclamationCircleOutline color='var(--adm-color-warning)' fontSize={36} />,
        content: '未登录或登录已失效，请先登录',
        onConfirm: () => {
          window.location.href = '/login';
        },
        confirmText: '登录',
      });
    }
    if (error.response?.status === 429) {
      Toast.show({
        // icon: 'fail',
        content: '请求太频繁，请稍后再试',
      });
    }
    return Promise.reject(error.response?.data || error.message);
  }
)

export default request;