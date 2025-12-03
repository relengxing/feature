# 变更日志

## [最新] - 2025-12-02

### 🐛 Bug 修复
- **修复 Schema 查询错误**: 使用正确的 `.schema('feature').from('table')` 方法
  - 之前错误：`.from('feature.profiles')`
  - 现在正确：`.schema('feature').from('profiles')`
- 修复首页排序选择器的 Server Component 错误
- 将 Select 下拉菜单改为链接按钮，避免事件处理器问题
- 优化用户体验，排序切换更直观

### 💡 技术改进
- 使用 Supabase 官方推荐的 `.schema()` 方法
- 更新所有数据库查询代码（13个文件）
- 更新配置文件和文档

---

## [1.0.1] - 2025-12-02

### 🗂️ 文档结构优化
- 创建 `docs/` 文件夹统一管理所有文档
- 移动以下文档到 `docs/` 目录：
  - `DEPLOYMENT.md` - 部署指南
  - `USER_GUIDE.md` - 用户使用指南
  - `DEVELOPMENT_STATUS.md` - 开发状态
  - `SOLUTION.md` - 问题解决方案
  - `SOLUTION_FINAL.md` - 最终解决方案
  - `SCHEMA_CHANGES.md` - Schema 变更说明（新增）
- `README.md` 保留在根目录作为项目入口文档

### 🗄️ 数据库 Schema 变更
- **重大变更**: 从 `public` schema 迁移到 `feature` schema
- 所有数据库对象现在位于 `feature` schema 下：
  - `feature.profiles`
  - `feature.ideas`
  - `feature.idea_votes`
  - `feature.comments`
  - `feature.ideas_with_stats`（视图）

### 💻 代码更新
- 更新所有 Supabase 查询以使用 `feature` schema
- 更新 TypeScript 类型定义 (`types/database.types.ts`)
- 创建 Supabase 配置文件 (`lib/supabase/config.ts`)
- 批量更新以下文件：
  - 所有 `app/` 目录下的页面
  - 所有 `components/` 目录下的组件
  - `lib/supabase/middleware.ts`

### 📝 文档更新
- 更新 `README.md` 说明自定义 schema
- 新增 `docs/SCHEMA_CHANGES.md` 详细说明 schema 变更
- 更新所有相关文档中的 SQL 示例

### ✅ 验证
- ✅ 构建成功 (`npm run build`)
- ✅ 所有页面正常生成
- ✅ TypeScript 类型检查通过

---

## [1.0.0] - 2025-12-02

### 🎉 初始版本发布

#### ✅ 完整功能
- 用户认证系统（注册/登录）
- 想法管理（CRUD + Markdown 支持）
- 点赞/点踩系统
- 嵌套评论系统（支持 3 层）
- 管理员面板
- 个人中心
- 权限控制（超级管理员）
- 响应式设计

#### 🛠️ 技术栈
- Next.js 15.1.3
- React 18.3.1
- HeroUI 2.8.5
- Tailwind CSS 3
- Supabase
- TypeScript

#### 🐛 问题修复
- 解决 Next.js 16 与 HeroUI 的兼容性问题
- 降级到 Next.js 15 确保稳定性

---

## 文件结构

```
想法记录应用/
├── app/                    # Next.js 页面
├── components/             # React 组件
├── docs/                   # 📁 文档目录（新增）
│   ├── DEPLOYMENT.md
│   ├── USER_GUIDE.md
│   ├── DEVELOPMENT_STATUS.md
│   ├── SOLUTION.md
│   ├── SOLUTION_FINAL.md
│   └── SCHEMA_CHANGES.md
├── lib/                    # 工具库
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       ├── middleware.ts
│       └── config.ts       # 新增
├── supabase/
│   └── schema.sql          # 更新为 feature schema
├── types/
│   └── database.types.ts   # 更新类型定义
├── README.md               # 项目入口文档
└── CHANGELOG.md            # 本文件
```

---

## 升级指南

### 从 public schema 迁移到 feature schema

如果你已有使用 `public` schema 的数据库：

```sql
-- 1. 创建 feature schema
CREATE SCHEMA IF NOT EXISTS feature;

-- 2. 迁移表
ALTER TABLE public.profiles SET SCHEMA feature;
ALTER TABLE public.ideas SET SCHEMA feature;
ALTER TABLE public.idea_votes SET SCHEMA feature;
ALTER TABLE public.comments SET SCHEMA feature;

-- 3. 删除旧视图并重新创建
DROP VIEW IF EXISTS public.ideas_with_stats;
-- 执行 supabase/schema.sql 中的视图创建部分
```

### 全新安装

直接执行 `supabase/schema.sql` 即可，所有对象会自动创建在 `feature` schema 下。

---

## 下一步计划

- [ ] 添加搜索功能
- [ ] 添加标签系统
- [ ] 实现通知功能
- [ ] 支持图片上传
- [ ] PWA 支持
- [ ] 性能优化（分页、缓存）

