import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ModelsPage from './pages/ModelsPage';
import AppsPage from './pages/AppsPage';
import CategoriesPage from './pages/CategoriesPage';
import TagsPage from './pages/TagsPage';
import BaseModelsPage from './pages/BaseModelsPage';
import EventsPage from './pages/EventsPage';
import ProjectsPage from './pages/ProjectsPage';
import EventEditPage from './pages/EventEditPage';
import ProjectEditPage from './pages/ProjectEditPage';
import EventCreatePage from './pages/EventCreatePage';
import ProjectCreatePage from './pages/ProjectCreatePage';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f5f5f5',
        },
        components: {
          Table: {
            headerBg: '#fafafa',
            headerColor: '#262626',
            rowHoverBg: '#fafafa',
          },
          Card: {
            borderRadiusLG: 8,
          },
        },
      }}
    >
      <Router>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 bg-gray-100 min-w-0 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/apps" element={<AppsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/base-models" element={<BaseModelsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/create" element={<EventCreatePage />} />
              <Route path="/events/:id/edit" element={<EventEditPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/create" element={<ProjectCreatePage />} />
              <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
