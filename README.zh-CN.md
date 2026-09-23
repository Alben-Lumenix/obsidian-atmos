# Atmos

[English](./README.md) | 简体中文

Atmos 是一个 Obsidian 天气插件：为选定地点获取实时天气，并在当前编辑器的光标处插入简短的 Markdown 摘要。插件使用你自己的和风天气 API Host 与 API Key。目前插件界面和插入的天气文字为中文。

## 功能

- 搜索中国大陆城市或区县并选择结果，也可以手动填写经纬度及可选的地点名称。
- 读取已保存地点的实时天气，测试凭据和连接。
- 在笔记中插入天气状况和温度；接口提供体感温度、湿度时也会显示，并附上和风天气来源说明。

## 安装

Atmos 目前尚未通过 Obsidian 社区插件目录分发。手动安装步骤：

1. 安装 [Node.js](https://nodejs.org/)，在本仓库运行 `npm install` 和 `npm run build`。
2. 在你的笔记库中创建 `.obsidian/plugins/atmos/`，将 `manifest.json` 和构建生成的 `main.js` 复制进去。
3. 在 Obsidian 中打开“设置 → 第三方插件”，按需启用第三方插件，再启用 Atmos。

`manifest.json` 要求 Obsidian 1.5.0 或更新版本，且未将插件标为仅桌面端。移动端实际使用尚未验证。

## 开始使用

1. 在[和风天气开发者平台](https://dev.qweather.com/)创建项目和 **API KEY** 类型凭据，再从控制台设置中找到你专属的 **API Host**。两者需要分别填写。
2. 在 Obsidian 中打开“设置 → Atmos 天气”，输入 API Host 与 API Key。
3. 搜索中国大陆城市或区县并选择结果；也可以填写纬度、经度和可选的地点名称，点击“保存坐标”。
4. 点击“测试”。成功后打开一篇笔记，在命令面板中执行“Atmos: 插入当前天气”。

## 配置

| 设置 | 作用 |
| --- | --- |
| API Host | 和风天气分配的专属 API 域名，例如 `abcxyz.qweatherapi.com`。也可填写不带路径的 HTTPS URL；不能包含端口、路径或查询参数。 |
| API Key | 请求天气数据时使用的和风天气 API KEY 凭据。 |
| 地点 | 保存一个搜索结果或手动坐标。纬度范围为 −90～90，经度范围为 −180～180。手动地点名称可留空，此时显示坐标。 |

搜索范围限定中国大陆，最多返回十个结果。搜索和天气请求均要求和风天气返回中文内容。插件当前没有单位或输出格式设置。

## 隐私

Atmos 将 API Host、API Key 和已选地点保存在 Obsidian 插件的 `data.json` 中。根据笔记库的同步设置，该文件可能被同步；不要分享或提交到仓库。插件通过 Obsidian 的网络请求接口，将搜索文字、地点坐标和 API Key 发送给和风天气；不会向和风天气发送笔记内容。

## 当前范围

Atmos 目前只请求实时天气。设备或 IP 自动定位、天气预报、预警、缓存和自定义输出模板均未实现。尚未验证在真实 Obsidian 笔记库中加载和在移动端使用。

## 开发

安装 Node.js 和 npm 后运行：

```sh
npm install
npm run check
npm run build
```

`npm run check` 检查 TypeScript 类型；`npm run build` 在仓库根目录生成 `main.js`。开发时可运行 `npm run dev` 监听源码并持续构建，随后在 Obsidian 中重新加载 Atmos。构建命令不会自动安装插件到笔记库。

## 许可证

MIT，详见 [LICENSE](./LICENSE)。
