import Logo from '../../logo.svg';
import { Image } from 'antd-mobile';
import './icon.css';

export default function Icon(props) {
  const { rate = '10s' } = props;
  return (
    <div className="login-icon" style={{
      animation: `App-logo-spin infinite ${rate} linear`,
    }}>
      <Image src={Logo} width="80px" />
    </div>
  );
}