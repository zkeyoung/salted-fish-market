import {
  Empty,
  List,
  Tabs,
  Image,
  Button,
  Modal,
  PullToRefresh,
  InfiniteScroll,
  Toast,
  ImageViewer,
  Form,
  Selector,
  TextArea,
  Tag,
  Stepper,
  DatePicker,
} from "antd-mobile";
import {
  ExclamationCircleOutline,
} from 'antd-mobile-icons';
import { useRef } from "react";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apis } from "../../api";
import Constans from "../../lib/constans";
import { haveRoles, RefreshPage } from "../../lib/utils";
import store from "../../store";
import './index.css';

function ItemDescription(props) {
  const { good, type } = props;
  const navigate = useNavigate();
  const [editLoading, setEditLoading] = useState(false);
  
  function handleDeleteGood(id) {
    Modal.confirm({
      title: <ExclamationCircleOutline color='var(--adm-color-danger)' fontSize={36} />,
      content: '确定要删除该商品吗？',
      onConfirm: async () => {
        try {
          await apis.deleteGoodById(id);
          Toast.show({
            icon: 'success',
            content: '删除成功',
          });
          RefreshPage();
        } catch (err) {
          Toast.show({
            icon: 'fail',
            content: '删除失败',
          });
        } 
      },
    })
  }

  function handleIsOnShelf() {
    if (good.isOnShelf) {
      Modal.confirm({
        title: <ExclamationCircleOutline color='var(--adm-color-warning)' fontSize={36} />,
        content: '确定要下架商品吗？',
        onConfirm: async () => {
          await apis.patchUsersGood(good.id, { isOnShelf: false });
          Toast.show({
            icon: 'success',
            content: '下架成功',
          });
          RefreshPage()
        },
      })
    } else {
      apis.patchUsersGood(good.id, { isOnShelf: true }).then(() => {
        Toast.show({
          icon: 'success',
          content: '上架成功',
        });
        RefreshPage()
      });
    }
  }

  function handleEditClick() {
    if (good.auditStatus === Constans.GoodAuditStatus.PASS) {
      Modal.confirm({
        title: '确认修改吗？',
        content: '修改之后需要重新审核',
        onConfirm: async () => {
          const goodDetail = await apis.queryGoodDetail(good.id);
          navigate('/publish', { state: { goodDetail } });
        },
        confirmText: '去修改'
      })
    } else {
      setEditLoading(true);
      apis.queryGoodDetail(good.id).then(goodDetail => {
        navigate('/publish', { state: { goodDetail } });
      }).finally(() => setEditLoading(false));
    }
  }

  async function handleConcernClick() {
    try {
      await apis.modifyGoodConcern(good.id);
      Toast.show({
        icon: 'success',
        content: '取消收藏成功'
      });
      RefreshPage();
    } catch (err) {
      Toast.show({
        icon: 'fail',
        content: '取消收藏失败'
      });
      throw err;
    }
  }

  return (
    <>
      <div style={{ marginBottom: '5px'}}>
        <div>
          {type === 'my-concern' ? undefined: <span>状态：{good.auditStatus === Constans.GoodAuditStatus.PASS ? (good.isOnShelf ? '已上架': '下架') : Constans.GoodsAuditStatusMap[good.auditStatus].label }</span>}
          <span style={{ float: type === 'my-concern' ? 'left': 'right',}}>价格：{good.price / 100}元</span>
        </div>
        <div>
          {
            good.auditStatus === Constans.GoodAuditStatus.REFUSE ?
              <span style={{color: 'red'}}>原因：{good.auditMessage}</span>
              :
              undefined
          }
        </div>
      </div>
      <div style={{textAlign: 'right'}}>
        {
          type === 'to-audit' ? 
            undefined
            :
            (
              type === 'my-concern' ?
              <Button
                size='mini'
                color="default"
                loading="auto"
                onClick={e=>{
                  handleConcernClick()
                  e.stopPropagation()
                }}
                >取消收藏</Button>
                :
                good.auditStatus === Constans.GoodAuditStatus.PASS ?
                  <>
                    <Button
                      size='mini'
                      color="default"
                      onClick={e=>{
                        handleIsOnShelf()
                        e.stopPropagation()
                      }}
                      style={{marginRight: '10px'}}
                      >{good.isOnShelf ? '下架' : '上架'}</Button>
                    <Button size='mini' color="default" onClick={e=>{
                      handleEditClick()
                      e.stopPropagation()
                    }} disabled={good.isOnShelf} loading={editLoading}>修改</Button>
                  </>
                  :
                  <>
                    <Button size='mini' color="danger" style={{marginRight: '10px'}} onClick={(e) => {
                      handleDeleteGood(good.id);
                      e.stopPropagation()
                    }}>删除</Button>
                    <Button size='mini' color="default" onClick={e=>{
                      handleEditClick()
                      e.stopPropagation()
                    }} disabled={good.isOnShelf} loading={editLoading}>修改</Button>
                  </>
            )
        }
      </div>
    </>
  );
}

