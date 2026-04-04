import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Popconfirm, Drawer, Descriptions, Space, Tag, message } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, EyeOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { eventAPI } from '../services/api';

function formatJsonPreview(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value ?? '');
  }
}

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewEvent, setViewEvent] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await eventAPI.getAll({ include_all: 1 });
      setEvents(resp.data.data || []);
    } catch (err) {
      console.error(err);
      message.error('加载活动失败');
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
      await eventAPI.approval(id, approval_status);
      message.success(approval_status === 'approved' ? '审批通过' : '已拒绝');
      load();
    } catch (err) {
      console.error(err);
      message.error('审批失败');
    }
  };

  const onDelete = async (id) => {
    try {
      await eventAPI.delete(id);
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
      width: 200,
      ellipsis: true,
    },
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      width: 260,
      ellipsis: true,
    },
    {
      title: '排序权重',
      dataIndex: 'sort_weight',
      key: 'sort_weight',
      width: 108,
      sorter: (a, b) => Number(a.sort_weight ?? 0) - Number(b.sort_weight ?? 0),
      defaultSortOrder: 'descend',
      render: (v) => <span className="tabular-nums font-medium">{v != null ? v : 0}</span>,
    },
    {
      title: '类型',
      dataIndex: 'event_type',
      key: 'event_type',
      width: 120,
    },
    {
      title: '形式',
      dataIndex: 'event_mode',
      key: 'event_mode',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'event_status',
      key: 'event_status',
      width: 120,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 120,
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 140,
    },
    {
      title: '名额',
      key: 'participants',
      width: 160,
      render: (_, r) => (
        <span>
          {r.current_participants}/{r.max_participants || '∞'}
        </span>
      ),
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
              setViewEvent(record);
              setDrawerOpen(true);
            }}
          >
            查看
          </Button>
          {record.approval_status !== 'approved' ? (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => onApprove(record.id, 'approved')}
            >
              通过
            </Button>
          ) : null}
          {record.approval_status !== 'rejected' ? (
            <Button
              type="link"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => onApprove(record.id, 'rejected')}
            >
              拒绝
            </Button>
          ) : null}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/events/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该活动吗？"
            onConfirm={() => onDelete(record.id)}
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
        <h1 className="text-2xl font-bold">活动管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/events/create')}>
          添加活动
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={events}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1400 }}
      />

      <Drawer
        title="活动详情"
        placement="right"
        width={760}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {viewEvent ? (
          <div className="space-y-6">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="活动名称">{viewEvent.title}</Descriptions.Item>
              <Descriptions.Item label="排序权重">
                {viewEvent.sort_weight != null ? viewEvent.sort_weight : 0}
                <span className="text-gray-400 text-xs ml-2">（越大前台列表越靠前）</span>
              </Descriptions.Item>
              <Descriptions.Item label="类型">{viewEvent.event_type}</Descriptions.Item>
              <Descriptions.Item label="形式">{viewEvent.event_mode}</Descriptions.Item>
              <Descriptions.Item label="状态">{viewEvent.event_status}</Descriptions.Item>
              <Descriptions.Item label="城市">{viewEvent.city}</Descriptions.Item>
              <Descriptions.Item label="时间">
                {viewEvent.start_date} - {viewEvent.end_date}
              </Descriptions.Item>
              <Descriptions.Item label="地点">{viewEvent.location || '线上'}</Descriptions.Item>
              {viewEvent.online_url ? (
                <Descriptions.Item label="线上链接">
                  <a href={viewEvent.online_url} target="_blank" rel="noopener noreferrer">
                    {viewEvent.online_url}
                  </a>
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label="主办方">{viewEvent.organizer}</Descriptions.Item>
              <Descriptions.Item label="费用">{viewEvent.price || '—'}</Descriptions.Item>
              <Descriptions.Item label="审批状态">
                <Tag color={viewEvent.approval_status === 'approved' ? 'green' : viewEvent.approval_status === 'rejected' ? 'red' : 'gold'}>
                  {viewEvent.approval_status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <div className="text-sm font-bold text-gray-700 mb-2">活动简介</div>
              <div className="bg-gray-50 border rounded p-3 text-sm whitespace-pre-wrap">
                {viewEvent.desc || '-'}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-gray-700 mb-2">活动详情（full_desc）</div>
              <div className="bg-gray-50 border rounded p-3 text-sm whitespace-pre-wrap">
                {viewEvent.full_desc || '-'}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-bold text-gray-700 mb-2">tags（JSON）</div>
                <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto">{formatJsonPreview(viewEvent.tags)}</pre>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-700 mb-2">speakers（JSON）</div>
                <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto">{formatJsonPreview(viewEvent.speakers)}</pre>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-700 mb-2">agenda（JSON）</div>
                <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto">{formatJsonPreview(viewEvent.agenda)}</pre>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

