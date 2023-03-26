import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apis } from "../../api";
import Header from "../../layouts/header";
import {
  List,
  Image,
  Button,
  Card,
  Tag,
  Toast,
  Modal,
  ImageViewer,
} from 'antd-mobile';
import {
  HeartOutline,
  HeartFill,
  ExclamationCircleOutline,
  ChatAddOutline,
} from 'antd-mobile-icons';
import Constans from "../../lib/constans";
import store from "../../store";
import ShowEmpty from "../components/empty";

function TitleDesc(props) {
  const { goodDetail } = props;
  return (
    <div>
      <div>
        <Tag color='primary' fill='outline'>{Constans.RegionList.find(region => region.value === goodDetail.region)?.label}</Tag>
        <Tag color='primary' fill='outline' style={{marginLeft: '4px'}}>{Constans.CategoryList.find(category => category.value === goodDetail.category)?.label}</Tag>
      </div>
      <div>
        发布于：{new Date(goodDetail.createdAt).toLocaleString()}
        <span style={{float: 'right'}}>价格：<span style={{color: 'red', fontWeight: '500'}}>{(goodDetail.price / 100).toFixed(2)}元</span></span>
      </div>
    </div>
  );
}

function Title(props) {
  const { goodDetail } = props;
  const [concerned, setConcern] = useState(goodDetail.concerned);
  async function handleHeartClick() {
    try {
      await apis.modifyGoodConcern(goodDetail.id);
      Toast.show({
        icon: 'success',
        content: `${concerned ? '取消关注' : '关注'}成功`,
      });
      setConcern(!concerned);
    } catch (err) {
      Toast.show({
        icon: 'fail',
        content: `${concerned ? '取消关注' : '关注'}失败`,
      });
      throw err;
    }
  }
  return (
    <div>
      <List>
        <List.Item
          prefix={
            <Image
              src={goodDetail.user.showAvatar}
              style={{ borderRadius: 20 }}
              fit='cover'
              width={40}
              height={40}
            />
          }
          description={<TitleDesc goodDetail={goodDetail} />}
          >
          {goodDetail.user?.nickname}
          <Button size='mini' color='default' fill='none'
            style={{
              float: 'right',
              paddingLeft: '0px',
              paddingRight: '0px',
              marginRight: '10px',
            }}
            onClick={handleHeartClick}
            loading="auto"
            >
            {
              concerned ? <HeartFill color="red" fontSize={16} /> : <><HeartOutline fontSize={16} /></>
            }
          </Button>
        </List.Item>
      </List>
    </div>
  );
}

function Content(props) {
  const { goodDetail } = props;
  function handleOnclick(index) {
    ImageViewer.Multi.show({
      images: goodDetail.fileUrlsSigned,
      defaultIndex: index,
    })
  }
  return (
    <div style={{ flex: 1, overflow: 'auto',}}>
      <Card title={goodDetail.title} style={{margin: "10px 0px"}}>
        {goodDetail.desc}
      </Card>
      <div>
        {
          goodDetail.fileUrlsSigned && goodDetail.fileUrlsSigned.map(
            (fileUrlSigned, index) =>
              <div onClick={handleOnclick.bind(this, index)} key={index} style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', padding: '0px 5%', background:'#FFFFFF' }}>
                <Image fit="contain" src={fileUrlSigned} width={'100%'} height={'auto'} />
              </div>
          )
        }
      </div>
    </div>
  );
}

function ConversationContent(props) {
  const { goodDetail } = props;
  const navigate = useNavigate();
  const location = useLocation();

  async function handleConversationClick() {
    if (store.getState().token.accessToken) {
      try  {
        const sessionId = await apis.postOneSession(goodDetail.user.id);
        navigate(`/chat/${sessionId}`, { state: { chatUser: goodDetail.user } });
      } catch (err) {
        Toast.show({
          icon: 'fail',
          content: '创建会话失败'
        });
      }
    } else {
      Modal.confirm({
        title: <ExclamationCircleOutline color='var(--adm-color-warning)' fontSize={36} />,
        content: '未登录或登录已失效',
        onConfirm: () => {
          navigate('/login', { state: { path: location.pathname } });
        },
        confirmText: '登录',
      });
    }
  }
  return (
    <div 
      style={{
        padding: '0px 10px 10px',
        position: 'sticky',
        bottom: 0,
        flex: 0, 
      }}
    >
      <Button color='primary' size='large' block onClick={handleConversationClick}><ChatAddOutline /> 沟通</Button>
    </div>
  );
}

export default function GoodDetail() {
  const params = useParams();
  const goodId = params.id;
  const [goodDetail, setGoodDetail] = useState({});
  const [showGoodDetail, setShowGoodDetail] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  useEffect(() => {
    apis.queryGoodDetail(goodId)
      .then(goodDetail => {
        setGoodDetail(goodDetail);
        if (goodDetail.auditStatus === Constans.GoodAuditStatus.PASS && goodDetail.isOnShelf) {
          setShowGoodDetail(true);
          const userInfo = store.getState().user;
          if (userInfo.id !== goodDetail.user.id) {
            setShowConversation(true);
          }
        } else if (goodDetail.user.id === store.getState().user.id) {
          setShowGoodDetail(true);
        }
      });
  }, [goodId]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header title="商品详情"/>
      {
        showGoodDetail ? 
        <>
          <Title goodDetail={goodDetail} />
          <Content goodDetail={goodDetail} />
        </> : <ShowEmpty desc="该商品已下架" />
      }
      {
        showConversation ? <ConversationContent goodDetail={goodDetail} /> : undefined
      }
    </div>
  );
}