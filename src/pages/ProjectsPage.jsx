import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Popconfirm, Drawer, Descriptions, Space, Tag, message } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, EyeOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { projectAPI } from '../services/api';

function formatJsonPreview(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value ?? '');
  }
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await projectAPI.getAll({ include_all: 1 });
      setProjects(resp.data.data || []);
    } catch (err) {
      console.error(err);
      message.error('加载项目失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApprove = async (id, approval_status) => {
    try {
      await projectAPI.approval(id, approval_status);
      message.success(approval_status === 'approved' ? '审批通过' : '已拒绝');
      load();
    } catch (err) {
      console.error(err);
      message.error('审批失败');
    }
  };

  const onDelete = async (id) => {
    try {
      await projectAPI.delete(id);
      message.success('删除成功');
      load();
    } catch (err) {
      console.error(err);
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 180,
      ellipsis: true,
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      ellipsis: true,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 120,
    },
    {
      title: 'Stars',
      dataIndex: 'stars',
      key: 'stars',
      width: 100,
      sorter: (a, b) => (a.stars || 0) - (b.stars || 0),
    },
    {
      title: 'Forks',
      dataIndex: 'forks',
      key: 'forks',
      width: 110,
      sorter: (a, b) => (a.forks || 0) - (b.forks || 0),
    },
    {
      title: '最近更新',
      dataIndex: 'last_update',
      key: 'last_update',
      width: 140,
    },
    {
      title: '审批',
      dataIndex: 'approval_status',
      key: 'approval_status',
      width: 130,
      render: (v) => (
        <Tag color={v === 'approved' ? 'green' : v === 'rejected' ? 'red' : 'gold'}>
          {v === 'approved' ? '已通过' : v === 'rejected' ? '已拒绝' : '待审核'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setViewProject(record);
              setDrawerOpen(true);
            }}
          >
            查看
          </Button>
          {record.approval_status !== 'approved' ? (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => onApprove(record.id, 'approved')}>
              通过
            </Button>
          ) : null}
          {record.approval_status !== 'rejected' ? (
            <Button type="link" size="small" icon={<CloseOutlined />} onClick={() => onApprove(record.id, 'rejected')}>
              拒绝
            </Button>
          ) : null}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/projects/${record.id}/edit`)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该项目吗？" onConfirm={() => onDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tagPreview = useMemo(() => {
    if (!viewProject?.topics) return '';
    return Array.isArray(viewProject.topics) ? viewProject.topics.join(', ') : '';
  }, [viewProject]);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">项目管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/projects/create')}>
          添加项目
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={projects}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1400 }}
      />

      <Drawer title="项目详情" placement="right" width={760} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {viewProject ? (
          <div className="space-y-6">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="项目名称">{viewProject.name}</Descriptions.Item>
              <Descriptions.Item label="full_name">{viewProject.full_name}</Descriptions.Item>
              <Descriptions.Item label="类别">{viewProject.category}</Descriptions.Item>
              <Descriptions.Item label="语言">{viewProject.language}</Descriptions.Item>
              <Descriptions.Item label="Stars">{viewProject.stars}</Descriptions.Item>
              <Descriptions.Item label="Forks">{viewProject.forks}</Descriptions.Item>
              <Descriptions.Item label="Issues">{viewProject.issues}</Descriptions.Item>
              <Descriptions.Item label="贡献者">{viewProject.contributors}</Descriptions.Item>
              <Descriptions.Item label="许可证">{viewProject.license || '-'}</Descriptions.Item>
              <Descriptions.Item label="最近更新">{viewProject.last_update || '-'}</Descriptions.Item>
              <Descriptions.Item label="审批状态">
                <Tag
                  color={
                    viewProject.approval_status === 'approved'
                      ? 'green'
                      : viewProject.approval_status === 'rejected'
                        ? 'red'
                        : 'gold'
                  }
                >
                  {viewProject.approval_status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="GitHub">
                <a href={viewProject.github_url} target="_blank" rel="noopener noreferrer">
                  {viewProject.github_url}
                </a>
              </Descriptions.Item>
              {viewProject.website_url ? (
                <Descriptions.Item label="官网">
                  <a href={viewProject.website_url} target="_blank" rel="noopener noreferrer">
                    {viewProject.website_url}
                  </a>
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            <div>
              <div className="text-sm font-bold text-gray-700 mb-2">description</div>
              <div className="bg-gray-50 border rounded p-3 text-sm whitespace-pre-wrap">{viewProject.description || '-'}</div>
            </div>

            <div>
              <div className="text-sm font-bold text-gray-700 mb-2">long_description</div>
              <div className="bg-gray-50 border rounded p-3 text-sm whitespace-pre-wrap">{viewProject.long_description || '-'}</div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-bold text-gray-700 mb-2">topics（JSON）</div>
                <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto">{formatJsonPreview(viewProject.topics)}</pre>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-700 mb-2">submitted_reason</div>
                <div className="bg-gray-50 border rounded p-3 text-sm whitespace-pre-wrap">{viewProject.submitted_reason || '-'}</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-700 mb-2">submitted_tags</div>
                <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto">{formatJsonPreview(viewProject.submitted_tags)}</pre>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

