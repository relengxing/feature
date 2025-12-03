# 想法记录应用

一个基于 Next.js、Supabase、HeroUI 和 Tailwind CSS 构建的现代化想法记录平台。

## 功能特性

### 用户功能
- ✅ 用户注册和登录
- ✅ 发布想法（支持 Markdown 格式）
- ✅ 想法状态管理（准备做、正在做、做完了、放弃了）
- ✅ 可见性控制（公开/私有）
- ✅ 点赞和点踩功能
- ✅ 嵌套评论系统（支持回复评论）
- ✅ 多种排序方式（发布时间、更新时间、点赞数、评论数）
- ✅ 个人资料编辑
- ✅ 查看自己的所有想法

### 管理员功能
- ✅ 超级管理员面板
- ✅ 系统统计概览
- ✅ 查看最近的想法和用户

## 技术栈

- **前端框架**: Next.js 15.1.3 (App Router)
- **UI 库**: HeroUI 2.8.5
- **样式**: Tailwind CSS 3
- **后端**: Supabase (PostgreSQL + Auth + RLS)
- **语言**: TypeScript
- **React**: 18.3.1
- **Markdown 渲染**: react-markdown
- **日期处理**: date-fns
- **图标**: lucide-react

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd feature
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件（参考 `.env.example`）：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. 设置 Supabase 数据库

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中执行 `supabase/schema.sql` 文件中的 SQL 语句
3. 这将创建：
   - `feature` schema（自定义 schema）
   - 所需的表、视图、触发器和 RLS 策略

**注意**：本项目使用 `feature` schema 而非默认的 `public` schema。

### 5. 创建超级管理员

首次部署后，你需要手动将某个用户设置为超级管理员：

1. 注册一个账户
2. 在 Supabase Dashboard 的 Table Editor 中找到 `profiles` 表
3. 找到你的用户记录，将 `role` 字段从 `user` 改为 `super_admin`

### 6. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
├── app/                      # Next.js App Router 页面
│   ├── admin/               # 管理员面板
│   ├── auth/                # 认证页面（登录/注册）
│   ├── ideas/               # 想法相关页面
│   ├── profile/             # 个人资料页面
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   └── providers.tsx        # 全局 Providers
├── components/              # React 组件
│   ├── comment-section.tsx  # 评论组件
│   ├── idea-actions.tsx     # 想法操作组件
│   ├── idea-card.tsx        # 想法卡片
│   ├── markdown-renderer.tsx # Markdown 渲染器
│   ├── navbar.tsx           # 导航栏
│   ├── status-badge.tsx     # 状态徽章
│   └── vote-buttons.tsx     # 投票按钮
├── lib/                     # 工具库
│   ├── supabase/            # Supabase 客户端
│   └── utils.ts             # 工具函数
├── types/                   # TypeScript 类型定义
│   └── database.types.ts    # 数据库类型
├── supabase/                # Supabase 配置
│   └── schema.sql           # 数据库模式
├── middleware.ts            # Next.js 中间件（路由保护）
└── tailwind.config.ts       # Tailwind 配置
```

## 数据库模式

### Schema 结构

**使用自定义 schema**: `feature`

### 主要表

- **feature.profiles**: 用户资料（扩展 auth.users）
- **feature.ideas**: 想法内容
- **feature.idea_votes**: 投票记录
- **feature.comments**: 评论（支持嵌套）

### 视图

- **feature.ideas_with_stats**: 包含统计信息的想法视图（点赞数、评论数等）

### 安全策略

所有表都启用了行级安全策略（RLS），确保：
- 用户只能编辑自己的内容
- 私有想法只有作者可见
- 公开内容所有人可见

## 部署

### 构建项目

```bash
# 本地构建测试
npm run build

# 启动生产服务器
npm start
```

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署（自动检测 Next.js 配置）

### Docker 部署

参考 `SOLUTION_FINAL.md` 中的 Docker 配置。

### 其他平台

本项目是标准的 Next.js 应用，可以部署到任何支持 Node.js 的平台。

**注意**: 项目使用 Next.js 15.1.3 以确保与 HeroUI 的兼容性。

## 开发指南

### 添加新功能

1. 如需数据库更改，更新 `supabase/schema.sql`
2. 更新 `types/database.types.ts` 中的类型定义
3. 创建或修改组件和页面
4. 确保遵循 RLS 策略

### 代码风格

- 使用 TypeScript 进行类型安全
- 组件使用 Server Components（除非需要客户端交互）
- 遵循 Next.js 13+ App Router 最佳实践

## 常见问题

**Q: 如何更改用户角色？**
A: 在 Supabase Dashboard 的 `profiles` 表中手动修改 `role` 字段。

**Q: 为什么看不到管理员面板？**
A: 确保你的用户 `role` 设置为 `super_admin`。

**Q: 如何自定义状态选项？**
A: 修改 `lib/utils.ts` 中的 `STATUS_LABELS` 和 `STATUS_COLORS`，同时更新数据库约束。

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
