import Header from "../../layouts/header";
import {
  Form,
  Button,
  Input,
  Divider,
  Toast,
} from 'antd-mobile'
import Captcha from "../components/captcha";
import { useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState } from "react";
import { apis } from "../../api";
import { ErrCodes } from "../../lib/error-code";
import Icon from "../components/icon";
import store from "../../store";
import ActionType from "../../store/action";
import { Socket } from "../../lib/socket";
import Constans from "../../lib/constans";

function LoginForm() {
  const captchaRef = useRef(null);
  const [captchaKey, setCaptchaKey] = useState('');
  const [form, setForm] = useState(null);
  const [submitBtnLoading, setSubmitBtnLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.state?.path;

  async function handSubmit() {
    try {
      setSubmitBtnLoading(true);
      const { accessToken } = await apis.authLogin(Object.assign({}, form, { captchaKey, deviceId: localStorage.getItem(Constans.SALTED_FISH_DEVICE) }));
      store.dispatch({ type: ActionType.SET_TOKEN, token: { accessToken }});
      localStorage.setItem(Constans.SALTED_FISH_DEVICE, accessToken);
      const userInfo = await apis.getUserInfo();
      store.dispatch({ type: ActionType.SET_USER, user: userInfo });
      Socket.init();
      Toast.show({
        icon: 'success',
        content: '登录成功',
      });
      navigate(path || '/', { replace: true });
    } catch (err) {
      captchaRef.current.click();
      if (err.statusCode === ErrCodes.CAPTCHA_ERROR) {
        return Toast.show({
          icon: 'fail',
          content: '验证码错误',
        });
      }
      if (err.statusCode === ErrCodes.USER_PWD_ERROR || err.statusCode === ErrCodes.PARAM_ERROR) {
        return Toast.show({
          icon: 'fail',
          content: '账号或密码错误',
        });
      }
      Toast.show({
        icon: 'fail',
        content: '登录失败，请重试',
      });
    } finally {
      setSubmitBtnLoading(false);
    }
  }

  return (
    <div>
      <Form
        mode="card"
        layout='horizontal'
        onValuesChange={(field, allFields) => setForm(allFields)}
        onFinish={handSubmit}
        footer={
          <Button block type='submit' color='primary' size='large' loading={submitBtnLoading} loadingText="正在登录">
            登录
          </Button>
        }
      >
        <Form.Item
          name='username'
          label='账号'
          rules={[{ required: true, message: '账号不能为空' }]}
        >
          <Input placeholder='请输入账号' clearable="true" />
        </Form.Item>

        <Form.Item
          name='password'
          label='密码'
          rules={[{ required: true, message: '密码不能为空' }]}
        >
          <Input placeholder='请输入密码' type="password" autoComplete={'on'} />
        </Form.Item>
        <Form.Item
          name='captchaCode'
          label='验证码'
          rules={[
            { required: true, message: '验证码不能为空' },
            { len: 4, message: '验证码长度4位' },
          ]}
          extra={
            <Captcha ref={captchaRef} width="100px" setCaptchaKey={setCaptchaKey} captchaKey={captchaKey}/>
          }
        >
          <Input placeholder='请输入验证码' maxLength='4' />
        </Form.Item>
      </Form>
    </div>
  );
}

export default function Login(props) {
  const location = useLocation();
  const showBackArrow = location.state?.showBackArrow;
  const navigate =  useNavigate();
  return (
    <>
      <Header title="登录" showBackArrow={showBackArrow}/>
      <Icon />
      <LoginForm />
      <Divider style={{margin: "0 12px"}}>
        <Button color='primary' fill='none' size="small" style={{padding: '0px'}} onClick={() => navigate('/register')}>
          没有账号？去注册
        </Button>
      </Divider>
    </>
  );
}