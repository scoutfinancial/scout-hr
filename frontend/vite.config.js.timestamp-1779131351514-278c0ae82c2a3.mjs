// vite.config.js
import { defineConfig } from "file:///C:/Users/DELL/scout-hr/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/DELL/scout-hr/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/DELL/scout-hr/frontend/node_modules/vite-plugin-pwa/dist/index.js";
import frappeui from "file:///C:/Users/DELL/scout-hr/frontend/node_modules/frappe-ui/vite.js";
import path from "path";
import fs from "fs";
var __vite_injected_original_dirname = "C:\\Users\\DELL\\scout-hr\\frontend";
var vite_config_default = defineConfig({
  server: {
    port: 8080,
    proxy: getProxyOptions(),
    allowedHosts: true
  },
  plugins: [
    vue(),
    frappeui(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest",
      injectRegister: null,
      devOptions: {
        enabled: true
      },
      manifest: {
        display: "standalone",
        name: "Frappe HR",
        short_name: "Frappe HR",
        start_url: "/hrms",
        description: "Everyday HR & Payroll operations at your fingertips",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/assets/hrms/manifest/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/assets/hrms/manifest/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/assets/hrms/manifest/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/assets/hrms/manifest/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  },
  build: {
    outDir: "../hrms/public/frontend",
    emptyOutDir: true,
    target: "es2015",
    commonjsOptions: {
      include: [/tailwind.config.js/, /node_modules/]
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "frappe-ui": ["frappe-ui"]
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      "frappe-ui > feather-icons",
      "showdown",
      "tailwind.config.js",
      "engine.io-client"
    ]
  }
});
function getProxyOptions() {
  const config = getCommonSiteConfig();
  const webserver_port = config ? config.webserver_port : 8e3;
  if (!config) {
    console.log("No common_site_config.json found, using default port 8000");
  }
  return {
    "^/(app|login|api|assets|files|private)": {
      target: `http://127.0.0.1:${webserver_port}`,
      ws: true,
      router: function(req) {
        const site_name = req.headers.host.split(":")[0];
        console.log(`Proxying ${req.url} to ${site_name}:${webserver_port}`);
        return `http://${site_name}:${webserver_port}`;
      }
    }
  };
}
function getCommonSiteConfig() {
  let currentDir = path.resolve(".");
  while (currentDir !== "/") {
    if (fs.existsSync(path.join(currentDir, "sites")) && fs.existsSync(path.join(currentDir, "apps"))) {
      let configPath = path.join(currentDir, "sites", "common_site_config.json");
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath));
      }
      return null;
    }
    currentDir = path.resolve(currentDir, "..");
  }
  return null;
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxERUxMXFxcXHNjb3V0LWhyXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxERUxMXFxcXHNjb3V0LWhyXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9ERUxML3Njb3V0LWhyL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIlxyXG5pbXBvcnQgdnVlIGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWVcIlxyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSBcInZpdGUtcGx1Z2luLXB3YVwiXHJcbmltcG9ydCBmcmFwcGV1aSBmcm9tIFwiZnJhcHBlLXVpL3ZpdGVcIlxyXG5cclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIlxyXG5pbXBvcnQgZnMgZnJvbSBcImZzXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcblx0c2VydmVyOiB7XHJcblx0XHRwb3J0OiA4MDgwLFxyXG5cdFx0cHJveHk6IGdldFByb3h5T3B0aW9ucygpLFxyXG5cdFx0YWxsb3dlZEhvc3RzOiB0cnVlLFxyXG5cdH0sXHJcblx0cGx1Z2luczogW1xyXG5cdFx0dnVlKCksXHJcblx0XHRmcmFwcGV1aSgpLFxyXG5cdFx0Vml0ZVBXQSh7XHJcblx0XHRcdHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXHJcblx0XHRcdHN0cmF0ZWdpZXM6IFwiaW5qZWN0TWFuaWZlc3RcIixcclxuXHRcdFx0aW5qZWN0UmVnaXN0ZXI6IG51bGwsXHJcblx0XHRcdGRldk9wdGlvbnM6IHtcclxuXHRcdFx0XHRlbmFibGVkOiB0cnVlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRtYW5pZmVzdDoge1xyXG5cdFx0XHRcdGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxyXG5cdFx0XHRcdG5hbWU6IFwiRnJhcHBlIEhSXCIsXHJcblx0XHRcdFx0c2hvcnRfbmFtZTogXCJGcmFwcGUgSFJcIixcclxuXHRcdFx0XHRzdGFydF91cmw6IFwiL2hybXNcIixcclxuXHRcdFx0XHRkZXNjcmlwdGlvbjogXCJFdmVyeWRheSBIUiAmIFBheXJvbGwgb3BlcmF0aW9ucyBhdCB5b3VyIGZpbmdlcnRpcHNcIixcclxuXHRcdFx0XHR0aGVtZV9jb2xvcjogXCIjZmZmZmZmXCIsXHJcblx0XHRcdFx0aWNvbnM6IFtcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0c3JjOiBcIi9hc3NldHMvaHJtcy9tYW5pZmVzdC9tYW5pZmVzdC1pY29uLTE5Mi5tYXNrYWJsZS5wbmdcIixcclxuXHRcdFx0XHRcdFx0c2l6ZXM6IFwiMTkyeDE5MlwiLFxyXG5cdFx0XHRcdFx0XHR0eXBlOiBcImltYWdlL3BuZ1wiLFxyXG5cdFx0XHRcdFx0XHRwdXJwb3NlOiBcImFueVwiLFxyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0c3JjOiBcIi9hc3NldHMvaHJtcy9tYW5pZmVzdC9tYW5pZmVzdC1pY29uLTE5Mi5tYXNrYWJsZS5wbmdcIixcclxuXHRcdFx0XHRcdFx0c2l6ZXM6IFwiMTkyeDE5MlwiLFxyXG5cdFx0XHRcdFx0XHR0eXBlOiBcImltYWdlL3BuZ1wiLFxyXG5cdFx0XHRcdFx0XHRwdXJwb3NlOiBcIm1hc2thYmxlXCIsXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRzcmM6IFwiL2Fzc2V0cy9ocm1zL21hbmlmZXN0L21hbmlmZXN0LWljb24tNTEyLm1hc2thYmxlLnBuZ1wiLFxyXG5cdFx0XHRcdFx0XHRzaXplczogXCI1MTJ4NTEyXCIsXHJcblx0XHRcdFx0XHRcdHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcblx0XHRcdFx0XHRcdHB1cnBvc2U6IFwiYW55XCIsXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRzcmM6IFwiL2Fzc2V0cy9ocm1zL21hbmlmZXN0L21hbmlmZXN0LWljb24tNTEyLm1hc2thYmxlLnBuZ1wiLFxyXG5cdFx0XHRcdFx0XHRzaXplczogXCI1MTJ4NTEyXCIsXHJcblx0XHRcdFx0XHRcdHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcblx0XHRcdFx0XHRcdHB1cnBvc2U6IFwibWFza2FibGVcIixcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XSxcclxuXHRcdFx0fSxcclxuXHRcdH0pLFxyXG5cdF0sXHJcblx0cmVzb2x2ZToge1xyXG5cdFx0YWxpYXM6IHtcclxuXHRcdFx0XCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxyXG5cdFx0fSxcclxuXHR9LFxyXG5cdGJ1aWxkOiB7XHJcblx0XHRvdXREaXI6IFwiLi4vaHJtcy9wdWJsaWMvZnJvbnRlbmRcIixcclxuXHRcdGVtcHR5T3V0RGlyOiB0cnVlLFxyXG5cdFx0dGFyZ2V0OiBcImVzMjAxNVwiLFxyXG5cdFx0Y29tbW9uanNPcHRpb25zOiB7XHJcblx0XHRcdGluY2x1ZGU6IFsvdGFpbHdpbmQuY29uZmlnLmpzLywgL25vZGVfbW9kdWxlcy9dLFxyXG5cdFx0fSxcclxuXHRcdHNvdXJjZW1hcDogdHJ1ZSxcclxuXHRcdHJvbGx1cE9wdGlvbnM6IHtcclxuXHRcdFx0b3V0cHV0OiB7XHJcblx0XHRcdFx0bWFudWFsQ2h1bmtzOiB7XHJcblx0XHRcdFx0XHRcImZyYXBwZS11aVwiOiBbXCJmcmFwcGUtdWlcIl0sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSxcclxuXHRcdH0sXHJcblx0fSxcclxuXHRvcHRpbWl6ZURlcHM6IHtcclxuXHRcdGluY2x1ZGU6IFtcclxuXHRcdFx0XCJmcmFwcGUtdWkgPiBmZWF0aGVyLWljb25zXCIsXHJcblx0XHRcdFwic2hvd2Rvd25cIixcclxuXHRcdFx0XCJ0YWlsd2luZC5jb25maWcuanNcIixcclxuXHRcdFx0XCJlbmdpbmUuaW8tY2xpZW50XCIsXHJcblx0XHRdLFxyXG5cdH0sXHJcbn0pXHJcblxyXG5mdW5jdGlvbiBnZXRQcm94eU9wdGlvbnMoKSB7XHJcblx0Y29uc3QgY29uZmlnID0gZ2V0Q29tbW9uU2l0ZUNvbmZpZygpXHJcblx0Y29uc3Qgd2Vic2VydmVyX3BvcnQgPSBjb25maWcgPyBjb25maWcud2Vic2VydmVyX3BvcnQgOiA4MDAwXHJcblx0aWYgKCFjb25maWcpIHtcclxuXHRcdGNvbnNvbGUubG9nKFwiTm8gY29tbW9uX3NpdGVfY29uZmlnLmpzb24gZm91bmQsIHVzaW5nIGRlZmF1bHQgcG9ydCA4MDAwXCIpXHJcblx0fVxyXG5cdHJldHVybiB7XHJcblx0XHRcIl4vKGFwcHxsb2dpbnxhcGl8YXNzZXRzfGZpbGVzfHByaXZhdGUpXCI6IHtcclxuXHRcdFx0dGFyZ2V0OiBgaHR0cDovLzEyNy4wLjAuMToke3dlYnNlcnZlcl9wb3J0fWAsXHJcblx0XHRcdHdzOiB0cnVlLFxyXG5cdFx0XHRyb3V0ZXI6IGZ1bmN0aW9uIChyZXEpIHtcclxuXHRcdFx0XHRjb25zdCBzaXRlX25hbWUgPSByZXEuaGVhZGVycy5ob3N0LnNwbGl0KFwiOlwiKVswXVxyXG5cdFx0XHRcdGNvbnNvbGUubG9nKGBQcm94eWluZyAke3JlcS51cmx9IHRvICR7c2l0ZV9uYW1lfToke3dlYnNlcnZlcl9wb3J0fWApXHJcblx0XHRcdFx0cmV0dXJuIGBodHRwOi8vJHtzaXRlX25hbWV9OiR7d2Vic2VydmVyX3BvcnR9YFxyXG5cdFx0XHR9LFxyXG5cdFx0fSxcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENvbW1vblNpdGVDb25maWcoKSB7XHJcblx0bGV0IGN1cnJlbnREaXIgPSBwYXRoLnJlc29sdmUoXCIuXCIpXHJcblx0Ly8gdHJhdmVyc2UgdXAgdGlsbCB3ZSBmaW5kIGZyYXBwZS1iZW5jaCB3aXRoIHNpdGVzIGRpcmVjdG9yeVxyXG5cdHdoaWxlIChjdXJyZW50RGlyICE9PSBcIi9cIikge1xyXG5cdFx0aWYgKFxyXG5cdFx0XHRmcy5leGlzdHNTeW5jKHBhdGguam9pbihjdXJyZW50RGlyLCBcInNpdGVzXCIpKSAmJlxyXG5cdFx0XHRmcy5leGlzdHNTeW5jKHBhdGguam9pbihjdXJyZW50RGlyLCBcImFwcHNcIikpXHJcblx0XHQpIHtcclxuXHRcdFx0bGV0IGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4oY3VycmVudERpciwgXCJzaXRlc1wiLCBcImNvbW1vbl9zaXRlX2NvbmZpZy5qc29uXCIpXHJcblx0XHRcdGlmIChmcy5leGlzdHNTeW5jKGNvbmZpZ1BhdGgpKSB7XHJcblx0XHRcdFx0cmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGgpKVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblx0XHRjdXJyZW50RGlyID0gcGF0aC5yZXNvbHZlKGN1cnJlbnREaXIsIFwiLi5cIilcclxuXHR9XHJcblx0cmV0dXJuIG51bGxcclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlSLFNBQVMsb0JBQW9CO0FBQ3RULE9BQU8sU0FBUztBQUNoQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxjQUFjO0FBRXJCLE9BQU8sVUFBVTtBQUNqQixPQUFPLFFBQVE7QUFOZixJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixRQUFRO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixPQUFPLGdCQUFnQjtBQUFBLElBQ3ZCLGNBQWM7QUFBQSxFQUNmO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUixJQUFJO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsTUFDUCxjQUFjO0FBQUEsTUFDZCxZQUFZO0FBQUEsTUFD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