const AuditForm = forwardRef((props, ref) => {
  const { item } = props;
  const [form, setForm] = useState({auditStatus: [Constans.UserProfileAuditStatus.PASS]});
  const selectOptions = [
    Object.assign({}, Constans.UserProfileAuditStatusMap[Constans.GoodAuditStatus.PASS], { label: '通过' }),
    Object.assign({}, Constans.UserProfileAuditStatusMap[Constans.GoodAuditStatus.REFUSE], { label: '拒绝' }),
  ];

  useImperativeHandle(ref, () => ({
    submit: handSubmit,
  }));

  async function handSubmit() {
    try {
      await apis.auditUserProfile(item.id, Object.assign({}, form, { auditStatus: form.auditStatus[0] } ));
      Toast.show({
        icon: 'success',
        content: '审核成功',
      });
    } catch (err) {
      Toast.show({
        icon: 'fail',
        content: err.message
      })
      throw(err);
    }
  }

  return (
    <Form 
        mode="default"
        layout='vertical'
        onValuesChange={(field, allFields) => setForm(allFields)}
        onFinish={handSubmit}
        initialValues={{ auditStatus: [Constans.UserProfileAuditStatus.PASS] }}
      >
      <Form.Item name='auditStatus' label="审核状态" rules={[
        { required: true, message: '审核状态必选' }
      ]}>
        <Selector options={selectOptions}/>
      </Form.Item>
      {
        form.auditStatus[0] === Constans.UserProfileAuditStatus.PASS ? undefined
          :
          <Form.Item name='auditMessage' label="拒绝理由" rules={[
            { required: true, message: '拒绝理由必填' }
          ]}>
            <TextArea showCount
              maxLength={300}
              placeholder='请输入拒绝理由'/>
          </Form.Item>
      }
    </Form>
  );
});

function UserProfileItem(props) {
  const { user, firstLoad } = props;
  const formRef = useRef();
  function handleImageClick(user) {
    return () => {
      ImageViewer.show({image: user.auditAvatarSigned})
    }
  }
  function handleAduitClick() {
    Modal.confirm({
      title: '用户资料审核',
      content: <AuditForm ref={formRef} item={user} />,
      onConfirm: async () => {
        await formRef.current.submit();
        firstLoad();
      }
    });
  }
  return (
    <List.Item
     prefix={<Image src={user.auditAvatarSigned} fit={'contain'} height={62} width={120} onClick={handleImageClick(user)} />}
     description={<Button style={{float: 'right'}} size='small' color="primary" onClick={handleAduitClick}>审核</Button>}
    >
      <span style={{float: 'left'}}>昵称：{user.auditNickname}</span>
    </List.Item>
  );
}

function InviteCodeItem(props) {
  const { inviteCode } = props;
  function copyContentH5(content) {
    const copyDom = document.createElement('div');
    copyDom.innerText=content;
    copyDom.style.position='absolute';
    copyDom.style.top='0px';
    copyDom.style.right='-9999px';
    document.body.appendChild(copyDom);
    //创建选中范围
    const range = document.createRange();
    range.selectNode(copyDom);
    //移除剪切板中内容
    window.getSelection().removeAllRanges();
    //添加新的内容到剪切板
    window.getSelection().addRange(range);
    //复制
    const successful = document.execCommand('copy');
    copyDom.parentNode.removeChild(copyDom);
    if (successful) {
      Toast.show({
        icon: 'success',
        content: '复制成功'
      });
    }
  }

  function handleCopyClick(text) {
    return () => copyContentH5(text);
  }
  return (
    <List.Item
      prefix={<Tag color='primary'>{inviteCode.type === Constans.InviteCodeType.LIMIT_TIMES ? '限制次数' : '限制时间'}</Tag>}
      description={<><span>{ inviteCode.type === Constans.InviteCodeType.LIMIT_TIMES ? `使用情况：${inviteCode.currentTimes}/${inviteCode.limitTimes}`: `截止时期: ${new Date(inviteCode.expiredAt).toLocaleDateString()}`}</span></>}
    >
      <span>{ inviteCode.code }</span>
      <Button size='small' style={{float: 'right'}} onClick={handleCopyClick(inviteCode.code)}>复制</Button>
    </List.Item>
  );  
}

