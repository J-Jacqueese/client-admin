import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, InputNumber, Switch, message, Popconfirm, Tag } from 'antd';
import { FireOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { hotTopicAPI } from '../services/api';

const CATEGORY_COLORS = [
  { value: 'text-orange-600', label: '橙色 (行业动态)' },
  { value: 'text-rose-600', label: '玫红色 (OpenClaw)' },
  { value: 'text-sky-600', label: '天蓝色 (微调)' },
  { value: 'text-amber-600', label: '琥珀色 (应用案例)' },
  { value: 'text-emerald-600', label: '翠绿色 (新手入门)' },
  { value: 'text-purple-600', label: '紫色 (论文)' },
  { value: 'text-teal-600', label: '青色 (资源)' },
  { value: 'text-blue-600', label: '蓝色' },
  { value: 'text-slate-600', label: '灰色 (默认)' },
];

export default function HotTopicsPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [form] = Form.useForm();

  const loadTopics = async () => {
    setLoading(true);
    try {
      const resp = await hotTopicAPI.getAll({ search });
      setTopics(resp.data.data || []);
    } catch (err) {
      console.error(err);
      message.error('加载热门话题失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, [search]);

  const handleCreate = () => {
    setEditingTopic(null);
    form.resetFields();
    form.setFieldsValue({
      replies: 0,
      views: 0,
      timeText: '刚刚',
      categoryColor: 'text-slate-600',
      sortOrder: 0,
      isHot: false,
      isActive: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTopic(record);
    form.setFieldsValue({
      title: record.title,
      href: record.href,
      category: record.category,
      categoryColor: record.categoryColor,
      replies: record.replies,
      views: record.views,
      timeText: record.timeText,
      sortOrder: record.sortOrder,
      isHot: record.isHot,
      isActive: record.isActive,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await hotTopicAPI.delete(id);
      message.success('删除成功');
      loadTopics();
    } catch (err) {
      console.error(err);
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        categoryColor: values.categoryColor || 'text-slate-600',
      };

      if (editingTopic) {
        await hotTopicAPI.update(editingTopic.id, data);
        message.success('更新成功');
      } else {
        await hotTopicAPI.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadTopics();
    } catch (err) {
      console.error(err);
      message.error(editingTopic ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
      render: (v) => <span className="font-mono text-slate-600">{v}</span>,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{text}</span>
          {record.isHot && (
            <Tag color="orange" className="text-[10px]">HOT</Tag>
          )}
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (text, record) => (
        <span className={record.categoryColor}>{text || '-'}</span>
      ),
    },
    {
      title: '回复/浏览',
      key: 'stats',
      width: 100,
      render: (_, record) => (
        <span className="text-slate-500 text-xs">
          {record.replies} / {record.views}
        </span>
      ),
    },
    {
      title: '时间',
      dataIndex: 'timeText',
      key: 'timeText',
      width: 90,
      render: (text) => <span className="text-slate-500 text-xs">{text}</span>,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 70,
      render: (v) => (
        <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此话题？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FireOutlined className="text-orange-500" />
          热门话题管理
        </h1>
        <Space>
          <Input
            placeholder="搜索话题"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增话题
          </Button>
        </Space>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <Table
          dataSource={topics}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: false }}
        />
      </div>

      <Modal
        title={editingTopic ? '编辑话题' : '新增话题'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="话题标题"
            name="title"
            rules={[{ required: true, message: '请输入话题标题' }]}
          >
            <Input placeholder="例如：DeepSeek V4 新模型发布" />
          </Form.Item>

          <Form.Item
            label="话题链接"
            name="href"
            extra="可选，不填则点击时自动跳转到社区搜索页"
          >
            <Input placeholder="https://discuss.deepseek.club/t/topic/xxx" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="分类名称" name="category">
              <Input placeholder="例如：行业动态与观点" />
            </Form.Item>
            <Form.Item label="分类颜色" name="categoryColor">
              <select className="w-full px-3 py-2 border border-gray-200 rounded-md">
                {CATEGORY_COLORS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item label="回复数" name="replies">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item label="浏览数" name="views">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item label="时间显示" name="timeText">
              <Input placeholder="刚刚、5分钟前" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item label="排序权重" name="sortOrder" extra="数字越大越靠前">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item label="热门标签" name="isHot" valuePropName="checked">
              <Switch checkedChildren="HOT" unCheckedChildren="-" />
            </Form.Item>
            <Form.Item label="是否启用" name="isActive" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
