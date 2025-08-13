# Linuxdo-UseName-And-ID-Query
linuxdo社区通过id查询，username查询用户信息

## 部署

```bash
deno run --allow-net --allow-read main.ts
```

打开浏览器访问 `http://localhost:8000`

## 主要说明

1. **后端处理**：
   - 使用 Deno 的 `serve` 函数创建 HTTP 服务器
   - 使用 `fetch` API 请求数据
   - 实现图片 URL 处理逻辑
   - 使用 TypeScript 增强了类型安全

2. **更新调整**：
   - 更新了年份显示逻辑

3. **部署**：
   - 使用 Deno 内置的静态文件服务
   - 需要 `--allow-net` 和 `--allow-read` 权限
