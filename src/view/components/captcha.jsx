import { Image } from "antd-mobile";
import { forwardRef, useEffect, useState, useImperativeHandle } from "react";
import { apis } from "../../api";

export default forwardRef((props, ref) => {
  const { setCaptchaKey } = props;

  const [svg, setSvg] = useState('');

  function handleOnClick() {
    apis.getCaptcha().then(({ captcha, key }) => {
      setSvg(`data:image/svg+xml;utf8,${encodeURIComponent(captcha)}`);
      setCaptchaKey(key);
    });
  }

  useImperativeHandle(ref, () => ({
    click: handleOnClick,
  }));

  useEffect(handleOnClick, [setCaptchaKey]);

  return (
    <Image src={svg} onClick={handleOnClick} width={props.width} />
  );
});