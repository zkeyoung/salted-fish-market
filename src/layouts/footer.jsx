import {
  AppOutline,
  MessageOutline,
  MessageFill,
  UserOutline,
  ShopbagOutline,
  AddOutline,
} from 'antd-mobile-icons';
import { TabBar } from 'antd-mobile';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabBarRoutes } from '../routes';
import Constans from '../lib/constans';
import { forward } from '../lib/utils';
import { useEffect, useState } from 'react';
import store from '../store';
import { apis } from '../api';
import ActionType from '../store/action';

export function refreshUnreadMsgAmount() {
  return apis.getUnreadMsgAmount().then(amount => {
    store.dispatch({ type: ActionType.SET_MSG, msg: { amount } });
  });
}

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [msgBadge, setMsgBadge] = useState(store.getState().msg.amount);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const { msg, socket } = store.getState();
      if (socket.connected && typeof msg.amount === 'number') {
        setMsgBadge(msg.amount);
      }
    });
    return () => {
      unsubscribe();
    };
  });


  const tabMap = {
    [Constans.TabBarTitle.Homepage]: {
      icon: <AppOutline />,
    },
    [Constans.TabBarTitle.PersonCenter]: {
      icon: <UserOutline />,
    },
    [Constans.TabBarTitle.Publish]: {
      icon: <AddOutline />,
      title: undefined,
    },
    [Constans.TabBarTitle.Message]: {
      icon: (active) => active ? <MessageFill /> : <MessageOutline />,
      badge: msgBadge ? (msgBadge > 99 ? '99+' : msgBadge) : undefined,
    },
    [Constans.TabBarTitle.Shopbag]: {
      icon: <ShopbagOutline />,
    },
  };

  const tabs = TabBarRoutes.map(route => Object.assign({
    key: route.path,
    title: route.title,
  }, tabMap[route.title]));
  
  return (
    <TabBar 
      onChange={(path) => forward(navigate, path)}
      activeKey={location.pathname}
      style={{backgroundColor: "#ffffff", position: 'sticky', bottom: 0, borderTop: 'solid 1px rgb(250, 251, 252)'}}>
      {tabs.map(item => (
        <TabBar.Item
          key={item.key}
          icon={item.icon}
          title={item.title}
          badge={item.badge}
        />
      ))}
    </TabBar>
  );
}