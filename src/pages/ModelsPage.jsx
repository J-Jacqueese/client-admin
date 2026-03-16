import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Popconfirm, Divider, Drawer, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, FileOutlined, MinusCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { modelAPI, categoryAPI, tagAPI, baseModelAPI } from '../services/api';

const { TextArea } = Input;
const MODEL_TYPE_OPTIONS = [
  { value: 'hot', label: '热门' },
  { value: 'latest', label: '最新' },
  { value: 'recommended', label: '推荐' },
  { value: 'official', label: '官方' },
];

const MODEL_TYPE_META = {
  hot: { label: '热门', color: 'red' },
  latest: { label: '最新', color: 'green' },
  recommended: { label: '推荐', color: 'blue' },
  official: { label: '官方', color: 'gold' },
};

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [baseModels, setBaseModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [viewingModel, setViewingModel] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadModels();
    loadCategories();
    loadTags();
    loadBaseModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const response = await modelAPI.getAll({});
      setModels(response.data.data);
    } catch (error) {
      message.error('加载模型列表失败');
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll('model');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagAPI.getAll();
      setTags(response.data.data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const loadBaseModels = async () => {
    try {
      const response = await baseModelAPI.getAll({});
      setBaseModels(response.data.data || []);
    } catch (error) {
      console.error('Failed to load base models:', error);
    }
  };

  const handleCreate = () => {
    setEditingModel(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleView = (model) => {
    setViewingModel(model);
    setDetailDrawerOpen(true);
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    
    // 处理下载链接数组
    const downloadLinks = model.download_links && Array.isArray(model.download_links) 
      ? model.download_links 
      : [];
    
    // 处理文件数组
    const files = model.files && Array.isArray(model.files) 
      ? model.files 
      : [];
    
    // 处理标签 - 将标签名称数组转换为标签ID数组
    let tagIds = [];
    if (model.tags) {
      const modelTagNames = Array.isArray(model.tags) ? model.tags : model.tags.split(',');
      tagIds = tags
        .filter(tag => modelTagNames.includes(tag.name))
        .map(tag => tag.id);
    }
    
    form.setFieldsValue({
      name: model.name,
      author: model.author,
      version: model.version || '',
      model_type: model.model_type || undefined,
      base_model: model.base_model || '',
      category_id: model.category_id || undefined,
      tags: tagIds,
      description: model.description || '',
      readme: model.readme || '',
      prompt_example: model.prompt_example || '',
      comparison: model.comparison || '',
      download_links: downloadLinks,
      files: files,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await modelAPI.delete(id);
      message.success('删除成功');
      loadModels();
    } catch (error) {
      console.error('Failed to delete model:', error);
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      // 处理下载链接和文件数据，转换为JSON字符串
      const submitData = {
        ...values,
        download_links: values.download_links || [],
        files: values.files || [],
      };
      
      if (editingModel) {
        await modelAPI.update(editingModel.id, submitData);
        message.success('更新成功');
      } else {
        await modelAPI.create(submitData);
        message.success('创建成功');
      }
      setModalOpen(false);
      loadModels();
    } catch (error) {
      console.error('Failed to save model:', error);
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
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 250,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 150,
    },
    {
      title: '基座模型',
      dataIndex: 'base_model',
      key: 'base_model',
      width: 120,
      render: (text) => text && <Tag color="blue">{text}</Tag>,
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 120,
    },
    {
      title: '模型类型',
      dataIndex: 'model_type',
      key: 'model_type',
      width: 100,
      render: (type) => {
        if (!type || !MODEL_TYPE_META[type]) return <span className="text-gray-400">-</span>;
        return <Tag color={MODEL_TYPE_META[type].color}>{MODEL_TYPE_META[type].label}</Tag>;
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags) => (
        <>
          {tags && tags.length > 0 ? (
            tags.map((tag, index) => (
              <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
                {tag}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </>
      ),
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
      width: 80,
      sorter: (a, b) => (a.likes || 0) - (b.likes || 0),
    },
    {
      title: '下载',
      dataIndex: 'downloads',
      key: 'downloads',
      width: 100,
      sorter: (a, b) => (a.downloads || 0) - (b.downloads || 0),
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
            title="确定要删除这个模型吗？"
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
        <h1 className="text-2xl font-bold">模型管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          添加模型
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={models}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />

      <Modal
        title={editingModel ? '编辑模型' : '添加模型'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={1000}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="模型名称"
            name="name"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称" />
          </Form.Item>

          <Form.Item
            label="作者"
            name="author"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input placeholder="请输入作者" />
          </Form.Item>

          <Form.Item label="版本号" name="version">
            <Input placeholder="如：v1.0.0" />
          </Form.Item>

          <Form.Item label="模型类型" name="model_type">
            <Select placeholder="选择模型类型标签（可选）" allowClear options={MODEL_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item label="基座模型" name="base_model">
            <Select
              placeholder="选择基座模型（来自基座管理）"
              allowClear
              showSearch
              optionFilterProp="label"
              options={baseModels.map((bm) => ({
                value: bm.name,
                label: bm.display_name || bm.name,
              }))}
            />
          </Form.Item>

          <Form.Item label="分类" name="category_id">
            <Select placeholder="选择分类" allowClear>
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="标签" name="tags">
            <Select
              mode="multiple"
              placeholder="选择标签（可多选）"
              allowClear
              maxTagCount="responsive"
            >
              {tags.map((tag) => (
                <Select.Option key={tag.id} value={tag.id}>
                  {tag.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="简短描述" name="description">
            <TextArea rows={2} placeholder="请输入简短描述" />
          </Form.Item>

          <Form.Item label="详细介绍 (Markdown)" name="readme">
            <TextArea rows={5} placeholder="支持 Markdown 格式" />
          </Form.Item>

          <Form.Item label="推荐 Prompt" name="prompt_example">
            <TextArea rows={3} placeholder="请输入推荐 Prompt" />
          </Form.Item>

          <Form.Item label="效果对标说明" name="comparison">
            <TextArea rows={2} placeholder="请输入效果对标说明" />
          </Form.Item>

          <Divider orientation="left">
            <LinkOutlined /> 下载链接配置
          </Divider>
          
          <Form.List name="download_links">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      rules={[{ required: true, message: '请选择链接类型' }]}
                    >
                      <Select placeholder="选择链接类型" style={{ width: 180 }}>
                        <Select.Option value="HuggingFace">
                          🤗 HuggingFace
                        </Select.Option>
                        <Select.Option value="ModelScope">
                          🔷 ModelScope
                        </Select.Option>
                        <Select.Option value="GitHub">
                          🐙 GitHub
                        </Select.Option>
                        <Select.Option value="网盘下载">
                          💾 网盘下载
                        </Select.Option>
                        <Select.Option value="百度网盘">
                          💿 百度网盘
                        </Select.Option>
                        <Select.Option value="阿里云盘">
                          ☁️ 阿里云盘
                        </Select.Option>
                        <Select.Option value="Google Drive">
                          📁 Google Drive
                        </Select.Option>
                        <Select.Option value="Kaggle">
                          🏆 Kaggle
                        </Select.Option>
                        <Select.Option value="其他">
                          🔗 其他
                        </Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'url']}
                      rules={[
                        { required: true, message: '请输入链接地址' },
                        { type: 'url', message: '请输入有效的URL地址' }
                      ]}
                    >
                      <Input placeholder="https://huggingface.co/..." style={{ width: 400 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加下载链接
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider orientation="left">
            <FileOutlined /> 模型文件列表
          </Divider>
          
          <Form.List name="files">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '请输入文件名' }]}
                    >
                      <Input placeholder="model_q4.gguf" style={{ width: 300 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'size']}
                      rules={[{ required: true, message: '请输入文件大小' }]}
                    >
                      <Input placeholder="18.2 GB" style={{ width: 120 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加文件
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingModel ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="模型详情"
        placement="right"
        width={800}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
      >
        {viewingModel && (
          <div className="space-y-6">
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="ID">{viewingModel.id}</Descriptions.Item>
              <Descriptions.Item label="模型名称">{viewingModel.name}</Descriptions.Item>
              <Descriptions.Item label="作者">{viewingModel.author}</Descriptions.Item>
              <Descriptions.Item label="版本号">{viewingModel.version || '-'}</Descriptions.Item>
              <Descriptions.Item label="模型类型">
                {viewingModel.model_type && MODEL_TYPE_META[viewingModel.model_type] ? (
                  <Tag color={MODEL_TYPE_META[viewingModel.model_type].color}>
                    {MODEL_TYPE_META[viewingModel.model_type].label}
                  </Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="基座模型" span={2}>
                {viewingModel.base_model ? (
                  <Tag color="blue">{viewingModel.base_model}</Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="分类" span={2}>
                {viewingModel.category_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="标签" span={2}>
                {viewingModel.tags && viewingModel.tags.length > 0 ? (
                  viewingModel.tags.map((tag, index) => (
                    <Tag key={index} color="purple" style={{ marginRight: 4 }}>
                      {tag}
                    </Tag>
                  ))
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="简短描述" span={2}>
                {viewingModel.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="统计数据" bordered column={3}>
              <Descriptions.Item label="点赞数">{viewingModel.likes || 0}</Descriptions.Item>
              <Descriptions.Item label="下载量">{viewingModel.downloads || 0}</Descriptions.Item>
              <Descriptions.Item label="浏览量">{viewingModel.views || 0}</Descriptions.Item>
            </Descriptions>

            {viewingModel.readme && (
              <div>
                <h4 className="text-base font-semibold mb-3">详细介绍</h4>
                <div className="bg-gray-50 p-4 rounded border">
                  <pre className="whitespace-pre-wrap text-sm">{viewingModel.readme}</pre>
                </div>
              </div>
            )}

            {viewingModel.prompt_example && (
              <div>
                <h4 className="text-base font-semibold mb-3">推荐 Prompt</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{viewingModel.prompt_example}</pre>
                </div>
              </div>
            )}

            {viewingModel.comparison && (
              <div>
                <h4 className="text-base font-semibold mb-3">效果对标说明</h4>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm">
                  {viewingModel.comparison}
                </div>
              </div>
            )}

            {viewingModel.download_links && viewingModel.download_links.length > 0 && (
              <div>
                <h4 className="text-base font-semibold mb-3">
                  <LinkOutlined className="mr-2" />
                  下载链接
                </h4>
                <div className="space-y-2">
                  {viewingModel.download_links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                      <div>
                        <Tag color="blue">{link.type}</Tag>
                        <span className="text-sm text-gray-600 ml-2">{link.url}</span>
                      </div>
                      <Button
                        type="link"
                        size="small"
                        href={link.url}
                        target="_blank"
                        icon={<LinkOutlined />}
                      >
                        访问
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewingModel.files && viewingModel.files.length > 0 && (
              <div>
                <h4 className="text-base font-semibold mb-3">
                  <FileOutlined className="mr-2" />
                  模型文件
                </h4>
                <div className="space-y-2">
                  {viewingModel.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                      <div className="flex items-center">
                        <FileOutlined className="text-gray-400 mr-2" />
                        <span className="text-sm font-mono">{file.name}</span>
                      </div>
                      <Tag>{file.size}</Tag>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Descriptions title="时间信息" bordered column={2}>
              <Descriptions.Item label="创建时间">
                {viewingModel.created_at ? new Date(viewingModel.created_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {viewingModel.updated_at ? new Date(viewingModel.updated_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
}
