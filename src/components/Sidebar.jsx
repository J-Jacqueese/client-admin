import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  AppstoreOutlined,
  RocketOutlined,
  FolderOutlined,
  TagsOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  AppstoreAddOutlined,
  LogoutOutlined,
  FireOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const AUTH_STORAGE_KEY = 'client_admin_auth';

  const menuItems = [
    { path: '/dashboard', icon: DashboardOutlined, label: '仪表盘' },
    { path: '/models', icon: AppstoreOutlined, label: '模型管理' },
    { path: '/apps', icon: RocketOutlined, label: '应用管理' },
    { path: '/categories', icon: FolderOutlined, label: '分类管理' },
    { path: '/tags', icon: TagsOutlined, label: '标签管理' },
    { path: '/base-models', icon: DatabaseOutlined, label: '基座管理' },
    { path: '/events', icon: CalendarOutlined, label: '活动管理' },
    { path: '/event-registrations', icon: UsergroupAddOutlined, label: '报名管理' },
    { path: '/projects', icon: AppstoreAddOutlined, label: '项目管理' },
    { path: '/hot-topics', icon: FireOutlined, label: '热门话题' },
  ];

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            D
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">DeepSeek Club</div>
            <div className="text-xs text-gray-500">后台管理系统</div>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon style={{ fontSize: 20 }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
          >
            <LogoutOutlined style={{ fontSize: 20 }} />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
