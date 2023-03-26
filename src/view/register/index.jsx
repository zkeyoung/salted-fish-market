import Header from "../../layouts/header";
import {
  Form,
  Button,
  Input,
  Image,
  Checkbox,
  Toast,
} from 'antd-mobile'
import Logo from '../../logo.svg';
import { UserProtocl } from "../components/protocol";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrCodes } from "../../lib/error-code";
import { apis } from "../../api";
import Constans from "../../lib/constans";

function RegisterForm() {
  const [form, setForm] = useState(null);
  const [submitBtnLoading, setSubmitBtnLoading] = useState(false);
  const navigate = useNavigate();
  const [formRef] = Form.useForm();

  async function handSubmit() {
    setSubmitBtnLoading(true);
    try {
      setSubmitBtnLoading(true);
      await apis.authRegister(Object.assign({}, form, { wechatOpenId: localStorage.getItem(Constans.SALTED_FISH_DEVICE) }));
      Toast.show({
        icon: 'success',
        content: '注册成功',
      });
      navigate('/login', { replace: true, state: { showBackArrow: false } });
    } catch (err) {
      if (err.statusCode === ErrCodes.USER_EXIST_ERROR) {
        return Toast.show({
          icon: 'fail',
          content: '注册账号已存在',
        });
      }
      if (err.statusCode === ErrCodes.USER_NICKNAME_EXIST) {
        return Toast.show({
          icon: 'fail',
          content: '昵称已存在',
        });
      }
      if (err.statusCode === ErrCodes.CAPTCHA_ERROR) {
        return Toast.show({
          icon: 'fail',
          content: '验证码错误',
        });
      }
      Toast.show({
        icon: 'fail',
        content: '注册失败，请重试',
      });
    } finally {
      setSubmitBtnLoading(false);
    }
  }

  function confirmPwdValidate(_, rePwd) {
    if (form && rePwd !== form.password) return Promise.reject(new Error('两次输入密码不一致'));
    return Promise.resolve(true);
  }

  return (
    <div>
      <Form
        mode="card"
        layout='horizontal'
        onValuesChange={(field, allFields) => setForm(allFields)}
        onFinish={handSubmit}
        form={formRef}
        footer={
          <Button block type='submit' color='primary' size='large' style={{marginTop: '-20px'}} loading={submitBtnLoading} loadingText="正在注册">
            立即注册
          </Button>
        }
      >
        <Form.Item
          name='username'
          label='账号'
          help='长度6-22位'
          rules={[
            { required: true, message: '账号不能为空', },
            { min: 6, max: 22, message: '账号长度6-22位', type:'string' },
          ]}
        >
          <Input placeholder='请输入账号' clearable="true" />
        </Form.Item>
        <Form.Item
          name='password'
          label='密码'
          help='长度8-16位'
          rules={[
            { required: true, message: '密码不能为空' },
            { min: 8, max: 16, message: '密码长度8-16位' },
          ]}
        >
          <Input placeholder='请输入密码' type="password" autoComplete="on"/>
        </Form.Item>
        <Form.Item
          name='repwd'
          label='确认密码'
          rules={[
            { required: true, message: '确认密码不能为空' },
            { validator: confirmPwdValidate }
          ]}
        >
          <Input placeholder='请输入密码' type="password" autoComplete="on"/>
        </Form.Item>
        <Form.Item
          name='inviteCode'
          label='邀请码'
          help='联系QQ：3076106335'
          rules={[
            { required: true, message: '邀请码不能为空', },
          ]}
        >
          <Input placeholder='请输入邀请码' clearable="true" />
        </Form.Item>
        <Form.Item
          name='agreeProtocol'
          rules={[{ required: true, message: '请勾选用户注册协议' }]}
          style={{
            backgroundColor: 'rgb(250, 251, 252)',
            textAlign: 'center'
          }}
        >
          <Checkbox>我已阅读并同意《<UserProtocl />》</Checkbox>
        </Form.Item>
      </Form>
    </div>
  );
}

function Icon() {
  return (
    <div className="login-icon">
      <Image src={Logo} width="80px" />
    </div>
  );
}

export default function Register() {
  return (
    <>
      <Header title="注册"/>
      <Icon />
      <RegisterForm />
    </>
  );
}