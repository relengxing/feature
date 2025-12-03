# 构建问题解决方案

## 问题诊断

错误 `TypeError: g.default.createContext is not a function` 表明 **HeroUI (@heroui/react) 与 Next.js 16 的 Turbopack 构建系统不兼容**。

即使降级到 React 18，问题仍然存在，因为根本原因是 Next.js 16 的 Turbopack。

## 推荐解决方案（按优先级排序）

### 方案 1: 禁用 Turbopack（最简单，推荐）✅

Next.js 16 默认使用 Turbopack，但可以禁用它：

**步骤：**

1. 修改 `package.json` 中的构建脚本：
```json
{
  "scripts": {
    "dev": "next dev --turbopack=false",
    "build": "next build --turbopack=false",
    "start": "next start"
  }
}
```

2. 重新构建：
```bash
npm run build
```

**优点：**
- 简单快速
- 不需要降级 Next.js
- 保持所有现有代码不变

**缺点：**
- 构建速度可能稍慢（但对小项目影响不大）

---

### 方案 2: 降级到 Next.js 15 ✅

Next.js 15 使用稳定的 Webpack 构建系统，与 HeroUI 完全兼容。

**步骤：**

```bash
npm install next@15 eslint-config-next@15
npm run build
```

**优点：**
- 完全稳定
- 与所有 UI 库兼容
- 生产环境验证充分

**缺点：**
- 失去 Next.js 16 的新特性

---

### 方案 3: 更换 UI 库（如果前两个方案都不行）

使用官方的 NextUI 或其他与 Next.js 16 兼容的 UI 库：

**选项 A: NextUI（官方版本）**
```bash
npm uninstall @heroui/react
npm install @nextui-org/react @nextui-org/theme
```

**选项 B: Radix UI + Tailwind**
```bash
npm uninstall @heroui/react
npm install @radix-ui/react-* class-variance-authority
```

**选项 C: shadcn/ui**
```bash
npx shadcn-ui@latest init
```

---

### 方案 4: 等待 HeroUI 更新（不推荐）

等待 @heroui/react 发布支持 Next.js 16 Turbopack 的新版本。

**缺点：**
- 时间不确定
- 可能需要几周或几个月

---

## 快速测试步骤

### 测试方案 1（禁用 Turbopack）

```bash
# 1. 修改 package.json 的 build 脚本
npm run build

# 2. 如果成功，启动生产服务器
npm start
```

### 测试方案 2（降级 Next.js）

```bash
# 1. 降级 Next.js
npm install next@15 eslint-config-next@15

# 2. 重新构建
rm -rf .next
npm run build

# 3. 如果成功，启动
npm start
```

---

## 验证构建成功

构建成功后，你应该看到：

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    X kB
├ ○ /admin                               X kB
├ ○ /auth/login                          X kB
└ ○ /ideas/[id]                          X kB
```

---

## 生产部署建议

### Vercel 部署

如果使用方案 1（禁用 Turbopack），在 Vercel 项目设置中添加：

**Build Command:**
```bash
npm run build
```

这会自动使用你修改后的构建脚本。

### Docker 部署

如果使用 Docker，Dockerfile 示例：

```dockerfile
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 临时开发模式部署（不推荐用于生产）

如果所有方案都暂时无法解决，可以使用开发模式部署：

```json
{
  "scripts": {
    "start": "next dev --port 3000"
  }
}
```

**警告：** 开发模式性能差、资源占用高，仅用于临时测试。

---

## 推荐行动计划

1. **立即尝试方案 1**（5分钟）
   - 修改 package.json
   - 运行 `npm run build`
   - 如果成功，问题解决！

2. **如果方案 1 失败，尝试方案 2**（10分钟）
   - 降级到 Next.js 15
   - 重新构建
   - 这个方案成功率最高

3. **如果都失败，考虑方案 3**（1-2小时）
   - 更换 UI 库
   - 需要修改代码

---

## 联系支持

如果以上方案都无法解决，可能需要：

1. 在 HeroUI GitHub 提交 Issue
2. 在 Next.js GitHub 报告兼容性问题
3. 考虑使用更成熟的 UI 库

---

**最后更新**: 2025-12-02
**状态**: 待测试方案 1 或方案 2

