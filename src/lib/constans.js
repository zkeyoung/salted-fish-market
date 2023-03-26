const RegionList = [
  {
    label: '新校区',
    value: 'new',
  },
  {
    label: '北校区',
    value: 'north',
  },
  {
    label: '南校区',
    value: 'south',
  },
  {
    label: '东校区',
    value: 'east',
  },
];

export const CategoryList = [
  {
    label: '食品',
    value: 'food',
  },
  {
    label: '化妆品',
    value: 'cosmetics',
  },
  {
    label: '服装、鞋帽',
    value: 'clothing',
  },
  {
    label: '计算机产品',
    value: 'computer',
  },
  {
    label: '通讯产品',
    value: 'communication',
  },
  {
    label: '智能设备',
    value: 'smartDevices',
  },
  {
    label: '家用电器',
    value: 'householdAppliances',
  },
  {
    label: '出版物',
    value: 'publications',
  },
  {
    label: '交通工具',
    value: 'traffic',
  },
  {
    label: '其他',
    value: 'other',
  }
];

const TabBarTitle = {
  Homepage: '首页',
  Shopbag: '我的商品',
  Publish: '发布',
  Message: '消息',
  PersonCenter: '个人中心',
}

const GoodAuditStatus = {
  WAIT: 'wait',
  PASS: 'pass',
  REFUSE: 'refuse',
}

const GoodsAuditStatusMap = {
  [GoodAuditStatus.WAIT]: { label: '待审核', value: GoodAuditStatus.WAIT },
  [GoodAuditStatus.PASS]: { label: '审核通过', value: GoodAuditStatus.PASS },
  [GoodAuditStatus.REFUSE]: { label: '审核被拒', value: GoodAuditStatus.REFUSE },
};

const UserProfileAuditStatus = {
  WAIT: 'wait',
  PASS: 'pass',
  REFUSE: 'refuse',
}

const UserProfileAuditStatusMap = {
  [UserProfileAuditStatus.WAIT]: { label: '待审核', value: UserProfileAuditStatus.WAIT },
  [UserProfileAuditStatus.PASS]: { label: '审核通过', value: UserProfileAuditStatus.PASS },
  [UserProfileAuditStatus.REFUSE]: { label: '审核被拒', value: UserProfileAuditStatus.REFUSE },
};

const InviteCodeType = {
  EXPIRED: 'expired',
  LIMIT_TIMES: 'limit_times',
};

const SALTED_FISH_DEVICE = 'SALTED_FISH_DEVICE';

const Hostname = (() => {
  const hostMap = {};
  hostMap.socket = 'ws://192.168.31.34:4000';
  hostMap.api = 'http://192.168.31.34:3000/client/v1';
  hostMap.cos = 'http://192.168.31.34:3000/client/v1/files'
  return hostMap;
})();

const Constans = {
  RegionList,
  CategoryList,
  TabBarTitle,
  GoodAuditStatus,
  GoodsAuditStatusMap,
  Hostname,
  UserProfileAuditStatus,
  UserProfileAuditStatusMap,
  InviteCodeType,
  SALTED_FISH_DEVICE,
};

export default Constans;