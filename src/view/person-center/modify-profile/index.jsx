import Header from "../../../layouts/header";
import { useLocation } from 'react-router-dom';
import { ImageUploader, Toast, Form, Input, Button, Modal } from "antd-mobile";
import { PictureOutline } from 'antd-mobile-icons';
import { useState } from "react";
import { apis } from "../../../api";
import { forward } from "../../../lib/utils";
import { useNavigate } from 'react-router-dom';
import store from "../../../store";
import Constans from "../../../lib/constans";
import { ErrCodes } from "../../../lib/error-code";

export default function ModifyProfile() {
  const location = useLocation();
  const showBackArrow = location.state?.showBackArrow;
  const userInfo = store.getState().user;
  const showAvatar = userInfo.showAvatar;
  const showNickname = userInfo.showNickname;
  let showInfo = '';
  if (userInfo.auditProfile?.status === Constans.UserProfileAuditStatus.WAIT) showInfo = '审核中';
  if (userInfo.auditProfile?.status === Constans.UserProfileAuditStatus.REFUSE) showInfo = <span> 修改失败，请修改后重新提交。<br />失败原因：{userInfo.auditProfile.message} </span>;
  const [fileList, setFileList] = useState([{ url: showAvatar, ossKey: userInfo.pickOssKey }]);
  const [form, setForm] = useState({ auditNickname: showNickname });
  const [submitBtnLoading, setSubmitBtnLoading] = useState(false);
  const navigate = useNavigate();

  function beforeUpload(file) {
    if (file.size > 1024 * 1024 * 2) {
      Toast.show('请选择小于 2M 的图片')
      return null
    }
    return file
  }
  async function uploadFile(file) {
    return await apis.uploadFile(file, { initialQuality: 0.6, maxWidthOrHeight: 200, });
  }

  async function handSubmit() {
    try {
      setSubmitBtnLoading(true)
      if (fileList[0].ossKey) {
        await apis.patchUserInfo(Object.assign({ auditAvatar: fileList[0].ossKey }, form))
        Toast.show({
          icon: 'success',
          content: '修改资料成功'
        });
        forward(navigate, '/person-center')
      } else {
        Modal.confirm({
          title: "提示",
          content: '检测到没有修改头像，确认修改吗？',
          onConfirm: async () => {
            try {
              await apis.patchUserInfo(Object.assign({}, form))
              Toast.show({
                icon: 'success',
                content: '修改资料成功'
              });
              forward(navigate, '/person-center');
            } catch (err) {
              if (err.statusCode === ErrCodes.USER_NICKNAME_EXIST) {
                return Toast.show({
                  icon: 'fail',
                  content: '该昵称已存在',
                });
              } else if (err.statusCode === ErrCodes.USER_PROFILE_ONLY_MODIFY_ONCE) {
                Toast.show({
                  icon: 'fail',
                  content: '个人资料仅能修改一次',
                });
              } else {
                Toast.show({
                  icon: 'fail',
                  content: '修改资料失败',
                });
              }
            }
          }
        });
      }
    } catch (err) {
      if (err.statusCode === ErrCodes.USER_NICKNAME_EXIST) {
        return Toast.show({
          icon: 'fail',
          content: '该昵称已存在',
        });
      } else if (err.statusCode === ErrCodes.USER_PROFILE_ONLY_MODIFY_ONCE) {
        Toast.show({
          icon: 'fail',
          content: '个人资料仅能修改一次',
        });
      } else {
        Toast.show({
          icon: 'fail',
          content: '修改资料失败',
        });
      }
    } finally {
      setSubmitBtnLoading(false);
    }
  }
  return (
    <div>
      <Header title="修改个人资料" showBackArrow={showBackArrow}/>
      <div style={{ padding: '0px 12px' }}>
        <span style={{color: 'red', fontSize: '16px'}}>{showInfo}</span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px'
        }}
        >
        <ImageUploader value={fileList} onChange={setFileList}
          upload={uploadFile}
          beforeUpload={beforeUpload}
          maxCount={1}
          style={{borderRadius: 40}}
          disableUpload={userInfo.auditProfile?.status === Constans.UserProfileAuditStatus.WAIT}
          deletable={userInfo.auditProfile?.status !== Constans.UserProfileAuditStatus.WAIT}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#999999',
            }}
          >
          <PictureOutline style={{ fontSize: 40 }} />
        </div>
        </ImageUploader>
      </div>
      <div>
      <Form
        mode="card"
        layout='horizontal'
        onValuesChange={(field, allFields) => setForm(allFields)}
        onFinish={handSubmit}
        initialValues={form}
        footer={
          <Button
            block
            type='submit'
            color='primary'
            size='large'
            style={{marginTop: '-20px'}}
            loading={submitBtnLoading}
            loadingText="正在确认修改"
            disabled={userInfo.auditProfile?.status === Constans.UserProfileAuditStatus.WAIT}
            >
            确认修改
          </Button>
        }
      >
        <Form.Item
          name='auditNickname'
          label='昵称'
          help='长度6-22位'
          rules={[
            { required: true, message: '昵称不能为空', },
            { min: 3, max: 12, message: '昵称长度3-12位', type:'string' },
          ]}
          disabled={userInfo.auditProfile?.status === Constans.UserProfileAuditStatus.WAIT}
        >
          <Input placeholder='请输入要修改的昵称' clearable="true" />
        </Form.Item>
      </Form>
      </div>
    </div>
  );
}