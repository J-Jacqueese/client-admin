import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  AppstoreOutlined,
  RocketOutlined,
  FolderOutlined,
  TagsOutlined,
  DownloadOutlined,
  HeartOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { statsAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await statsAPI.get();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">仪表盘</h1>
        <p className="text-gray-500">欢迎回来，管理员</p>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="模型总数"
              value={stats?.models?.count || 0}
              prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="text-xs text-gray-500 mt-2">
              总下载: {stats?.models?.totalDownloads || 0}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="应用总数"
              value={stats?.apps?.count || 0}
              prefix={<RocketOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="text-xs text-gray-500 mt-2">
              总点赞: {stats?.apps?.totalUpvotes || 0}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="分类数量"
              value={stats?.categories || 0}
              prefix={<FolderOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="标签数量"
              value={stats?.tags || 0}
              prefix={<TagsOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title={<><TrophyOutlined className="mr-2" />模型统计</>}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DownloadOutlined className="text-gray-400 mr-3" />
                  <span className="text-gray-600">总下载量</span>
                </div>
                <span className="text-lg font-bold">
                  {stats?.models?.totalDownloads || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HeartOutlined className="text-gray-400 mr-3" />
                  <span className="text-gray-600">总点赞数</span>
                </div>
                <span className="text-lg font-bold">
                  {stats?.models?.totalLikes || 0}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><RocketOutlined className="mr-2" />应用统计</>}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrophyOutlined className="text-gray-400 mr-3" />
                  <span className="text-gray-600">总点赞数</span>
                </div>
                <span className="text-lg font-bold">
                  {stats?.apps?.totalUpvotes || 0}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="快捷操作">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Link to="/models">
              <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                <AppstoreOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                <span className="text-sm font-medium text-gray-700 mt-2">管理模型</span>
              </div>
            </Link>
          </Col>
          <Col xs={12} sm={6}>
            <Link to="/apps">
              <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
                <RocketOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                <span className="text-sm font-medium text-gray-700 mt-2">管理应用</span>
              </div>
            </Link>
          </Col>
          <Col xs={12} sm={6}>
            <Link to="/categories">
              <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
                <FolderOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                <span className="text-sm font-medium text-gray-700 mt-2">管理分类</span>
              </div>
            </Link>
          </Col>
          <Col xs={12} sm={6}>
            <Link to="/tags">
              <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all cursor-pointer">
                <TagsOutlined style={{ fontSize: 32, color: '#faad14' }} />
                <span className="text-sm font-medium text-gray-700 mt-2">管理标签</span>
              </div>
            </Link>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
