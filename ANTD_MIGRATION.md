# Ant Design 迁移指南

## ✅ 已完成

1. 安装了以下依赖：
   - `antd@6.2.3` - Ant Design 组件库
   - `@ant-design/icons@6.1.0` - Ant Design 图标库
   - `dayjs@1.11.19` - 日期处理库（Ant Design 依赖）

## 📦 主要改动

### 1. App.jsx 配置

使用 `ConfigProvider` 包裹应用，配置中文语言和主题：

```jsx
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

<ConfigProvider
  locale={zhCN}
  theme={{
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
    },
  }}
>
  {/* 你的应用 */}
</ConfigProvider>
```

### 2. 引入 Ant Design 样式

在 `main.jsx` 中引入：

```jsx
import 'antd/dist/reset.css'; // Ant Design 重置样式
```

### 3. 常用组件对照表

| 功能 | 原来的实现 | Ant Design 组件 |
|------|-----------|----------------|
| 表格 | 自定义 table | `<Table>` |
| 按钮 | button 标签 | `<Button>` |
| 模态框 | 自定义 Modal | `<Modal>` |
| 表单 | 原生 form | `<Form>` |
| 输入框 | input 标签 | `<Input>` |
| 下拉选择 | select 标签 | `<Select>` |
| 消息提示 | alert | `message.success()` |
| 确认框 | confirm | `Modal.confirm()` |
| 标签 | span | `<Tag>` |
| 图标 | lucide-react | `@ant-design/icons` |

## 📝 示例文件

已创建以下示例文件供参考：

1. `src/App-antd.jsx.example` - App.jsx 的 Ant Design 版本
2. `src/pages/ModelsPage-antd.jsx.example` - 模型管理页面的 Ant Design 版本

## 🚀 使用方法

### 方式一：直接替换（推荐）

```bash
# 1. 备份原文件
cp src/App.jsx src/App-original.jsx
cp src/pages/ModelsPage.jsx src/pages/ModelsPage-original.jsx

# 2. 使用 Ant Design 版本
cp src/App-antd.jsx.example src/App.jsx
cp src/pages/ModelsPage-antd.jsx.example src/pages/ModelsPage.jsx
```

### 方式二：逐步迁移

保留现有代码，逐个页面迁移：
- 先迁移一个页面，测试无误后再迁移其他页面
- 可以同时保留两个版本，通过路由切换

## 🎨 Ant Design 优势

1. **开箱即用**：丰富的组件库，无需手写复杂组件
2. **企业级设计**：专业的 UI 设计规范
3. **响应式**：完美支持各种屏幕尺寸
4. **国际化**：内置中文支持
5. **表单验证**：强大的表单验证功能
6. **主题定制**：灵活的主题配置

## 📚 常用组件示例

### Table 表格

```jsx
<Table
  columns={columns}
  dataSource={data}
  loading={loading}
  rowKey="id"
  pagination={{ pageSize: 10 }}
/>
```

### Form 表单

```jsx
<Form form={form} onFinish={handleSubmit} layout="vertical">
  <Form.Item label="名称" name="name" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
  <Form.Item>
    <Button type="primary" htmlType="submit">提交</Button>
  </Form.Item>
</Form>
```

### Modal 模态框

```jsx
<Modal
  title="标题"
  open={visible}
  onCancel={() => setVisible(false)}
  footer={null}
>
  {/* 内容 */}
</Modal>
```

### Message 消息提示

```jsx
message.success('操作成功');
message.error('操作失败');
message.warning('警告信息');
```

## 🔗 相关资源

- [Ant Design 官方文档](https://ant.design/components/overview-cn/)
- [Ant Design Icons](https://ant.design/components/icon-cn/)
- [Form 表单示例](https://ant.design/components/form-cn/)
- [Table 表格示例](https://ant.design/components/table-cn/)

## ⚠️ 注意事项

1. Ant Design 6.x 使用了 CSS-in-JS，无需手动引入组件样式
2. 使用 `dayjs` 替代 `moment.js` 进行日期处理
3. 表单使用 `Form.useForm()` Hook 进行控制
4. 部分组件 API 在不同版本间可能有差异，请参考官方文档
