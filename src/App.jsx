import { useEffect, useState } from 'react';
import { apis } from './api';
import Constans from './lib/constans';
import { startInterval } from './lib/scheduler';
import { Socket } from './lib/socket';
import RouteList from './routes';
import store from './store';
import ActionType from './store/action';
import Loading from './view/components/loading';
function App() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const openId = localStorage.getItem(Constans.SALTED_FISH_DEVICE);
    refreshTokenAndUrl().catch(() => {});
    async function refreshTokenAndUrl() {
      if (!openId) return;
      store.dispatch({ type: ActionType.SET_TOKEN, token: { refreshToken: openId }});
      const { data } = await apis.authRefreshToken({ refreshToken: openId });
      const newAccessToken = data.accessToken;
      store.dispatch({ type: ActionType.SET_TOKEN, token: { accessToken: newAccessToken, refreshToken: openId } });
      startInterval(openId);
      const userInfo = await apis.getUserInfo();
      store.dispatch({ type: ActionType.SET_USER, user: userInfo });
      Socket.init()
    }
  }, []);

  useEffect(() => {
    store.subscribe(() => {
      const page = store.getState().page;
      if (page.refresh) {
        setShow(false);
        setTimeout(() => {
          setShow(true);
          store.dispatch({ type: ActionType.REFRESH_PAGE, page: { refresh: false } })
        }, 500);
      }
    });
  });
  return (
    <>
      {
        show ? <RouteList /> : <Loading />
      }
    </>
  );
}

export default App;
