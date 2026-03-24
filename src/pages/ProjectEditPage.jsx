import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Select, Switch, Button, message, Spin } from 'antd';
import { projectAPI } from '../services/api';

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

function toJsonText(value) {
  if (value === null || value === undefined) return '[]';
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return '[]';
    try {
      return JSON.stringify(JSON.parse(s), null, 2);
    } catch {
      return s;
    }
  }
  return JSON.stringify(value, null, 2);
}

export default function ProjectEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await projectAPI.getById(id, { include_all: 1 });
        const p = resp.data.data;
        setProject(p);

        form.setFieldsValue({
          name: p.name || '',
          full_name: p.full_name || '',
          category: p.category || '',
          language: p.language || '',
          description: p.description || '',
          long_description: p.long_description || '',
          stars: p.stars ?? 0,
          forks: p.forks ?? 0,
          issues: p.issues ?? 0,
          contributors: p.contributors ?? 0,
          license: p.license || '',
          last_update: p.last_update || '',
          created_at: p.created_at || '',
          topics_json: toJsonText(p.topics || []),
          github_url: p.github_url || '',
          website_url: p.website_url || '',
          logo_url: p.logo_url || '',
          is_weekly_pick: !!p.is_weekly_pick,
          is_editor_choice: !!p.is_editor_choice,
          editor_comment: p.editor_comment || '',
          trend_stars_7d: p.trend_stars_7d ?? 0,
          likes: p.likes ?? 0,
          approval_status: p.approval_status || 'pending',
          submitted_reason: p.submitted_reason || '',
          submitted_tags_json: toJsonText(p.submitted_tags || []),
          submitted_website_url: p.submitted_website_url || '',
        });
      } catch (err) {
        console.error(err);
        message.error('加载项目详情失败');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values) => {
    const topicsParsed = safeJsonParse(values.topics_json, []);
    const submittedTagsParsed = safeJsonParse(values.submitted_tags_json, []);

    const all = [topicsParsed, submittedTagsParsed];
    if (all.some((x) => x && typeof x === 'object' && x.__json_parse_error)) {
      message.error('JSON字段解析失败，请检查 topics/submitted_tags 的格式');
      return;
    }

    try {
      await projectAPI.update(id, {
        name: values.name,
        full_name: values.full_name,
        category: values.category,
        description: values.description || null,
        long_description: values.long_description || null,
        language: values.language,
        stars: Number(values.stars ?? 0),
        forks: Number(values.forks ?? 0),
        issues: Number(values.issues ?? 0),
        contributors: Number(values.contributors ?? 0),
        license: values.license || null,
        last_update: values.last_update || null,
        topics: topicsParsed,
        github_url: values.github_url,
        website_url: values.website_url || null,
        logo_url: values.logo_url || null,
        is_weekly_pick: values.is_weekly_pick,
        is_editor_choice: values.is_editor_choice,
        editor_comment: values.editor_comment || null,
        trend_stars_7d: Number(values.trend_stars_7d ?? 0),
        likes: Number(values.likes ?? 0),
        approval_status: values.approval_status || 'pending',
        submitted_reason: values.submitted_reason || null,
        submitted_tags: submittedTagsParsed,
        submitted_website_url: values.submitted_website_url || null,
        created_at: values.created_at || null,
      });
      message.success('更新成功');
      navigate('/projects');
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

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-red-500">项目不存在或无法访问</div>
        <Button className="mt-4" onClick={() => navigate('/projects')}>
          返回项目管理
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">编辑项目</h1>
        <Button onClick={() => navigate('/projects')}>返回</Button>
      </div>

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="项目名称 (name)" name="name" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="全名 (full_name)" name="full_name" rules={[{ required: true, message: '请输入全名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="类别 (category)" name="category" rules={[{ required: true, message: '请输入类别' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="语言 (language)" name="language" rules={[{ required: true, message: '请输入语言' }]}>
            <Input />
          </Form.Item>
        </div>

        <Form.Item label="description" name="description">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item label="long_description" name="long_description">
          <TextArea rows={6} />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item label="Stars" name="stars">
            <Input />
          </Form.Item>
          <Form.Item label="Forks" name="forks">
            <Input />
          </Form.Item>
          <Form.Item label="Issues" name="issues">
            <Input />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="贡献者数 (contributors)" name="contributors">
            <Input />
          </Form.Item>
          <Form.Item label="趋势 Stars 7d (trend_stars_7d)" name="trend_stars_7d">
            <Input />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="许可证 (license)" name="license">
            <Input />
          </Form.Item>
          <Form.Item label="最后更新 (last_update, YYYY-MM-DD)" name="last_update">
            <Input />
          </Form.Item>
        </div>

        <Form.Item label="创建日期 (created_at, YYYY-MM-DD)" name="created_at">
          <Input />
        </Form.Item>

        <Form.Item label="GitHub URL (github_url)" name="github_url" rules={[{ required: true, message: '请输入 GitHub URL' }]}>
          <Input />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="官网 (website_url)" name="website_url">
            <Input />
          </Form.Item>
          <Form.Item label="Logo (logo_url)" name="logo_url">
            <Input />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <Form.Item label="每周精选 (is_weekly_pick)" name="is_weekly_pick" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="编辑精选 (is_editor_choice)" name="is_editor_choice" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <Form.Item label="编辑点评 (editor_comment)" name="editor_comment">
          <TextArea rows={3} />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="点赞 (likes)" name="likes">
            <Input />
          </Form.Item>
          <Form.Item label="审批状态 (approval_status)" name="approval_status">
            <Select
              options={[
                { value: 'approved', label: 'approved' },
                { value: 'pending', label: 'pending' },
                { value: 'rejected', label: 'rejected' },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item label="topics（JSON数组）" name="topics_json">
          <TextArea rows={6} style={{ fontFamily: 'monospace' }} />
        </Form.Item>

        <Form.Item label="submitted_reason" name="submitted_reason">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item label="submitted_tags（JSON）" name="submitted_tags_json">
          <TextArea rows={4} style={{ fontFamily: 'monospace' }} />
        </Form.Item>

        <Form.Item label="submitted_website_url" name="submitted_website_url">
          <Input />
        </Form.Item>

        <div className="text-right">
          <Button onClick={() => navigate('/projects')} className="mr-3">
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

