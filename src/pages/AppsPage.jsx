import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Space, Popconfirm, Row, Col, Drawer, Descriptions, Tag, Divider, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, EyeOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { appAPI, categoryAPI } from '../services/api';
import { resolveAdminMediaUrl } from '../utils/mediaUrl';

const { TextArea } = Input;

export default function AppsPage() {
  const [apps, setApps] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState(null);
  const [form] = Form.useForm();

  const normalizeDownloadLinks = (downloadLinks) => {
    if (Array.isArray(downloadLinks)) return downloadLinks;
    if (typeof downloadLinks === 'string') {
      try {
        const parsed = JSON.parse(downloadLinks);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadApps(keyword);
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword]);

  const loadApps = async (searchValue = '') => {
    setLoading(true);
    try {
      const response = await appAPI.getAll({ search: searchValue.trim() || undefined });
      setApps(response.data.data);
    } catch (error) {
      message.error('加载应用列表失败');
      console.error('Failed to load apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll({});
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCreate = () => {
    loadCategories();
    setEditingApp(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleView = (app) => {
    setViewingApp(app);
    setDetailDrawerOpen(true);
  };

  const handleEdit = (app) => {
    loadCategories();
    setEditingApp(app);

    const downloadLinks = normalizeDownloadLinks(app.download_links);

    form.setFieldsValue({
      name: app.name,
      developer: app.developer,
      version: app.version || '',
      base_model: app.base_model || '',
      upvotes: app.upvotes ?? 0,
      downloads: app.downloads ?? 0,
      stars: app.stars ?? 0,
      download_links: downloadLinks,
      category_id: app.category_id || undefined,
      description: app.description || '',
      detail: app.detail || '',
      website_url: app.website_url || '',
      comparison: app.comparison || '',
      icon_bg: app.icon_bg || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await appAPI.delete(id);
      message.success('删除成功');
      loadApps(keyword);
    } catch (error) {
      console.error('Failed to delete app:', error);
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的应用');
      return;
    }

    const results = await Promise.allSettled(selectedRowKeys.map((id) => appAPI.delete(id)));
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
    loadApps(keyword);
  };

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        download_links: values.download_links || [],
      };

      if (editingApp) {
        await appAPI.update(editingApp.id, submitData);
        message.success('更新成功');
      } else {
        await appAPI.create(submitData);
        message.success('创建成功');
      }
      setModalOpen(false);
      loadApps(keyword);
    } catch (error) {
      console.error('Failed to save app:', error);
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
      title: '应用图标',
      dataIndex: 'icon_bg',
      key: 'icon_bg',
      width: 110,
      render: (iconUrl, record) => (
        iconUrl ? (
          <img
            src={iconUrl}
            alt={record.name || '应用图标'}
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#f3f4f6',
              color: '#9ca3af',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            无图
          </div>
        )
      ),
    },
    {
      title: '应用名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 200,
    },
    {
      title: '开发者',
      dataIndex: 'developer',
      key: 'developer',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 120,
    },
    {
      title: '点赞数',
      dataIndex: 'upvotes',
      key: 'upvotes',
      width: 100,
      sorter: (a, b) => (a.upvotes || 0) - (b.upvotes || 0),
    },
    {
      title: '下载量',
      dataIndex: 'downloads',
      key: 'downloads',
      width: 100,
      sorter: (a, b) => (a.downloads || 0) - (b.downloads || 0),
    },
    {
      title: 'Star 数',
      dataIndex: 'stars',
      key: 'stars',
      width: 100,
      sorter: (a, b) => (a.stars || 0) - (b.stars || 0),
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      sorter: (a, b) => (a.views || 0) - (b.views || 0),
    },
    {
      title: '官网',
      dataIndex: 'website_url',
      key: 'website_url',
      width: 100,
      render: (url) =>
        url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
            <LinkOutlined /> 访问
          </a>
        ),
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
            title="确定要删除这个应用吗？"
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
        <h1 className="text-2xl font-bold">应用管理</h1>
        <Space>
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 个应用吗？`}
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
            添加应用
          </Button>
        </Space>
      </div>

      <div className="mb-4">
        <Input
          allowClear
          value={keyword}
          placeholder="请输入应用名称，支持模糊查询"
          onChange={(e) => setKeyword(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={apps}
        loading={loading}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
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
        title={editingApp ? '编辑应用' : '添加应用'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="应用名称"
            name="name"
            rules={[{ required: true, message: '请输入应用名称' }]}
          >
            <Input placeholder="请输入应用名称" />
          </Form.Item>

          <Form.Item
            label="开发者"
            name="developer"
            rules={[{ required: true, message: '请输入开发者' }]}
          >
            <Input placeholder="请输入开发者" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="版本号" name="version">
                <Input placeholder="如：v1.0.0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="基于模型" name="base_model">
                <Input placeholder="如：DeepSeek-R1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="基础点赞数"
                name="upvotes"
                tooltip="用于前端展示的预设点赞基数，仅后台可修改"
              >
                <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="如：1200" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="基础下载量" name="downloads" tooltip="用于前端展示的预设下载量，仅后台可修改">
                <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="如：5800" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="基础 Star 数" name="stars" tooltip="用于前端展示的预设 Star 数，仅后台可修改">
                <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="如：2600" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="分类" name="category_id">
            <Select placeholder="选择分类" allowClear onDropdownVisibleChange={(open) => open && loadCategories()}>
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  [{cat.id}] {cat.name}（{cat.type === 'app' ? '应用' : '模型'}）
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="简短描述" name="description">
            <TextArea rows={2} placeholder="请输入简短描述" />
          </Form.Item>

          <Form.Item label="详细介绍" name="detail">
            <TextArea rows={5} placeholder="支持 Markdown 格式" />
          </Form.Item>

          <Form.Item label="官网链接" name="website_url">
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Divider orientation="left">
            <LinkOutlined /> 下载地址配置
          </Divider>

          <Form.List name="download_links">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      rules={[{ required: true, message: '请选择下载类型' }]}
                    >
                      <Select placeholder="选择下载类型" style={{ width: 180 }}>
                        <Select.Option value="官网下载">官网下载</Select.Option>
                        <Select.Option value="App Store">App Store</Select.Option>
                        <Select.Option value="Google Play">Google Play</Select.Option>
                        <Select.Option value="Windows">Windows</Select.Option>
                        <Select.Option value="macOS">macOS</Select.Option>
                        <Select.Option value="Android APK">Android APK</Select.Option>
                        <Select.Option value="TestFlight">TestFlight</Select.Option>
                        <Select.Option value="GitHub Release">GitHub Release</Select.Option>
                        <Select.Option value="网盘下载">网盘下载</Select.Option>
                        <Select.Option value="其他">其他</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'url']}
                      rules={[
                        { required: true, message: '请输入下载地址' },
                        { type: 'url', message: '请输入有效 URL' },
                      ]}
                    >
                      <Input placeholder="https://example.com/download" style={{ width: 420 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加下载地址
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item label="效果对比说明" name="comparison">
            <TextArea rows={2} placeholder="请输入效果对比说明" />
          </Form.Item>

          <Form.Item label="应用图标">
            <Space direction="vertical" size="middle" className="w-full">
              <Form.Item name="icon_bg" noStyle>
                <Input placeholder="图片地址，或点击下方上传" />
              </Form.Item>
              <Upload
                accept="image/jpeg,image/png,image/gif,image/webp"
                showUploadList={false}
                customRequest={async ({ file, onSuccess, onError }) => {
                  try {
                    // 检查文件大小（1MB限制）
                    if (file.size > 1024 * 1024) {
                      message.error('图标文件不能超过1MB');
                      onError(new Error('文件过大'));
                      return;
                    }
                    const resp = await appAPI.uploadIcon(file);
                    const url = resp.data?.url;
                    form.setFieldsValue({ icon_bg: url });
                    onSuccess(resp.data);
                    message.success('图标上传成功');
                  } catch (e) {
                    onError(e);
                    message.error(e?.response?.data?.message || '图标上传失败');
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>上传图标（限1MB）</Button>
              </Upload>
              <Form.Item noStyle shouldUpdate>
                {() => {
                  const u = form.getFieldValue('icon_bg');
                  return u ? (
                    <img src={resolveAdminMediaUrl(u)} alt="图标预览" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
                  ) : null;
                }}
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingApp ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="应用详情"
        placement="right"
        width={720}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
      >
        {viewingApp && (
          <div className="space-y-6">
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="ID">{viewingApp.id}</Descriptions.Item>
              <Descriptions.Item label="应用名称">{viewingApp.name}</Descriptions.Item>
              <Descriptions.Item label="开发者">{viewingApp.developer}</Descriptions.Item>
              <Descriptions.Item label="版本号">{viewingApp.version || '-'}</Descriptions.Item>
              <Descriptions.Item label="基于模型" span={2}>
                {viewingApp.base_model || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="分类" span={2}>
                {viewingApp.category_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="应用图标" span={2}>
                {viewingApp.icon_bg ? (
                  <div className="flex items-center space-x-3">
                    <img
                      src={viewingApp.icon_bg}
                      alt={viewingApp.name}
                      style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }}
                    />
                    <span className="text-xs text-gray-500 break-all">{viewingApp.icon_bg}</span>
                  </div>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="简短描述" span={2}>
                {viewingApp.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="统计数据" bordered column={2}>
              <Descriptions.Item label="点赞数">{viewingApp.upvotes || 0}</Descriptions.Item>
              <Descriptions.Item label="下载量">{viewingApp.downloads || 0}</Descriptions.Item>
              <Descriptions.Item label="Star 数">{viewingApp.stars || 0}</Descriptions.Item>
              <Descriptions.Item label="浏览量">{viewingApp.views || 0}</Descriptions.Item>
            </Descriptions>

            {viewingApp.detail && (
              <div>
                <h4 className="text-base font-semibold mb-3">详细介绍</h4>
                <div className="bg-gray-50 p-4 rounded border">
                  <pre className="whitespace-pre-wrap text-sm">{viewingApp.detail}</pre>
                </div>
              </div>
            )}

            {viewingApp.comparison && (
              <div>
                <h4 className="text-base font-semibold mb-3">效果对比说明</h4>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm">
                  {viewingApp.comparison}
                </div>
              </div>
            )}

            {viewingApp.website_url && (
              <Descriptions title="链接信息" bordered>
                <Descriptions.Item label="官网链接">
                  <Button
                    type="link"
                    href={viewingApp.website_url}
                    target="_blank"
                    icon={<LinkOutlined />}
                  >
                    {viewingApp.website_url}
                  </Button>
                </Descriptions.Item>
              </Descriptions>
            )}

            {normalizeDownloadLinks(viewingApp.download_links).length > 0 && (
              <div>
                <h4 className="text-base font-semibold mb-3">
                  <LinkOutlined className="mr-2" />
                  下载地址
                </h4>
                <div className="space-y-2">
                  {normalizeDownloadLinks(viewingApp.download_links).map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                      <div>
                        <Tag color="blue">{link.type || '下载地址'}</Tag>
                        <span className="text-sm text-gray-600 ml-2">{link.url}</span>
                      </div>
                      <Button type="link" size="small" href={link.url} target="_blank" icon={<LinkOutlined />}>
                        访问
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Descriptions title="时间信息" bordered column={2}>
              <Descriptions.Item label="创建时间">
                {viewingApp.created_at ? new Date(viewingApp.created_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {viewingApp.updated_at ? new Date(viewingApp.updated_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
}
