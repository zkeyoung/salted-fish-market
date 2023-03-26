import { Empty } from "antd-mobile";

export default function ShowEmpty(props) {
  const { desc = '暂无数据' } = props;

  return (
    <Empty
          style={{ padding: '64px 0', flex: 1, display: 'flex', justifyContent: 'center' }}
          imageStyle={{ width: 160 }}
          description={desc}
        />
  );
}