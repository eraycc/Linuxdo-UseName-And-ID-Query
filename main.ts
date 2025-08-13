import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.182.0/http/file_server.ts";

const PORT = 8000;

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // 处理 API 请求
  if (req.method === "POST" && url.pathname === "/api/user") {
    try {
      const formData = await req.formData();
      const username = formData.get("username")?.toString().trim();
      
      if (!username) {
        return new Response(
          JSON.stringify({ error: "请输入用户名" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 请求 LinuxDo API
      const apiUrl = `https://wiki.linux.do/api/users/${username}`;
      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": "https://wiki.linux.do/"
        }
      });
      
      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: "用户不存在或查询失败" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      
      let data = await response.json();
      if (!data.user) {
        return new Response(
          JSON.stringify({ error: "用户数据解析失败" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 处理头像 URL
      if (data.user.avatar_template) {
        data.user.avatar_url = 'https://linux.do' + 
          data.user.avatar_template.replace('{size}', '288');
      }
      
      // 处理其他图片 URL 和 bio_cooked 中的图片路径
      processImageUrls(data);
      
      return new Response(
        JSON.stringify(data),
        { headers: { "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: "服务器内部错误" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  
  // 静态文件服务
  return serveDir(req, {
    fsRoot: "static",
    urlRoot: "",
    showDirListing: false,
    enableCors: true
  });
}

// 递归处理图片 URL
function processImageUrls(obj: any) {
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (key === 'avatar_template' && typeof obj[key] === 'string') {
        obj['avatar_url'] = 'https://linux.do' + obj[key].replace('{size}', '288');
      }
      
      if (key === 'bio_cooked' && typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(
          'src="/images/', 
          'src="https://linux.do/images/'
        );
      }
      
      // 只处理以/uploads/开头且不包含https://的URL
      if (typeof obj[key] === 'string' && 
          obj[key].startsWith('/uploads/') && 
          !obj[key].includes('https://')) {
        obj[key] = 'https://linux.do' + obj[key];
      }
      
      if (typeof obj[key] === 'object') {
        processImageUrls(obj[key]);
      }
    }
  }
}

console.log(`Server running on http://localhost:${PORT}`);
serve(handleRequest, { port: PORT });
