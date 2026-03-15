import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Popconfirm, Drawer, Descriptions, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { tagAPI } from '../services/api';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [viewingTag, setViewingTag] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await tagAPI.getAll();
      setTags(response.data.data);
    } catch (error) {
      message.error('加载标签列表失败');
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    form.setFieldsValue({ color: 'gray' });
    setModalOpen(true);
  };

  const handleView = (tag) => {
    setViewingTag(tag);
    setDetailDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await tagAPI.delete(id);
      message.success('删除成功');
      loadTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      await tagAPI.create(values);
      message.success('创建成功');
      setModalOpen(false);
      loadTags();
    } catch (error) {
      console.error('Failed to save tag:', error);
      message.error('保存失败');
    }
  };

  const colorOptions = [
    { value: 'gray', label: '灰色', color: 'default' },
    { value: 'red', label: '红色', color: 'red' },
    { value: 'yellow', label: '黄色', color: 'gold' },
    { value: 'green', label: '绿色', color: 'green' },
    { value: 'blue', label: '蓝色', color: 'blue' },
    { value: 'indigo', label: '靛蓝', color: 'cyan' },
    { value: 'purple', label: '紫色', color: 'purple' },
    { value: 'pink', label: '粉色', color: 'magenta' },
  ];

  const getAntdColor = (color) => {
    const colorMap = {
      gray: 'default',
      red: 'red',
      yellow: 'gold',
      green: 'green',
      blue: 'blue',
      indigo: 'cyan',
      purple: 'purple',
      pink: 'magenta',
    };
    return colorMap[color] || 'default';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 150,
    },
    {
      title: '预览',
      dataIndex: 'name',
      key: 'preview',
      width: 150,
      render: (name, record) => (
        <Tag color={getAntdColor(record.color)}>{name}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这个标签吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
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
        <h1 className="text-2xl font-bold">标签管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          添加标签
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tags}
        loading={loading}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />

      <Modal
        title="添加标签"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="标签名称"
            name="name"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="如: GGUF, LoRA" />
          </Form.Item>

          <Form.Item label="颜色" name="color">
            <Select placeholder="选择颜色">
              {colorOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  <Tag color={option.color}>{option.label}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button onClick={() => setModalOpen(false)} className="mr-2">
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="标签详情"
        placement="right"
        width={560}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
      >
        {viewingTag && (
          <div className="space-y-6">
            <Descriptions title="标签信息" bordered column={1}>
              <Descriptions.Item label="ID">{viewingTag.id}</Descriptions.Item>
              <Descriptions.Item label="标签名称">{viewingTag.name}</Descriptions.Item>
              <Descriptions.Item label="颜色">{viewingTag.color}</Descriptions.Item>
              <Descriptions.Item label="预览">
                <Tag color={getAntdColor(viewingTag.color)} className="text-base px-3 py-1">
                  {viewingTag.name}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {viewingTag.created_at ? new Date(viewingTag.created_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
}
