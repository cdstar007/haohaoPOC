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
├── dist/              # 構建輸出目錄 (Nginx 根目錄)
├── src/               # 源代碼
├── webhook-server.js  # GitHub Webhook 服務
├── nginx.conf         # Nginx 配置
└── ...
```

## 自動部署 (GitHub Webhook)

已配置 GitHub Webhook，推送代碼到 main 分支後會自動部署。

### Webhook 配置

- **Webhook URL**: `https://wellpoc.limelink.cc/webhook`
- **Content type**: `application/json`
- **Events**: Push events

### 服務管理

```bash
# 查看 webhook 服務狀態
sudo systemctl status webhook

# 查看 webhook 日誌
sudo journalctl -u webhook -f

# 重啟 webhook 服務
sudo systemctl restart webhook
```

## 手動部署指令

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
sudo systemctl status nginx
```