const GenInviteCodeForm = forwardRef((props, ref) => {
  const { firstLoad } = props;
  const [form, setForm] = useState({type: [Constans.InviteCodeType.LIMIT_TIMES], limitTimes: 1});
  
  const selectOptions = [
    { label: '限制次数', value: Constans.InviteCodeType.LIMIT_TIMES },
    { label: '限制时间', value: Constans.InviteCodeType.EXPIRED },
  ];

  useImperativeHandle(ref, () => ({
    submit: handSubmit,
  }));

  async function handSubmit() {
    try {
      if (form.type[0] === Constans.InviteCodeType.EXPIRED && !form.expiredAt) {
        throw new Error('限制时间必选');
      }
      await apis.postInviteCodes(Object.assign({}, form, { type: form.type[0], expiredAt: form.expiredAt?.getTime(), limitTimes: (form.type[0] === Constans.InviteCodeType.LIMIT_TIMES && !form.limitTimes) ? 1 : form.limitTimes } ));
      Toast.show({
        icon: 'success',
        content: '生成成功',
      });
      firstLoad();
    } catch (err) {
      Toast.show({
        icon: 'fail',
        content: err.message
      })
      throw(err);
    }
  }

  return (
    <Form 
        mode="default"
        layout='vertical'
        onValuesChange={(field, allFields) => setForm(allFields)}
        onFinish={handSubmit}
        initialValues={{ type: [Constans.InviteCodeType.LIMIT_TIMES], limitTimes: 1 }}
      >
      <Form.Item name='type' label="类型" rules={[
        { required: true, message: '审核状态必选' },
      ]}>
        <Selector options={selectOptions}/>
      </Form.Item>
      <Form.Subscribe to={['type']} >
        {({ type }) => {
          return (<>
            {
              type[0] === Constans.InviteCodeType.LIMIT_TIMES
              &&
              <Form.Item
                rules={[
                  {
                    min: 1,
                    type: 'number',
                  },
                  { required: true, message: '限制次数必填' },
                ]}
                name='limitTimes'
                label='限制次数'
              >
                <Stepper />
              </Form.Item>
            }
            {
              type[0] === Constans.InviteCodeType.EXPIRED
              &&
              <Form.Item
                name='expiredAt'
                label="截止日期"
                rules={[
                  { required: true, message: '截止日期必填' }
                ]}
                trigger='onConfirm'
                onClick={(e, datePickerRef) => {
                  datePickerRef.current?.open()
                }}
              >
                <DatePicker>
                  {value => value?.toLocaleDateString() || '请选择日期'}
                </DatePicker>
              </Form.Item>
            }
          </>);
        }}
      </Form.Subscribe>
    </Form>
  );
});

function GenerateInviteCode(props) {
  const { firstLoad } = props;
  const formRef = useRef();
  function handleGenerateInviteCodeClick() {
    Modal.confirm({
      title: '生成邀请码',
      content: <GenInviteCodeForm ref={formRef} firstLoad={firstLoad} />,
      onConfirm: async () => {
        await formRef.current.submit();
        firstLoad();
      }
    });
  }
  return (
    <div style={{padding: '4px 10px'}}>
      <Button block color="primary" onClick={handleGenerateInviteCodeClick}>生成邀请码</Button>
    </div>
  );
}

