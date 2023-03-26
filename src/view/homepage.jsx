import {
  Button,
  Popup,
  Divider,
  Tag,
  Card,
  Image,
  Grid,
  InfiniteScroll,
  PullToRefresh,
  Modal,
} from "antd-mobile";

import { useEffect, useState } from "react";
import Constans from '../lib/constans';
import Search from "./components/seach";
import './homepage.css';
import Logo from '../logo.svg';
import { apis } from "../api";
import ShowEmpty from "./components/empty";
import { useNavigate } from "react-router-dom";
import Loading from "./components/loading";
import { haveRoles } from "../lib/utils";
import { ExclamationCircleOutline } from 'antd-mobile-icons';

function FilterContainer(props) {
  const { filter = {}, setFilter = () => {} } = props;

  const [regionVisiable, setRegionVisiable] = useState(false);
  const [region, setRegion] = useState();
  const regionsButton = Constans.RegionList.map((region, i) =>
    <Button
      key={i}
      size="small"
      style={{marginRight: '10px', marginBottom: '10px'}}
      onClick={() => {
        setRegion(region);
        setFilter(Object.assign(filter, { region: region.value }));
        setRegionVisiable(false);
      }}
    >
      {region.label}
    </Button>);
  const [categoryVisiable, setCategoryVisiable] = useState(false);
  const [category, setCategory] = useState();
  const categorysButton = Constans.CategoryList.map((category, i) =>
    <Button
      key={i}
      size="small"
      style={{marginRight: '10px', marginBottom: '10px'}}
      onClick={() => {
        setCategory(category);
        setFilter(Object.assign(filter, { category: category.value }));
        setCategoryVisiable(false);
      }}
    >
      {category.label}
    </Button>);
  return (
    <div className="filterContainer">
      <div>
        <Button
          size='small'
          onClick={() => {
            if (region) {
              setRegion(undefined);
              setFilter(Object.assign(filter, { region: undefined }))
            } else {
              setRegionVisiable(true);
            }
          }}
        >
          {region ? '取消选择' : '选择校区'}
        </Button>
        {region ?
          <>
            <span style={{marginLeft: '10px', color: "#bfbfbf"}}>—</span>
            <Tag style={{marginLeft: '10px'}} color='primary' fill='outline'>{region.label}</Tag>
          </>
          : undefined}
        <Popup
          visible={regionVisiable}
          onMaskClick={() => {
            setRegionVisiable(false)
          }}
          position='right'
          bodyStyle={{ width: '50vw', padding: '10px 10px'}}
          style={{}}
        >
          <Divider>选择校区</Divider>
          {regionsButton}
        </Popup>
      </div>
      <div style={{marginTop: '20px', width:"100%"}}>
        <Button
          size='small'
          onClick={() =>{
            if (category) {
              setCategory(undefined);
              setFilter(Object.assign(filter, { category: undefined }));
            } else {
              setCategoryVisiable(true)
            }
          }}
        >
          {category ? '取消选择' : '选择类别'}
        </Button>
        {category ?
          <>
            <span style={{marginLeft: '10px', color: "#bfbfbf"}}>—</span>
            <Tag style={{marginLeft: '10px'}} color='primary' fill='outline'>{category.label}</Tag>
          </>
          : undefined}
        <Popup
          visible={categoryVisiable}
          onMaskClick={() => {
            setCategoryVisiable(false)
          }}
          position='right'
          bodyStyle={{ width: '50vw', padding: '10px 10px'}}
          style={{}}
        >
          <Divider>选择商品类别</Divider>
          {categorysButton}
        </Popup>
      </div>
    </div>
  );
}

function GoodCard(props) {
  const navigate = useNavigate();
  const { good } = props;
  return (
    <Card style={{ width: '42%'}} onClick={() => {
        if (haveRoles('member')) {
          navigate(`/goods/${good.id}`)
        } else {
          Modal.confirm({
            title: <ExclamationCircleOutline color='var(--adm-color-warning)' fontSize={36} />,
            content: '未登录或登录已失效',
            onConfirm: () => {
              navigate('/login');
            },
            confirmText: '登录',
          });
        }
      }}>
      <Image src={good.preview} fit={'contain'}  />
      <Grid columns={2} style={{marginTop: "6px"}}>
        <Grid.Item span={2}>
          <Tag color='primary' fill='outline'>{Constans.RegionList.find(region => region.value === good.region)?.label}</Tag>
          <Tag color='primary' fill='outline' style={{marginLeft: '4px'}}>{Constans.CategoryList.find(category => category.value === good.category)?.label}</Tag>
        </Grid.Item>
        <Grid.Item span={2} style={{ marginTop: '2px' }}>
          <span>{good.title.length <= 29 ? good.title : ''.padEnd(20, good.title.substring(0, 4)) + '...'}</span>
        </Grid.Item>
        <Grid.Item span={2} style={{textAlign: 'right'}}>
          <span style={{color: 'red'}}>{good.price / 100}元</span>
        </Grid.Item>
      </Grid>
    </Card>
  );
}

function GoodsContainer(props) {
  const { goods } = props;
  const showGoods = [];
  for (let i = 0; i < goods.length; i+= 2) {
    const leftGood = goods[i];
    const rightGood = goods[i + 1];
    showGoods.push(
      <div key={leftGood.id} style={{display: 'flex', justifyContent: "space-around", marginBottom: '10px'}}>
        <GoodCard good={leftGood} />
        {
          rightGood ? <GoodCard good={rightGood} /> : undefined
        }
      </div>
    );
  } 
  return (
    <div className="GoodsContainer">
      {showGoods}
    </div>
  );
}

export default function Homepage() {

  const [searchText, setSearchText] = useState();
  const [filter, setFilter] = useState();
  const [goods, setGoods] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apis.queryGoods({ page: 1, perPage: 10 })
      .then(goods => {
        setGoods(goods);
        setHasMore(goods.length >= 10);
      }).finally(() => setLoading(false));
  }, []);

  async function refreshGoods() {
    const goods = await apis.queryGoods(Object.assign({ page: 1, perPage: 10 }, filter, { title: searchText }))
    setGoods(goods);
    setHasMore(goods.length >= 10);
    setPage(1);
  }
  
  return (
    <>
      <Search setSearchText={setSearchText} refreshGoods={refreshGoods} />
      <Grid columns={5}>
        <Grid.Item span={3}>
          <FilterContainer filter={filter} setFilter={setFilter} />
        </Grid.Item>
        <Grid.Item span={2} style={{display: 'flex', justifyContent: 'center', paddingRight: '30%', paddingBottom: '10%'}}>
          <Image src={Logo} style={{width: "100px"}} />
        </Grid.Item>
      </Grid>
      {
        loading ? <Loading marginTop="20%" /> : (
          goods.length ?
            <PullToRefresh onRefresh={async () => {
                await refreshGoods()
            }}>
              <GoodsContainer goods={goods} />
              {
                goods.length <= 6 ?
                  undefined
                  :
                  <InfiniteScroll hasMore={hasMore} loadMore={async () => {
                    const newGoods = await apis.queryGoods(Object.assign({ page: page + 1, perPage: 10}, filter, { title: searchText }));
                    setHasMore(newGoods.length >= 10);
                    setGoods(goods.concat(newGoods));
                    setPage(page + 1);
                  }} />
              }
            </PullToRefresh> : <ShowEmpty />
        )
      }
    </>
  );
}