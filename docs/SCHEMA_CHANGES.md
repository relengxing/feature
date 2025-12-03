# Schema 变更说明

## 使用自定义 Schema

本项目使用 `feature` schema 而非默认的 `public` schema。

## 数据库结构

### Schema
```
feature/
├── tables/
│   ├── profiles
│   ├── ideas
│   ├── idea_votes
│   └── comments
└── views/
    └── ideas_with_stats
```

### 表结构

#### feature.profiles
用户资料表（扩展 auth.users）

#### feature.ideas
想法内容表

#### feature.idea_votes
投票记录表

#### feature.comments
评论表（支持嵌套）

### 视图

#### feature.ideas_with_stats
包含统计信息的想法视图

## 设置步骤

### 1. 执行 SQL
在 Supabase SQL Editor 中执行 `supabase/schema.sql`

### 2. 设置超级管理员
```sql
UPDATE feature.profiles 
SET role = 'super_admin' 
WHERE id = 'your-user-id';
```

### 3. 验证
```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'feature';

-- 查看所有视图
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'feature';
```

## 为什么使用自定义 Schema？

1. **命名空间隔离**: 避免与其他功能的表名冲突
2. **更好的组织**: 相关表集中在一个 schema 下
3. **权限管理**: 可以在 schema 级别设置权限
4. **开发灵活性**: 方便后续扩展和管理

## 代码中的使用

所有 Supabase 查询都已更新为使用 `.schema()` 方法：

```typescript
// ✅ 正确的查询方式
const { data } = await supabase
  .schema('feature')
  .from('profiles')
  .select('*')

// 其他表的查询示例
supabase.schema('feature').from('ideas')...
supabase.schema('feature').from('idea_votes')...
supabase.schema('feature').from('comments')...
supabase.schema('feature').from('ideas_with_stats')...
```

**重要**：
- 必须在 `.from()` 之前调用 `.schema()`
- 不需要在表名中包含 schema 前缀
- 这是 Supabase 官方推荐的方法

## 迁移指南

如果你已经有使用 `public` schema 的数据，可以使用以下 SQL 迁移：

```sql
-- 创建 feature schema
CREATE SCHEMA IF NOT EXISTS feature;

-- 迁移表（示例）
ALTER TABLE public.profiles SET SCHEMA feature;
ALTER TABLE public.ideas SET SCHEMA feature;
ALTER TABLE public.idea_votes SET SCHEMA feature;
ALTER TABLE public.comments SET SCHEMA feature;

-- 迁移视图（需要重新创建）
DROP VIEW IF EXISTS public.ideas_with_stats;
-- 然后执行 schema.sql 中的视图创建语句
```

**注意**: 迁移前请备份数据！

