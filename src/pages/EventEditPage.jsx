import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Select, Button, message, Spin, Upload, InputNumber, Space } from 'antd';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { eventAPI } from '../services/api';
import { resolveAdminMediaUrl } from '../utils/mediaUrl';

const { TextArea } = Input;

function safeJsonParse(jsonText, fallback) {
  if (jsonText === undefined || jsonText === null) return fallback;
  const s = String(jsonText).trim();
  if (!s) return fallback;
  try {
    const parsed = JSON.parse(s);
    return parsed;
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

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await eventAPI.getById(id, { include_all: 1 });
        const ev = resp.data.data;
        setEvent(ev);
        form.setFieldsValue({
          title: ev.title || '',
          desc: ev.desc || '',
          full_desc: ev.full_desc || '',
          type: ev.event_type || '',
          mode: ev.event_mode || '',
          status: ev.event_status || 'registering',
          city: ev.city || '',
          cover_image: ev.cover_image || '',
          start_date: ev.start_date || '',
          end_date: ev.end_date || '',
          location: ev.location || '',
          online_url: ev.online_url || '',
          organizer: ev.organizer || '',
          organizer_logo: ev.organizer_logo || '',
          price: ev.price || '',
          max_participants: ev.max_participants ?? '',
          current_participants: ev.current_participants ?? 0,
          registration_url: ev.registration_url || '',
          likes: ev.likes ?? 0,
          sort_weight: ev.sort_weight ?? 0,
          approval_status: ev.approval_status || 'pending',
          speakers_json: JSON.stringify(ev.speakers || [], null, 2),
          tags_json: JSON.stringify(ev.tags || [], null, 2),
          highlights_json: JSON.stringify(ev.highlights || [], null, 2),
          agenda_json: JSON.stringify(ev.agenda || [], null, 2),
          sponsors_json: JSON.stringify(ev.sponsors || [], null, 2),
        });
      } catch (err) {
        console.error(err);
        message.error('加载活动详情失败');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values) => {
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

    try {
      await eventAPI.update(id, {
        title: values.title,
        desc: values.desc || null,
        full_desc: values.full_desc || null,
        type: values.type,
        mode: values.mode,
        status: values.status,
        city: values.city,
        cover_image: values.cover_image || null,
        start_date: values.start_date,
        end_date: values.end_date,
        location: values.location || null,
        online_url: values.online_url || null,
        organizer: values.organizer,
        organizer_logo: values.organizer_logo || null,
        price: values.price || null,
        max_participants: values.max_participants,
        current_participants: values.current_participants,
        speakers: speakersParsed,
        tags: tagsParsed,
        highlights: highlightsParsed,
        agenda: agendaParsed,
        sponsors: sponsorsParsed,
        registration_url: values.registration_url || null,
        likes: values.likes ?? 0,
        sort_weight: values.sort_weight ?? 0,
        approval_status: values.approval_status || 'pending',
      });
      message.success('更新成功');
      navigate('/events');
    } catch (err) {
      console.error(err);
      message.error('更新失败');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="text-red-500">活动不存在或无法访问</div>
        <Button className="mt-4" onClick={() => navigate('/events')}>
          返回活动管理
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">编辑活动</h1>
        <Button onClick={() => navigate('/events')}>返回</Button>
      </div>

      <Form form={form} layout="vertical" onFinish={onSubmit}>
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

        <Form.Item label="简介 (desc)" name="desc">
          <TextArea rows={3} placeholder="列表卡片展示用，建议两行以内" />
        </Form.Item>

        <Form.Item
          label="活动完整详情（Markdown）"
          name="full_desc"
          tooltip="支持标题、列表、链接等；图片请用下方按钮上传后自动插入"
        >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="类型 (event_type)" name="type" rules={[{ required: true, message: '请输入类型' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="形式 (event_mode)" name="mode" rules={[{ required: true, message: '请输入形式' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="状态 (event_status)" name="status" rules={[{ required: true, message: '请输入状态' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="城市 (city)" name="city" rules={[{ required: true, message: '请输入城市' }]}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="地点 (location)" name="location">
            <Input />
          </Form.Item>
          <Form.Item label="线上链接 (online_url)" name="online_url">
            <Input />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="主办方 (organizer)" name="organizer" rules={[{ required: true, message: '请输入主办方' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="主办方 Logo (organizer_logo)" name="organizer_logo">
            <Input />
          </Form.Item>
        </div>

        <Form.Item label="封面图">
          <Space direction="vertical" size="middle" className="w-full">
            <Form.Item name="cover_image" noStyle>
              <Input placeholder="图片地址，或点击下方上传（存为 /model_api/uploads/...）" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="费用 (price)" name="price">
            <Input />
          </Form.Item>
          <Form.Item label="报名入口 (registration_url)" name="registration_url">
            <Input />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item label="最大名额 (max_participants)" name="max_participants">
            <Input />
          </Form.Item>
          <Form.Item label="当前报名人次 (current_participants)" name="current_participants">
            <Input />
          </Form.Item>
          <Form.Item label="点赞数 (likes)" name="likes">
            <Input />
          </Form.Item>
        </div>

        <Form.Item label="审批状态 (approval_status)" name="approval_status">
          <Select
            options={[
              { value: 'approved', label: 'approved' },
              { value: 'pending', label: 'pending' },
              { value: 'rejected', label: 'rejected' },
            ]}
          />
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
          <Button onClick={() => navigate('/events')} className="mr-3">
            取消
          </Button>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </div>
      </Form>
    </div>
  );
}
