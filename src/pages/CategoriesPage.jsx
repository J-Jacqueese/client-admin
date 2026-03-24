import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag, Drawer, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { categoryAPI } from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories(keyword);
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword]);

  const loadCategories = async (searchValue = '') => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAll({ search: searchValue.trim() || undefined });
      setCategories(response.data.data);
    } catch (error) {
      message.error('加载分类列表失败');
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      sort_order: 0,
    });
    setModalOpen(true);
  };

  const handleView = (category) => {
    setViewingCategory(category);
    setDetailDrawerOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      icon: category.icon || '',
      type: category.type,
      sort_order: category.sort_order || 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await categoryAPI.delete(id);
      message.success('删除成功');
      loadCategories(keyword);
    } catch (error) {
      console.error('Failed to delete category:', error);
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的分类');
      return;
    }

    const results = await Promise.allSettled(selectedRowKeys.map((id) => categoryAPI.delete(id)));
    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    const failedCount = selectedRowKeys.length - successCount;

    if (successCount > 0 && failedCount === 0) {
      message.success(`批量删除成功，共删除 ${successCount} 条`);
    } else if (successCount > 0) {
      message.warning(`批量删除完成，成功 ${successCount} 条，失败 ${failedCount} 条`);
    } else {
      message.error('批量删除失败');
    }

    setSelectedRowKeys([]);
    loadCategories(keyword);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, values);
        message.success('更新成功');
      } else {
        await categoryAPI.create(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      loadCategories(keyword);
    } catch (error) {
      console.error('Failed to save category:', error);
      message.error('保存失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 150,
      render: (icon) => (
        <code className="px-2 py-1 bg-gray-100 text-xs rounded">
          {icon || '-'}
        </code>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={type === 'model' ? 'blue' : 'purple'}>
          {type === 'model' ? '模型' : '应用'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
      sorter: (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
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
        <h1 className="text-2xl font-bold">分类管理</h1>
        <Space>
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 个分类吗？`}
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
            disabled={selectedRowKeys.length === 0}
          >
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
              批量删除
            </Button>
          </Popconfirm>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            添加分类
          </Button>
        </Space>
      </div>

      <div className="mb-4">
        <Input
          allowClear
          value={keyword}
          placeholder="请输入分类名称，支持模糊查询"
          onChange={(e) => setKeyword(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        loading={loading}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />

      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item label="图标名称" name="icon">
            <Input placeholder="lucide图标名称，如: code, scale" />
          </Form.Item>

          <Form.Item
            label="类型"
            name="type"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="选择类型">
              <Select.Option value="model">模型</Select.Option>
              <Select.Option value="app">应用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="排序权重" name="sort_order" extra="数字越小排序越靠前">
            <Input type="number" placeholder="0" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="分类详情"
        placement="right"
        width={600}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
      >
        {viewingCategory && (
          <Descriptions title="分类信息" bordered column={1}>
            <Descriptions.Item label="ID">{viewingCategory.id}</Descriptions.Item>
            <Descriptions.Item label="分类名称">{viewingCategory.name}</Descriptions.Item>
            <Descriptions.Item label="图标名称">
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                {viewingCategory.icon || '-'}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag color={viewingCategory.type === 'model' ? 'blue' : 'purple'}>
                {viewingCategory.type === 'model' ? '模型' : '应用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="排序权重">{viewingCategory.sort_order}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {viewingCategory.created_at ? new Date(viewingCategory.created_at).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {viewingCategory.updated_at ? new Date(viewingCategory.updated_at).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
