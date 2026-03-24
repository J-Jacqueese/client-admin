import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
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

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const tagsParsed = safeJsonParse(values.tags_json, []);
      if (tagsParsed && typeof tagsParsed === 'object' && tagsParsed.__json_parse_error) {
        message.error('tags_json JSON解析失败，请确保是数组格式');
        return;
      }

      await projectAPI.submit({
        github_url: values.github_url,
        category: values.category,
        reason: values.reason,
        website_url: values.website_url || null,
        language: values.language || null,
        tags: tagsParsed,
      });
      message.success('提交成功，进入人工审核');
      navigate('/projects');
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
        <h1 className="text-2xl font-bold">新增项目</h1>
        <Button onClick={() => navigate('/projects')}>返回</Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          tags_json: JSON.stringify([], null, 2),
          language: 'Unknown',
        }}
      >
        <Form.Item
          label="GitHub URL"
          name="github_url"
          rules={[{ required: true, message: '请输入 GitHub URL' }]}
        >
          <Input placeholder="https://github.com/owner/repo" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="类别 (category)" name="category" rules={[{ required: true, message: '请输入类别' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="语言 (language)" name="language">
            <Input placeholder="如：Python / JavaScript / Rust..." />
          </Form.Item>
        </div>

        <Form.Item label="推荐理由 (reason)" name="reason" rules={[{ required: true, message: '请输入推荐理由' }]}>
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item label="官网 (website_url)" name="website_url">
          <Input placeholder="可留空" />
        </Form.Item>

        <Form.Item label="tags（JSON数组，可选）" name="tags_json">
          <TextArea rows={5} style={{ fontFamily: 'monospace' }} />
        </Form.Item>

        <div className="text-right">
          <Button onClick={() => navigate('/projects')} className="mr-3" disabled={submitting}>
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

