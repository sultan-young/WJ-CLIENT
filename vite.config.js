import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 允许局域网访问
    port: 5173, // 可以自定义端口号
    proxy: {
      "/api": {
        target: "http://192.168.1.4:5000", // 后端开发服务器地址
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "always", // 配置 math 解析模式
        modifyVars: {
          "primary-color": "#1890ff", // 修改变量
        },
      },
    },
  },
});
