# 伺服器部署資訊

## 連接資訊

| 項目 | 值 |
|------|-----|
| IP | 43.163.86.163 |
| 域名 | https://wellpoc.limelink.cc |
| SSH 用戶 | ubuntu |
| SSH 密碼 | JHGJ12676111. |

## 部署路徑

```
/home/ubuntu/wellfinancepoc/
├── dist/           # 構建輸出目錄 (Nginx 根目錄)
├── src/            # 源代碼
├── nginx.conf      # Nginx 配置
└── ...
```

## 快速部署指令

```bash
ssh ubuntu@43.163.86.163
cd /home/ubuntu/wellfinancepoc
git pull origin main
sudo rm -rf dist
npx expo export --platform web
sudo systemctl reload nginx
```

## Nginx 狀態檢查

```bash
sudo nginx -t
sudo lsof -i :80
sudo lsof -i :443
```
