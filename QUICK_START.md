# 快速开始指南

## 📦 项目结构

```
想法记录应用/
├── 📁 app/              # Next.js 页面
├── 📁 components/       # React 组件
├── 📁 docs/            # 📚 所有项目文档
├── 📁 lib/             # 工具库和配置
├── 📁 supabase/        # 数据库 Schema
├── 📁 types/           # TypeScript 类型
├── README.md           # 项目主文档
├── CHANGELOG.md        # 变更日志
└── QUICK_START.md      # 本文件
```

## 🚀 5 分钟快速开始

### 1. 克隆并安装依赖
```bash
cd /your/project/path
npm install
```

### 2. 配置 Supabase
1. 在 [Supabase](https://supabase.com) 创建项目
2. 复制项目 URL 和 Anon Key
3. 创建 `.env.local`：
```env
NEXT_PUBLIC_SUPABASE_URL=你的URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Key
```

### 3. 设置数据库
在 Supabase SQL Editor 中执行：
```bash
# 复制 supabase/schema.sql 的全部内容并执行
```

### 4. 启动开发服务器
```bash
npm run dev
# 访问 http://localhost:3000
```

### 5. 创建超级管理员
注册第一个账户后，在 Supabase SQL Editor 执行：
```sql
UPDATE feature.profiles 
SET role = 'super_admin' 
WHERE id = '你的用户ID';
```

## 📖 详细文档

所有文档位于 `docs/` 目录：

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目概览和完整说明 |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 部署指南（Vercel/Docker） |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | 用户使用手册 |
| [docs/SCHEMA_CHANGES.md](docs/SCHEMA_CHANGES.md) | 数据库 Schema 说明 |
| [docs/DEVELOPMENT_STATUS.md](docs/DEVELOPMENT_STATUS.md) | 开发状态和功能清单 |
| [docs/SOLUTION_FINAL.md](docs/SOLUTION_FINAL.md) | 技术问题解决方案 |
| [CHANGELOG.md](CHANGELOG.md) | 变更日志 |

## 🎯 核心功能

- ✅ 用户注册/登录
- ✅ 发布想法（Markdown 支持）
- ✅ 点赞/点踩
- ✅ 嵌套评论（3层）
- ✅ 管理员面板
- ✅ 个人中心
- ✅ 响应式设计

## 🛠️ 技术栈

- **框架**: Next.js 15.1.3
- **UI**: HeroUI 2.8.5
- **数据库**: Supabase (PostgreSQL)
- **样式**: Tailwind CSS 3
- **语言**: TypeScript

## 📊 数据库 Schema

本项目使用 **`feature` schema**（而非 `public`）

主要表：
- `feature.profiles` - 用户资料
- `feature.ideas` - 想法内容
- `feature.idea_votes` - 投票
- `feature.comments` - 评论

## 🔧 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm start            # 启动生产服务器
npm run lint         # 代码检查
npm run type-check   # 类型检查
```

## 🐛 故障排查

### 构建失败
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### 数据库连接问题
1. 检查 `.env.local` 配置
2. 确认 Supabase 项目未暂停
3. 验证 SQL Schema 已正确执行

### 权限问题
确保在 `feature.profiles` 表中设置了正确的 `role`

## 📝 下一步

1. **阅读文档**: 查看 `docs/` 目录了解详细信息
2. **自定义配置**: 修改样式、功能等
3. **部署**: 参考 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
4. **反馈**: 提交 Issue 或 Pull Request

## 💡 提示

- 首次运行请确保先执行数据库 Schema
- 开发模式下有热重载
- 生产部署前请运行 `npm run build` 测试
- 使用 `feature` schema 而非 `public`

## 🆘 获取帮助

- 查看 [docs/USER_GUIDE.md](docs/USER_GUIDE.md) 了解使用方法
- 查看 [docs/SOLUTION_FINAL.md](docs/SOLUTION_FINAL.md) 了解技术细节
- 在 GitHub 提交 Issue

---

**准备好了吗？运行 `npm run dev` 开始吧！** 🚀

