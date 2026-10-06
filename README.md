# train-ticket-generator

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat-square&logo=vuedotjs&logoColor=4FC08D)

中国铁路火车票生成器。基于 [FoskyM/train-ticket-generator](https://github.com/FoskyM/train-ticket-generator) 二次创作。

## 新增功能

### 📄 上传 12306 电子发票 PDF，自动填充

页面顶部有蓝色「上传 12306 电子发票 PDF」按钮。选好 PDF 后，浏览器端用 [pdf.js](https://mozilla.github.io/pdf.js/) 解析，自动提取以下字段并填进表单：

- 出发站 / 到达站（自动去掉「站」字后缀）
- 车次（C/G/D/K/Z/T/Y 字头）
- 乘车日期与开车时间（自动排除「开票日期」）
- 车厢号与座位号（支持「加4车」这类临客车厢）
- 席别（二等座 / 一等座 / 新空调硬座 / 硬卧 / 软卧 等）
- 票价
- 乘客姓名
- 脱敏身份证号
- 电子客票号（写在票面底部）

解析过程完全在浏览器本地完成，PDF 不会上传到任何服务器。

> 首次打开需要联网从 jsdelivr CDN 拉取 pdf.js 的 CJK cmaps 字体映射，浏览器缓存后即可离线使用。

### 🔗 URL 批量生成模式

在地址后加 `?auto=<base64url 编码的 ticketInfo JSON>`，打开页面会自动填好字段并选中「蓝票(报销凭证)」类型，方便批量出图。

JSON 字段参考 `src/types.ts` 里的 `TicketData`。

## 开发

```bash
pnpm install
pnpm dev
```

构建：

```bash
pnpm build
```

产物在 `dist/`，`base: './'` 相对路径，双击 `dist/index.html` 即可打开，不需要本地服务器。

## 目前状态

- ✅ 蓝票（报销凭证）可生成
- ⏳ 其他票种（磁介质蓝票、红票、纸板票）仍是原项目的占位

## 许可证

AGPL-3.0，沿用原项目。
