import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Upload, InputNumber, Space } from 'antd';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { eventAPI } from '../services/api';
import { resolveAdminMediaUrl } from '../utils/mediaUrl';

const { TextArea } = Input;

function safeJsonParse(jsonText, fallback) {
  const s = String(jsonText ?? '').trim();
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch (e) {
    return { __json_parse_error: String(e?.message || e) };
  }
}

function FullDescEditor({ value, onChange }) {
  return (
    <div data-color-mode="light" className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <MDEditor value={value || ''} onChange={onChange} height={420} visibleDragbar={false} />
    </div>
  );
}

export default function EventCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const speakersParsed = safeJsonParse(values.speakers_json, []);
      const tagsParsed = safeJsonParse(values.tags_json, []);
      const highlightsParsed = safeJsonParse(values.highlights_json, []);
      const agendaParsed = safeJsonParse(values.agenda_json, []);
      const sponsorsParsed = safeJsonParse(values.sponsors_json, []);
      const all = [speakersParsed, tagsParsed, highlightsParsed, agendaParsed, sponsorsParsed];
      if (all.some((x) => x && typeof x === 'object' && x.__json_parse_error)) {
        message.error('JSON字段解析失败，请检查 speakers/tags/highlights/agenda/sponsors 的格式');
        return;
      }

      await eventAPI.submit({
        title: values.title,
        type: values.type,
        mode: values.mode,
        city: values.city,
        desc: values.desc || null,
        full_desc: values.full_desc || null,
        cover_image: values.cover_image || null,
        start_date: values.start_date,
        end_date: values.end_date,
        location: values.location || null,
        online_url: values.online_url || null,
        organizer: values.organizer,
        organizer_logo: values.organizer_logo || null,
        price: values.price || null,
        max_participants: values.max_participants || null,
        registration_url: values.registration_url || null,
        sort_weight: values.sort_weight ?? 0,
        speakers: speakersParsed,
        tags: tagsParsed,
        highlights: highlightsParsed,
        agenda: agendaParsed,
        sponsors: sponsorsParsed,
      });
      message.success('提交成功，进入人工审核');
      navigate('/events');
    } catch (err) {
      console.error(err);
      message.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">新增活动</h1>
        <Button onClick={() => navigate('/events')}>返回</Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          speakers_json: JSON.stringify([], null, 2),
          tags_json: JSON.stringify([], null, 2),
          highlights_json: JSON.stringify([], null, 2),
          agenda_json: JSON.stringify([], null, 2),
          sponsors_json: JSON.stringify([], null, 2),
          max_participants: '',
          price: '',
          sort_weight: 0,
        }}
      >
        <Form.Item label="活动名称" name="title" rules={[{ required: true, message: '请输入活动名称' }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="排序权重"
          name="sort_weight"
          extra="数字越大，前台「AI 活动」列表越靠前展示；相同权重时仍按开始时间等规则排序。"
        >
          <InputNumber min={0} max={999999} placeholder="0" className="w-full max-w-xs" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="类型 (event_type)" name="type" rules={[{ required: true, message: '请输入类型' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="形式 (event_mode)" name="mode" rules={[{ required: true, message: '请输入形式' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="城市 (city)" name="city" rules={[{ required: true, message: '请输入城市' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="主办方 (organizer)" name="organizer" rules={[{ required: true, message: '请输入主办方' }]}>
            <Input />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="开始日期 (YYYY-MM-DD)" name="start_date" rules={[{ required: true, message: '请输入开始日期' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="结束日期 (YYYY-MM-DD)" name="end_date" rules={[{ required: true, message: '请输入结束日期' }]}>
            <Input />
          </Form.Item>
        </div>

        <Form.Item label="简介 (desc)" name="desc">
          <TextArea rows={3} placeholder="列表卡片展示用，建议两行以内" />
        </Form.Item>

        <Form.Item label="活动完整详情（Markdown）" name="full_desc">
          <FullDescEditor />
        </Form.Item>
        <div className="mb-6">
          <Upload
            accept="image/jpeg,image/png,image/gif,image/webp"
            showUploadList={false}
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                const resp = await eventAPI.uploadEventImage(file);
                const path = resp.data?.url;
                if (!path) throw new Error('no url');
                const cur = form.getFieldValue('full_desc') || '';
                form.setFieldsValue({ full_desc: `${cur}\n\n![](${path})\n\n` });
                onSuccess(resp.data);
                message.success('已上传并插入图片（Markdown）');
              } catch (e) {
                onError(e);
                message.error('图片上传失败');
              }
            }}
          >
            <Button type="dashed">上传图片并插入到详情</Button>
          </Upload>
        </div>

        <Form.Item label="地点 (location)" name="location">
          <Input />
        </Form.Item>
        <Form.Item label="线上链接 (online_url)" name="online_url">
          <Input />
        </Form.Item>

        <Form.Item label="封面图">
          <Space direction="vertical" size="middle" className="w-full">
            <Form.Item name="cover_image" noStyle>
              <Input placeholder="图片地址，或点击下方上传" />
            </Form.Item>
            <Upload
              accept="image/jpeg,image/png,image/gif,image/webp"
              showUploadList={false}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const resp = await eventAPI.uploadEventImage(file);
                  const url = resp.data?.url;
                  form.setFieldsValue({ cover_image: url });
                  onSuccess(resp.data);
                  message.success('封面上传成功');
                } catch (e) {
                  onError(e);
                  message.error('封面上传失败');
                }
              }}
            >
              <Button>上传封面图</Button>
            </Upload>
            <Form.Item noStyle shouldUpdate>
              {() => {
                const u = form.getFieldValue('cover_image');
                return u ? (
                  <img src={resolveAdminMediaUrl(u)} alt="封面预览" className="max-h-44 rounded-lg border border-slate-200" />
                ) : null;
              }}
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item label="主办方 Logo (organizer_logo)" name="organizer_logo">
          <Input />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="费用 (price)" name="price">
            <Input />
          </Form.Item>
          <Form.Item label="最大名额 (max_participants)" name="max_participants">
            <Input />
          </Form.Item>
        </div>

        <Form.Item label="报名入口 (registration_url)" name="registration_url">
          <Input />
        </Form.Item>

        <Form.Item label="speakers（JSON数组）" name="speakers_json">
          <TextArea rows={6} style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item label="tags（JSON数组）" name="tags_json">
          <TextArea rows={4} style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item label="highlights（JSON数组）" name="highlights_json">
          <TextArea rows={5} style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item label="agenda（JSON数组）" name="agenda_json">
          <TextArea rows={6} style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item label="sponsors（JSON数组）" name="sponsors_json">
          <TextArea rows={5} style={{ fontFamily: 'monospace' }} />
        </Form.Item>

        <div className="text-right">
          <Button onClick={() => navigate('/events')} className="mr-3" disabled={submitting}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
            {submitting ? '提交中' : '提交'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
