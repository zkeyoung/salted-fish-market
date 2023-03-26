import { Image, List, Badge, InfiniteScroll } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { apis } from '../../api';
import { Socket } from '../../lib/socket';
import store from '../../store';
import ShowEmpty from '../components/empty';
import { useNavigate } from 'react-router-dom';
import { refreshUnreadMsgAmount } from '../../layouts/footer';

function SessionList(props) {
  const { sessions } = props;
  const navigate = useNavigate();
  return (
    <List>
      {sessions.map(session => (
        <List.Item
          key={session.id}
          prefix={
            <Badge content={session.unreadAmount || undefined}>
              <Image
                src={session.connector.showAvatar}
                style={session.connector.avatar ? {} : { borderRadius: 20, background: '#ff4d4f' }}
                fit='cover'
                width={40}
                height={40}
              />
            </Badge>
          }
          description={session?.lastMessage.content}
          onClick={() => {
            const connector = session.connector;
            navigate(`/chat/${session.id}`, { state: { chatUser: connector } });
          }}
        >
          {session.connector.nickname}
        </List.Item>
      ))}
    </List>
  );
}

export default function Message() {
  const [sessions, setSessions] = useState([]);
  const [hasMore, setHasMore] = useState();
  const [page, setPage] = useState(1);
  const socket = Socket.get();

  useEffect(() => {
    refreshSessions()
  }, []);

  useEffect(() => {
    const { socket: socketState } = store.getState();
    if (socketState.connected) {
      socket.on('message', () => {
        refreshSessions();
      });
    }
    return () => {
      if (socketState.connected) {
        socket.off('message');
        socket.on('message', () => {
          refreshUnreadMsgAmount();
        });
      }
    };
  }, [socket]);

  async function refreshSessions() {
    const sessions = await apis.getSessionsList({ page: 1, perPage: 10 });
    setSessions(sessions);
    setHasMore(sessions.length >= 10);
    setPage(1);
  }

  return (
    <div>
      {sessions.length ? <SessionList sessions={sessions} /> : <ShowEmpty desc="暂无会话数据"/>}
      {
        sessions.length < 10 ? undefined
          :<InfiniteScroll hasMore={hasMore} loadMore={async () => {
            const newSessions = await apis.getSessionsList({ page: page + 1, perPage: 10 });
            setSessions(sessions.concat(newSessions));
            setHasMore(sessions.length >= 10);
            setPage(page + 1);
          }} />
      }
    </div>
  );
}