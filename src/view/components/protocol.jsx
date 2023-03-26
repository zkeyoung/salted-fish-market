import {
  Popup,
  Button,
} from "antd-mobile";
import { useState } from "react";

function UserProtoclContent() {
  return (
    <div>
      <h2 style={{textAlign: 'center'}}>用户注册协议</h2>
      <p>当您成为咸鱼市场(https://xy.zhangky.xyz)网站(以下简称「本网站」)的用户后，您已明确了解并同意下列情况发生时，本网站不负担任何责任。</p>
      <p>一、「本网站」就各项服务不负任何明示或默示之担保责任。对于各项服务之稳定性、安全性、正确性、及连线不中断等，「本网站」亦不负担保之责，您同意自行承担使用可能导致之风险及损害，包括但不限于自「本网站」遭受网络诈骗等情景。</p>
      <p>二、「本网站」有权于下列情形之一发生时，停止、中断本服务之提供，对于您因此所受之损害，「本网站」概不负责：（一）「本网站」进行必要上线维护。（二）云服务器商出现问题。（三）受黑客攻击。</p>
      <p>三、您若有连线完毕后未登出、帐号及密码遭他人盗用、不当使用帐户或其他致使「本网站」无法辩识是否为本人亲自使用之情况时，「本网站」对此所致之损害，概不负责。</p>
      <p>四、「本网站」对于任一用户所填写之个人资料、上传图片等行为，不负任何内容真实性或完整性之保证责任。若进而以此不实资讯侵害他人权益或为欺骗、敲诈之行为者，「本网站」对此衍生之一切争议亦概不负责。</p>
      <p>五、「本网站」对于各用户张贴或私下传送之资讯、文字、图档、音讯、照片或其他资料不负任何责任，若有涉及侵害他人智慧财产权等情事者，「本网站」自行删除该等内容，无须另行通知。</p>
      <p>六、若「本网站」的用户张贴或私自传讯之内容有令您感到厌恶、不悦者，纯属该用户之个人行为，「本网站」对此不负任何责任。</p>
      <p>七、任何由于电脑病毒侵入、因政府管制而造成之暂时性关闭或其他不可抗力因素等造成之资料毁损、泄漏、遗失、被盗用或被窜改等皆与「本网站」无涉。</p>
      <p>八、您可能会透过「本网站」连结到其他网站或网路资源，但不表示本网站与该等业者有任何关系。</p>
    </div>
  );
}

export function UserProtocl() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button 
        style={{ padding: "0px 5px" }}
        color='primary' fill='none'  onClick={() => visible ? '' : setVisible(true)}>
        用户注册协议
      </Button>
      <Popup
        visible={visible}
        onMaskClick={() => {
          setVisible(false)
        }}
      >
        <div
          style={{ height: '40vh', overflowY: 'scroll', padding: '0px 20px' }}
        >
          <UserProtoclContent />
        </div>
      </Popup>
    </>
  );
}