import { useEffect, useState } from 'react';
import { Table, Select, Input, Tag, Card, Statistic, Row, Col, message, Drawer, Descriptions } from 'antd';
import { UserOutlined, TeamOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { eventAPI } from '../services/api';

const { Search } = Input;

export default function EventRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, events: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewingRegistration, setViewingRegistration] = useState(null);

  useEffect(() => {
    loadEvents();
    loadStats();
  }, []);

  useEffect(() => {
    loadRegistrations(selectedEventId);
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const resp = await eventAPI.getAll({ include_all: 1 });
      setEvents(resp.data.data || []);
    } catch (err) {
      console.error(err);
      message.error('加载活动列表失败');
    }
  };

  const loadRegistrations = async (eventId) => {
    setLoading(true);
    try {
      const params = {};
      if (eventId) {
        params.event_id = eventId;
      }
      const resp = await eventAPI.getRegistrations(params);
      setRegistrations(resp.data.data || []);
    } catch (err) {
      console.error(err);
      message.error('加载报名列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const resp = await eventAPI.getRegistrationStats();
      setStats(resp.data.data || { total: 0, events: [] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (value) => {
    // 搜索功能
    setLoading(true);
    eventAPI.getRegistrations({ search: value, event_id: selectedEventId || undefined })
      .then(resp => setRegistrations(resp.data.data || []))
      .catch(() => message.error('搜索失败'))
      .finally(() => setLoading(false));
  };

  const handleView = (record) => {
    setViewingRegistration(record);
    setDrawerOpen(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '活动名称',
      dataIndex: 'event_title',
      key: 'event_title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '公司/学校',
      dataIndex: 'company',
      key: 'company',
      width: 150,
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
    },
    {
      title: '购票数量',
      dataIndex: 'ticket_count',
      key: 'ticket_count',
      width: 100,
      render: (v) => <span className="font-medium">{v || 1}</span>,
    },
    {
      title: '团队名称',
      dataIndex: 'team_name',
      key: 'team_name',
      width: 120,
    },
    {
      title: '支付状态',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 100,
      render: (v) => {
        const colorMap = {
          free: 'green',
          paid: 'blue',
          unpaid: 'orange',
          success: 'green',
          pending: 'gold',
        };
        const labelMap = {
          free: '免费',
          paid: '已支付',
          unpaid: '未支付',
          success: '成功',
          pending: '待支付',
        };
        return <Tag color={colorMap[v] || 'default'}>{labelMap[v] || v}</Tag>;
      },
    },
    {
      title: '报名时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (v) => v ? new Date(v).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <a onClick={() => handleView(record)}>
          <EyeOutlined /> 查看
        </a>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">报名管理</h1>
        
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="总报名数"
                value={stats.total}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活动数量"
                value={stats.events?.length || 0}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="当前筛选报名数"
                value={registrations.length}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <div className="flex gap-4 mb-4">
          <Select
            placeholder="筛选活动"
            allowClear
            style={{ width: 300 }}
            value={selectedEventId || undefined}
            onChange={(v) => setSelectedEventId(v || '')}
          >
            {events.map((e) => (
              <Select.Option key={e.id} value={e.id}>
                {e.title}
              </Select.Option>
            ))}
          </Select>
          <Search
            placeholder="搜索姓名/邮箱/手机号"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
        </div>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={registrations}
        loading={loading}
        scroll={{ x: 1600 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          defaultPageSize: 20,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />

      <Drawer
        title="报名详情"
        placement="right"
        width={600}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {viewingRegistration && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="报名ID">{viewingRegistration.id}</Descriptions.Item>
            <Descriptions.Item label="活动名称">{viewingRegistration.event_title}</Descriptions.Item>
            <Descriptions.Item label="姓名">{viewingRegistration.name}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{viewingRegistration.email}</Descriptions.Item>
            <Descriptions.Item label="手机号">{viewingRegistration.phone}</Descriptions.Item>
            <Descriptions.Item label="公司/学校">{viewingRegistration.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="角色">{viewingRegistration.role || '-'}</Descriptions.Item>
            <Descriptions.Item label="购票数量">{viewingRegistration.ticket_count || 1}</Descriptions.Item>
            <Descriptions.Item label="团队名称">{viewingRegistration.team_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="团队规模">{viewingRegistration.team_size || '-'}</Descriptions.Item>
            <Descriptions.Item label="支付状态">
              <Tag color={viewingRegistration.payment_status === 'free' ? 'green' : 'blue'}>
                {viewingRegistration.payment_status === 'free' ? '免费' : viewingRegistration.payment_status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="备注">{viewingRegistration.notes || '-'}</Descriptions.Item>
            <Descriptions.Item label="报名时间">
              {viewingRegistration.created_at ? new Date(viewingRegistration.created_at).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
