import { List, Image, Toast, Modal } from "antd-mobile";
import { AddOutline, ShopbagOutline, CheckShieldOutline } from 'antd-mobile-icons';
import { useNavigate } from "react-router-dom";
import store from "../../store";
import { logout } from "../../lib/utils";
import Constans from "../../lib/constans";
import { useEffect, useState } from "react";
import ActionType from "../../store/action";
import { apis } from "../../api";

export default function PersonCenter() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({})
  const [showInfo, setShowInfo] = useState('')
  const showNickname = userInfo.showNickname;
  const showAvatar = userInfo.showAvatar;

  useEffect(() => {
    apis.getUserInfo().then(userInfo => {
      store.dispatch({ type: ActionType.SET_USER, user: userInfo });
      setUserInfo(userInfo);
      if (userInfo.auditProfile?.status === Constans.UserProfileAuditStatus.WAIT) setShowInfo('审核中');
      if (userInfo.auditProfile?.status === Constans.UserProfileAuditStatus.REFUSE) setShowInfo('修改失败');
    });
  }, []);

  function handleLogout() {
    logout();
    Toast.show({
      icon: 'success',
      content: '退出成功',
    });
    navigate('/');
  }

  function handleModifyProfileClick() {
    Modal.alert({
      content: '个人资料仅能修改一次',
      showCloseButton: true,
      onConfirm: () => {
        navigate('modify-profile');
      }
    });
  }
  
  return (
    <div>
      <List header='个人资料'>
        <List.Item prefix={<Image
                src={showAvatar}
                style={{ borderRadius: 20 }}
                fit='cover'
                width={40}
                height={40}
              />}
            onClick={userInfo.auditProfile?.status === Constans.UserProfileAuditStatus.PASS ? undefined : (userInfo.auditProfile?.status ? () => navigate('modify-profile') : handleModifyProfileClick)}
          >
            <span style={{float: 'left'}}>{showNickname}</span>
            <span style={{float: 'right', color: 'red'}}> {showInfo} </span>
        </List.Item>
      </List>
      <List header="商品管理">
        <List.Item prefix={<AddOutline />} onClick={() => navigate('/publish')}>
          发布商品
        </List.Item>
        <List.Item prefix={<ShopbagOutline />} onClick={() => navigate('/shop-bag')}>
          我的商品
        </List.Item>
      </List>
      <List header="安全设置">
        <List.Item prefix={<CheckShieldOutline />} onClick={handleLogout}>
          退出登录
        </List.Item>
      </List>
    </div>
  );
}