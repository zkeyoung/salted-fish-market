import { DotLoading, WaterMark } from "antd-mobile";
import Icon from "./icon";

export default function Loading(props) {
  const { marginTop='50%', showWaterMark=true } = props;
  return (
    <div style={{
      display:'flex',
      flexDirection: 'column',
      justifyContent: "center",
      textAlign: 'center',
      marginTop: marginTop,
    }}>
      <Icon rate='1s' />
      <div style={{ marginTop: '10px' }}>
        <span style={{fontSize: 18}} >努力加载</span><DotLoading color='primary'/>
      </div>
      {showWaterMark ? <WaterMark content="咸鱼市场" /> : undefined}
    </div>
  );
}