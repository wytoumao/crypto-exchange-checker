# 🏦 Crypto Exchange Checker

交易所充值/提现状态查询工具

## 功能

- 输入币种，一键查看各交易所充提状态
- 链路级别的详细状态（每条链单独显示）
- 实时数据，60s 缓存

## 当前支持交易所

| 交易所   | 状态 |
|---------|------|
| Gate.io | ✅ 已接入 |
| Binance | 🔜 接入中 |
| OKX     | 🔜 接入中 |
| Bitget  | 🔜 接入中 |
| MEXC    | 🔜 接入中 |

## 本地开发

```bash
npm install
npm run dev
# 访问 http://localhost:3000
```

## 部署

推荐 Vercel，直接连接 GitHub repo 即可自动部署。

## 添加新交易所

在 `app/api/check/route.ts` 添加新的 `async function checkXXX()` 并接入 `Promise.all` 即可。
