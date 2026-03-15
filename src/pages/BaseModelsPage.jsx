import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, message, Popconfirm, Tag, Drawer, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import axios from 'axios';

// 统一使用 model_api 作为后端前缀
const API_BASE_URL = 'https://dpsk.ai/model_api/';
function BaseModelsPage() {
  const [baseModels, setBaseModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingBaseModel, setEditingBaseModel] = useState(null);
  const [viewingBaseModel, setViewingBaseModel] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBaseModels();
  }, []);

  const loadBaseModels = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/base-models`);
      setBaseModels(response.data.data);
    } catch (error) {
      console.error('Failed to load base models:', error);
      message.error('加载基座模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBaseModel(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true, sort_order: 0 });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBaseModel(record);
    form.setFieldsValue({
      ...record,
      is_active: Boolean(record.is_active)
    });
    setModalVisible(true);
  };

  const handleView = (record) => {
    setViewingBaseModel(record);
    setDrawerVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingBaseModel) {
        await axios.put(`${API_BASE_URL}base-models/${editingBaseModel.id}`, values);
        message.success('更新成功');
      } else {
        await axios.post(`${API_BASE_URL}base-models`, values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      loadBaseModels();
    } catch (error) {
      console.error('Failed to submit:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('操作失败');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}base-models/${id}`);
      message.success('删除成功');
      loadBaseModels();
    } catch (error) {
      console.error('Failed to delete:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('删除失败');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}base-models/${id}/toggle`);
      message.success('状态更新成功');
      loadBaseModels();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      message.error('更新状态失败');
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
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          {record.version && <Tag color="blue">{record.version}</Tag>}
        </Space>
      ),
    },
    {
      title: '显示名称',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
      sorter: (a, b) => a.sort_order - b.sort_order,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active) => (
        <Tag color={active ? 'success' : 'default'} icon={active ? <CheckCircleOutlined /> : <StopOutlined />}>
          {active ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
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
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.is_active ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            title="确定要删除这个基座模型吗？"
            description="如果有模型正在使用此基座，将无法删除。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">基座模型管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理可用的模型基座配置</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新增基座模型
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={baseModels}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingBaseModel ? '编辑基座模型' : '新增基座模型'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnHidden
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[
              { required: true, message: '请输入基座模型名称' },
              { max: 100, message: '名称不能超过100个字符' }
            ]}
            tooltip="唯一标识，用于在模型中引用（如：DeepSeek-V3）"
          >
            <Input placeholder="例如: DeepSeek-V3" />
          </Form.Item>

          <Form.Item
            label="显示名称"
            name="display_name"
            rules={[
              { required: true, message: '请输入显示名称' },
              { max: 100, message: '显示名称不能超过100个字符' }
            ]}
            tooltip="在前端页面显示的名称"
          >
            <Input placeholder="例如: DeepSeek-V3" />
          </Form.Item>

          <Form.Item
            label="版本号"
            name="version"
            rules={[{ max: 50, message: '版本号不能超过50个字符' }]}
            tooltip="版本标识（如：V3.0）"
          >
            <Input placeholder="例如: V3.0" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            tooltip="基座模型的详细介绍"
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入基座模型的详细描述..."
            />
          </Form.Item>

          <Form.Item
            label="排序"
            name="sort_order"
            rules={[{ required: true, message: '请输入排序值' }]}
            tooltip="数字越小越靠前"
          >
            <InputNumber
              min={0}
              placeholder="0"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="启用状态"
            name="is_active"
            valuePropName="checked"
            tooltip="禁用后将不会在前端显示"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="基座模型详情"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={720}
      >
        {viewingBaseModel && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{viewingBaseModel.id}</Descriptions.Item>
            <Descriptions.Item label="名称">{viewingBaseModel.name}</Descriptions.Item>
            <Descriptions.Item label="显示名称">{viewingBaseModel.display_name}</Descriptions.Item>
            <Descriptions.Item label="版本号">
              {viewingBaseModel.version ? (
                <Tag color="blue">{viewingBaseModel.version}</Tag>
              ) : (
                <span className="text-gray-400">未设置</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="描述">
              {viewingBaseModel.description || <span className="text-gray-400">未填写</span>}
            </Descriptions.Item>
            <Descriptions.Item label="排序">{viewingBaseModel.sort_order}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={viewingBaseModel.is_active ? 'success' : 'default'}>
                {viewingBaseModel.is_active ? '启用' : '禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(viewingBaseModel.created_at).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(viewingBaseModel.updated_at).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}

export default BaseModelsPage;