function GoodList(props) {

  const { type } = props;
  const navigate = useNavigate();

  let queryGoods = async() => {};

  if (type === 'my-publish') {
    queryGoods = apis.getUserGoods;
  } else if (type === 'my-concern') {
    queryGoods = apis.findGoodConcernList;
  } else if (type === 'to-audit') {
    queryGoods = apis.queryGoods;
  } else if (type === 'audit-user-profile') {
    queryGoods = apis.getAuditUserProfileList;
  } else if (type === 'invite-code') {
    queryGoods = apis.getInviteCodes;
  }

  const [goods, setGoods] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState();

  useEffect(() => {
    let query = { page: 1, perPage: 10 };
    if (type === 'to-audit') query = Object.assign(query, { auditStatus: Constans.GoodAuditStatus.WAIT, isOnShelf: 'false', order: 'asc' });
    queryGoods(query)
      .then(goods => {
        setGoods(goods);
        setHasMore(goods.length >= 10);
        setPage(1);
    });
  }, [type]);

  async function refreshUserPublishGood(page, perPage = 10) {
    let query = { page, perPage };
    if (type === 'to-audit') query = Object.assign(query, { auditStatus: Constans.GoodAuditStatus.WAIT, isOnShelf: 'false', order: 'asc' });
    const append = await queryGoods(query);
    setHasMore(append.length >= 10);
    setGoods(goods.concat(append));
  }

  async function firstLoad() {
    let query = { page: 1, perPage: 10 };
    if (type === 'to-audit') query = Object.assign(query, { auditStatus: Constans.GoodAuditStatus.WAIT, isOnShelf: 'false', order: 'asc' });
    const goods = await queryGoods(query);
    setGoods(goods);
    setHasMore(goods.length >= 10);
    setPage(1);
  }

  return (
    <>
      {type === 'invite-code' ? <GenerateInviteCode firstLoad={firstLoad} /> : undefined }
      {
        goods.length > 0 ?
          <PullToRefresh onRefresh={async () => {
            await firstLoad()
          }}>
            <List>
              {
                goods.map(good => (
                  type === 'audit-user-profile' ? <UserProfileItem user={good} key={good.id} firstLoad={firstLoad}/> :
                  (
                    type === 'invite-code' ? <InviteCodeItem inviteCode={good} key={good.id} firstLoad={firstLoad}/> :
                    <List.Item
                      onClick={() => navigate(`/goods/${good.id}`, { state: { type } })}
                      key={good.id}
                      prefix={<Image src={good.preview} fit={'contain'} height={62} width={120} />}
                      description={<ItemDescription good={good} type={type} />}
                      >
                      {good.title.length <= 23 ? good.title : ''.padEnd(23, good.title.substring(0, 4)) + '...'}
                    </List.Item>
                  ) 
                ))
              }
            </List>
            {
              goods.length < 10 ? undefined :
                <InfiniteScroll hasMore={hasMore} loadMore={async () => {
                  await refreshUserPublishGood(page + 1);
                  setPage(page + 1);
                }}/>
            }
          </PullToRefresh>
        :
        <Empty
          style={{ padding: '64px 0' }}
          imageStyle={{ width: 160 }}
          description='暂无数据'
        />
      }
    </>
  );
}

export default function Shopbag() {

  const [showAuditTab, setShowAuditTab] = useState(haveRoles('admin'));
  const location = useLocation();
  const [activeKey, setActiveKey] = useState(location.state?.activeKey || (haveRoles('admin') ? 'to-audit' : 'my-publish'));

  useEffect(() => {
    if (!showAuditTab) {
      store.subscribe(() => {
        if (haveRoles('admin')) {
          setShowAuditTab(true);
          if (!location.state?.activeKey) setActiveKey('to-audit');
        }
      });
    }
  });

  return (
    <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)} className="tab-content">
      <Tabs.Tab title='我的发布' key='my-publish'>
        <GoodList type='my-publish' />
      </Tabs.Tab>
      <Tabs.Tab title='我的关注' key='my-concern'>
        <GoodList type='my-concern' />
      </Tabs.Tab>
      {
        showAuditTab ? 
          <>
            <Tabs.Tab title='商品审核' key='to-audit'>
              <GoodList type='to-audit' />
            </Tabs.Tab>
            <Tabs.Tab title='用户资料审核' key='audit-user-profile'>
              <GoodList type='audit-user-profile' />
            </Tabs.Tab>
            <Tabs.Tab title='邀请码' key='invite-code'>
              <GoodList type='invite-code' />
            </Tabs.Tab>
          </>
          :
          undefined
      }
      
    </Tabs>
  );
}