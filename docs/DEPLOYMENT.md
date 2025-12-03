# 部署指南

本文档将指导你如何部署想法记录应用。

## 前置准备

1. **Supabase 账户**: 在 [supabase.com](https://supabase.com) 注册
2. **Vercel 账户**（可选）: 用于部署前端，在 [vercel.com](https://vercel.com) 注册
3. **GitHub 账户**: 用于代码托管

## 第一步：设置 Supabase

### 1. 创建新项目

1. 登录 Supabase Dashboard
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `idea-app` (或任意名称)
   - Database Password: 设置一个强密码
   - Region: 选择离你最近的区域
4. 等待项目创建完成（约 2 分钟）

### 2. 执行数据库 Schema

1. 在项目侧边栏找到 "SQL Editor"
2. 点击 "New Query"
3. 复制 `supabase/schema.sql` 文件的全部内容
4. 粘贴到编辑器中
5. 点击 "Run" 执行 SQL
6. 确认所有表、视图、触发器和策略都已创建

### 3. 获取 API 密钥

1. 在项目侧边栏找到 "Settings" > "API"
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`（很长的字符串）

### 4. 配置认证

1. 在侧边栏找到 "Authentication" > "Providers"
2. 启用 "Email" provider（默认已启用）
3. (可选) 配置其他登录方式（Google, GitHub 等）

## 第二步：本地开发测试

### 1. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

替换为你从 Supabase 获取的实际值。

### 2. 安装依赖并启动

```bash
npm install
npm run dev
```

访问 http://localhost:3000 测试应用。

### 3. 创建测试账户

1. 点击"注册"创建一个新账户
2. 验证邮箱（如果 Supabase 启用了邮箱验证）
3. 登录并测试功能

## 第三步：设置超级管理员

### 方法 1: 通过 Supabase Dashboard

1. 在 Supabase Dashboard 找到 "Table Editor"
2. 选择 `profiles` 表
3. 找到你的用户记录
4. 编辑 `role` 字段，将 `user` 改为 `super_admin`
5. 保存更改

### 方法 2: 通过 SQL

在 SQL Editor 中执行：

```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = 'your-user-id';
```

替换 `your-user-id` 为你的实际用户 ID（可以在 `profiles` 表中查看）。

## 第四步：部署到 Vercel

### 1. 准备代码

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. 在 Vercel 部署

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置项目：
   - Framework Preset: Next.js (自动检测)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. 配置环境变量

在 Vercel 项目设置中添加环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. 部署

点击 "Deploy"，等待部署完成（约 2-3 分钟）。

部署成功后，你会得到一个 URL，例如：`https://your-project.vercel.app`

## 第五步：后续配置

### 1. 配置 Supabase 回调 URL

1. 在 Supabase Dashboard 找到 "Authentication" > "URL Configuration"
2. 添加你的 Vercel URL 到 "Site URL"：
   ```
   https://your-project.vercel.app
   ```
3. 添加到 "Redirect URLs"：
   ```
   https://your-project.vercel.app/**
   ```

### 2. 配置自定义域名（可选）

在 Vercel 项目设置中：
1. 找到 "Domains"
2. 添加你的自定义域名
3. 配置 DNS 记录（按 Vercel 提示操作）

## 验证部署

访问你的部署 URL，测试以下功能：

- [ ] 用户注册和登录
- [ ] 发布想法
- [ ] 点赞和评论
- [ ] 编辑和删除想法
- [ ] 管理员面板访问（使用超级管理员账户）
- [ ] 个人资料修改

## 故障排查

### 问题：无法连接到 Supabase

**解决方案**：
- 检查环境变量是否正确设置
- 确认 Supabase 项目没有暂停（免费版不活跃会暂停）
- 查看浏览器控制台的错误信息

### 问题：登录后看不到用户信息

**解决方案**：
- 检查 `profiles` 表是否正确创建
- 确认触发器 `on_auth_user_created` 正常工作
- 手动在 `profiles` 表中添加用户记录

### 问题：管理员面板无法访问

**解决方案**：
- 确认用户的 `role` 字段设置为 `super_admin`
- 清除浏览器缓存并重新登录
- 检查 middleware 日志

### 问题：投票或评论功能不工作

**解决方案**：
- 检查 RLS 策略是否正确创建
- 在 Supabase Dashboard 查看表的 "Policies" 标签
- 确认用户已登录

## 性能优化建议

1. **启用 Supabase Realtime**（可选）:
   - 可以实现实时评论和投票更新
   - 在 Supabase Dashboard 的表设置中启用

2. **配置 CDN**:
   - Vercel 自动提供 CDN
   - 确保静态资源正确缓存

3. **数据库索引**:
   - Schema 已包含必要的索引
   - 根据实际使用情况添加更多索引

4. **图片优化**:
   - 使用 Supabase Storage 存储用户头像
   - 使用 Next.js Image 组件优化图片加载

## 监控和维护

### Supabase 监控

在 Supabase Dashboard 查看：
- Database: 监控数据库使用情况
- Auth: 查看用户注册趋势
- Logs: 检查错误日志

### Vercel 监控

在 Vercel Dashboard 查看：
- Analytics: 页面访问统计
- Speed Insights: 性能指标
- Logs: 应用日志

## 备份

### 数据库备份

Supabase 自动备份（Pro 计划）。免费计划建议：

1. 定期导出数据：
```sql
-- 在 SQL Editor 中执行
COPY (SELECT * FROM profiles) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM ideas) TO STDOUT WITH CSV HEADER;
```

2. 或使用 Supabase CLI:
```bash
supabase db dump -f backup.sql
```

### 代码备份

确保代码推送到 GitHub，并定期创建 release。

## 更新和升级

### 更新代码

```bash
git pull
npm install
npm run build
git push
```

Vercel 会自动部署新版本。

### 数据库迁移

如需修改数据库结构：

1. 在本地测试迁移 SQL
2. 在 Supabase SQL Editor 中谨慎执行
3. 考虑使用 Supabase Migration 工具

## 成本估算

### Supabase (免费计划)
- 500MB 数据库存储
- 2GB 文件存储
- 50,000 月活跃用户
- 每月 2GB 带宽

### Vercel (免费计划)
- 无限部署
- 100GB 带宽/月
- 每月 100 小时函数执行时间

对于中小型应用，免费计划足够使用。

## 支持

如遇到问题，请查看：
- Supabase 文档: https://supabase.com/docs
- Next.js 文档: https://nextjs.org/docs
- 项目 GitHub Issues

祝部署顺利！🚀

