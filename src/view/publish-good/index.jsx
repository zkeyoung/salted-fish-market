import {
  Form,
  Button,
  Input,
  Picker,
  Space,
  TextArea,
  ImageUploader,
  Toast,
  Dialog,
} from "antd-mobile";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apis } from "../../api";
import Header from "../../layouts/header";
import Constans from "../../lib/constans";
import Icon from "../components/icon";

function beforeUpload(file) {
  if (file.size > 1024 * 1024 * 5) {
    Toast.show('请选择小于 5M 的图片')
    return null
  }
  return file
}

async function uploadFile(file) {
  return await apis.uploadFile(file);
}

function PublishForm(props) {
  const { editMode, goodDetail } = props;
  const [form, setForm] = useState({});
  const [submitBtnLoading, setSubmitBtnLoading] = useState(false);
  const [fileUrls, setFileUrls] = useState([]);
  const navigate = useNavigate();
  let initialValues = null;

  if (editMode) {
    initialValues = {
      title: goodDetail.title,
      category: [goodDetail.category],
      price: goodDetail.price / 100,
      region: [goodDetail.region],
      fileUrls: goodDetail.fileUrls.map((fileUrl, i) => ({ ossKey: fileUrl, url: goodDetail.fileUrlsSigned[i]})),
      desc: goodDetail.desc,
    };
  }

  async function handleSubmit() {
    setSubmitBtnLoading(true);
    try {
      if (!form.fileUrls[0].file) {
        const blob = await apis.getImageBlob(form.fileUrls[0].ossKey);
        form.fileUrls[0].file = blob;
      }
      const { ossKey: preview } = await apis.uploadFile(form.fileUrls[0].file, {initialQuality: 0.6, maxWidthOrHeight: 200});
      const reqData = Object.assign({}, form, Object.assign({
        category: form.category[0],
        region: form.region[0],
        fileUrls: form.fileUrls.map(o => o.ossKey),
        price: Math.round(Number(form.price) * 100),
        preview: preview,
      }));
      if (editMode) {
        await apis.patchUsersGood(goodDetail.id, reqData);
      } else {
        await apis.publishGood(reqData);
      }
      Toast.show({
        icon: 'success',
        content: `${editMode? '修改' : '发布'}商品成功`,
      });
      navigate('/shop-bag');
    } catch (err) {
      Toast.show({
        icon: 'fail',
        content: `${editMode? '修改' : '发布'}商品失败`,
      });
    } finally {
      setSubmitBtnLoading(false);
    }
  }

  return (
    <Form
      mode="card"
      layout='horizontal'
      onValuesChange={(field, allFields) => setForm(allFields)}
      onFinish={handleSubmit}
      initialValues={initialValues}
      footer={
        <Button disabled={!form.title} block type='submit' color='primary' size='large' style={{marginTop: '-20px'}} loading={submitBtnLoading} loadingText={`正在${editMode? '修改': '发布'}`}>
          {editMode? '修改': '发布'}商品
        </Button>
      }
    >
      <Form.Item
        name='title'
        label='商品标题'
        help='长度最多30位'
        rules={[
          { required: true, message: '商品标题不能为空' },
          { max: 30, message: '商品标题长度最多30位' },
        ]}
      >
        <Input placeholder='请输入商品标题' clearable="true" />
      </Form.Item>
      <Form.Item
        name='category'
        label='商品类别'
        trigger='onConfirm'
        rules={[
          { required: true, message: '商品类别必选' },
        ]}
        onClick={(e, pickerRef) => {
          pickerRef.current?.open()
        }}
      >
        <Picker
          columns={[Constans.CategoryList]}
          value={form.category}
          onConfirm={value => Object.assign(form, { category: value[0] })}
        >
          {(items) => {
            return (
              <Space align='center'>
                {items.every(item => item === null)
                  ? '请选择商品类别'
                  : items.map(item => item?.label ?? '未选择').join(' - ')}
              </Space>
            )
          }}
        </Picker>
      </Form.Item>
      <Form.Item
        name='price'
        label='商品价格'
        help={<div>最大10W元<br/>最多保留两位小数</div>}
        rules={[
          { required: true, message: '商品价格不能为空' },
          { min: 0, max: 100000, message: '商品价格最大10W', type: "number", transform: value => +value},
          { pattern: /^\d+(.\d{1,2})?$/, message: '最多保留2位小数(分)' }
        ]}
        extra={<span>元</span>}
      >
        <Input placeholder='请输入商品价格' clearable="true" />
      </Form.Item>
      <Form.Item
        name='region'
        label='所在校区'
        trigger='onConfirm'
        rules={[
          { required: true, message: '所在校区必选' },
        ]}
        onClick={(e, pickerRef) => {
          pickerRef.current?.open()
        }}
      >
        <Picker
          columns={[Constans.RegionList]}
          value={form.region}
          onConfirm={value => Object.assign(form, { region: value[0] })}
        >
          {(items) => {
            return (
              <Space align='center'>
                {items.every(item => item === null)
                  ? '请选择所在校区'
                  : items.map(item => item?.label ?? '未选择').join(' - ')}
              </Space>
            )
          }}
        </Picker>
      </Form.Item>
      <Form.Item
        name='fileUrls'
        label='商品图片'
        help={<div>最多5张图<br/>第一张也为预览图</div>}
        layout="vertical"
        rules={[
          { required: true, message: '请先上传图片' },
        ]}
      >
        <ImageUploader
          value={fileUrls}
          onChange={setFileUrls}
          upload={uploadFile}
          beforeUpload={beforeUpload}
          maxCount={5}
          onCountExceed={exceed => {
            Toast.show(`最多选择 ${5} 张图片，你多选了 ${exceed} 张`)
          }}
          imageFit={'contain'}
          onDelete={() => {
            return Dialog.confirm({
              content: '是否确认删除',
            })
          }}
        />
      </Form.Item>
      <Form.Item
        name='desc'
        label='商品描述'
        rules={[
          { required: true, message: '商品描述不能为空' },
        ]}
      >
        <TextArea
          showCount
          maxLength={300}
          placeholder='请输入商品描述'
        />
      </Form.Item>
    </Form>
  );
}

export default function PublishGood() {
  const location = useLocation();
  const goodDetail = location.state?.goodDetail;
  const editMode = !!goodDetail;
  return (
    <div>
      <Header title={`${editMode?'修改':'发布'}商品`} showBackArrow={editMode} />
      <Icon />
      <PublishForm editMode={editMode} goodDetail={goodDetail} />
    </div>
  );
}