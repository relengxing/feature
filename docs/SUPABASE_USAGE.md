# Supabase 使用指南

## Schema 配置

本项目使用自定义 schema：`feature`

## 正确的查询方式

### ✅ 正确写法

使用 `.schema()` 方法（官方推荐）：

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 查询
const { data } = await supabase
  .schema('feature')
  .from('profiles')
  .select('*')

// 插入
const { data } = await supabase
  .schema('feature')
  .from('ideas')
  .insert({ title: '新想法', content: '内容' })

// 更新
const { data } = await supabase
  .schema('feature')
  .from('profiles')
  .update({ username: '新名字' })
  .eq('id', userId)

// 删除
const { data } = await supabase
  .schema('feature')
  .from('comments')
  .delete()
  .eq('id', commentId)
```

### ❌ 错误写法

**不要在表名中包含 schema 前缀**：

```typescript
// ❌ 错误
const { data } = await supabase
  .from('feature.profiles')  // 这样会出错
  .select('*')

// ❌ 错误
const { data } = await supabase
  .from('public.profiles')   // 也不要用 public
  .select('*')
```

## 常用查询示例

### 1. 查询用户资料

```typescript
const { data: profile } = await supabase
  .schema('feature')
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

### 2. 查询想法列表（带统计）

```typescript
const { data: ideas } = await supabase
  .schema('feature')
  .from('ideas_with_stats')
  .select('*')
  .eq('visibility', 'public')
  .order('created_at', { ascending: false })
```

### 3. 插入评论

```typescript
const { data: comment } = await supabase
  .schema('feature')
  .from('comments')
  .insert({
    idea_id: ideaId,
    user_id: userId,
    content: '评论内容',
    parent_id: null,
  })
  .select()
  .single()
```

### 4. 投票（Upsert）

```typescript
const { data } = await supabase
  .schema('feature')
  .from('idea_votes')
  .upsert(
    {
      idea_id: ideaId,
      user_id: userId,
      vote_type: 'up',
    },
    { onConflict: 'idea_id,user_id' }
  )
```

### 5. 关联查询

```typescript
const { data: comments } = await supabase
  .schema('feature')
  .from('comments')
  .select(`
    *,
    profiles:user_id (username, avatar)
  `)
  .eq('idea_id', ideaId)
  .order('created_at', { ascending: true })
```

## Server Components vs Client Components

### Server Component 示例

```typescript
// app/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .schema('feature')
    .from('ideas')
    .select('*')
  
  return <div>{/* 渲染数据 */}</div>
}
```

### Client Component 示例

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const [data, setData] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .schema('feature')
        .from('ideas')
        .select('*')
      
      setData(data || [])
    }
    loadData()
  }, [])
  
  return <div>{/* 渲染数据 */}</div>
}
```

## RLS（行级安全）策略

所有表都启用了 RLS，查询会自动应用安全策略：

- **profiles**: 所有人可读，用户只能更新自己的资料
- **ideas**: 公开想法所有人可见，私有想法只有作者可见
- **idea_votes**: 所有人可读，用户只能管理自己的投票
- **comments**: 公开想法的评论所有人可见

## 配置文件使用

项目提供了配置常量：

```typescript
import { SUPABASE_SCHEMA, TABLES, VIEWS } from '@/lib/supabase/config'

// 使用配置
const { data } = await supabase
  .schema(SUPABASE_SCHEMA)  // 'feature'
  .from(TABLES.PROFILES)     // 'profiles'
  .select('*')

// 查询视图
const { data } = await supabase
  .schema(SUPABASE_SCHEMA)
  .from(VIEWS.IDEAS_WITH_STATS)  // 'ideas_with_stats'
  .select('*')
```

## 常见错误处理

### 错误：找不到表

```
Error: Could not find the table 'public.feature.ideas' in the schema cache
```

**原因**：使用了错误的表名格式

**解决**：使用 `.schema('feature').from('ideas')` 而不是 `.from('feature.ideas')`

### 错误：权限拒绝

```
Error: permission denied for table profiles
```

**原因**：RLS 策略阻止了操作

**解决**：
1. 检查是否已登录
2. 确认 RLS 策略是否正确
3. 在 Supabase Dashboard 查看策略配置

### 错误：唯一约束冲突

```
Error: duplicate key value violates unique constraint
```

**原因**：尝试插入重复的唯一值

**解决**：
- 使用 `upsert` 代替 `insert`
- 检查是否已存在相同记录

## 性能优化建议

1. **只查询需要的字段**
   ```typescript
   .select('id, title, created_at')  // ✅ 好
   .select('*')                      // ⚠️ 避免不必要的字段
   ```

2. **使用视图进行复杂查询**
   ```typescript
   // ✅ 使用预定义的视图
   .schema('feature').from('ideas_with_stats')
   ```

3. **添加索引**（已在 schema.sql 中配置）
   - `user_id`, `created_at`, `updated_at` 等常用字段

4. **使用 `.single()` 获取单条记录**
   ```typescript
   const { data } = await supabase
     .schema('feature')
     .from('profiles')
     .select('*')
     .eq('id', userId)
     .single()  // 返回对象而不是数组
   ```

## 调试技巧

### 1. 查看生成的 SQL

在浏览器控制台中启用 Supabase 日志：

```typescript
const supabase = createClient()
// Supabase 会在控制台输出 SQL 查询
```

### 2. 使用 `.explain()` 分析查询

```typescript
const { data, error } = await supabase
  .schema('feature')
  .from('ideas')
  .select('*')
  .explain({ analyze: true })
```

### 3. 检查 RLS 策略

在 Supabase SQL Editor 中：

```sql
-- 查看所有策略
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'feature';
```

---

**参考资源**：
- [Supabase 官方文档](https://supabase.com/docs)
- [项目 Schema 文件](../supabase/schema.sql)
- [数据库类型定义](../types/database.types.ts)

