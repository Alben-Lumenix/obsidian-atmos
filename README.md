# Atmos

Atmos 是一个 Obsidian 天气插件初版：选择中国大陆城市或手动输入经纬度，获取和风天气实时天气，然后把简短的 Markdown 天气摘要插入当前笔记的光标位置。

## 功能

- 在设置中分别填写个人的 QWeather API Host 和 API Key。
- 使用和风 GeoAPI 搜索中国大陆城市、区县，从候选结果中选择地点；也可输入经纬度及显示名称。
- 测试连接，读取当前地点的实时天气。
- 在编辑器命令面板运行“Atmos: 插入当前天气”，在当前光标插入天气、温度、体感温度、湿度及数据来源。

## 5 分钟上手

1. 在[和风天气开发者平台](https://dev.qweather.com/)注册并登录，进入控制台创建项目。
2. 在该项目中创建 **API KEY** 类型凭据，复制 API Key。请勿把它发给他人或提交到 Git。
3. 在控制台设置中找到你专属的 **API Host**，复制域名（例如 `abcxyz.qweatherapi.com`）。它和 API Key 是两项不同配置。
4. 将插件的 `manifest.json` 与构建生成的 `main.js` 放入你的 Vault 下 `.obsidian/plugins/atmos/`，在 Obsidian 的“设置 → 第三方插件”中启用 Atmos。
5. 打开“设置 → Atmos 天气”，填入 API Host 与 API Key；搜索城市并选择，或填写纬度、经度并保存。
6. 点击“测试”。成功后打开一篇笔记，从命令面板执行“Atmos: 插入当前天气”。

和风天气的申请界面、额度与收费政策可能调整，请以[官方控制台及文档](https://dev.qweather.com/en/docs/)为准。API Key 认证自 2027-01-01 起会有每日请求量限制，详见[认证说明](https://dev.qweather.com/en/docs/configuration/authentication/)。

## 安装与开发

需要 Node.js、npm 和可运行第三方插件的 Obsidian。项目源码可保存在 Vault 以外。

```sh
npm install
npm run check
npm run build
```

将 `manifest.json`、`main.js` 复制到 `<你的 Vault>/.obsidian/plugins/atmos/`。修改源码时可以用 `npm run dev` 持续构建，重新加载 Obsidian 插件后查看结果。此仓库不包含真实凭据，也不自动修改 Vault。

## 隐私和凭据

API Host、API Key 与已选地点保存在 Obsidian 插件本地数据 `data.json` 中。Obsidian Sync 或第三方同步服务可能会同步这个文件，取决于你的配置。请求会直接从 Obsidian 发往你填写的 API Host；城市搜索文字、坐标和 API Key 会发送给和风天气。插件不会读取或上传笔记内容。不要分享 `data.json`，也不要把真实 Key 写入源码或截图。

## 当前限制

- 仅支持实时天气，不支持预报、空气质量、天气预警或历史天气。
- 仅实现手动城市搜索和坐标输入；自动设备定位与 IP 定位尚未实现。
- 城市搜索限定中国大陆；坐标可指向其他地区。
- 需要用户自备和风天气 API Host 与 API Key，未持有凭据时无法完成真实联网测试。
- 尚未在真实 Obsidian Vault 中完成加载验证。

## 后续计划

- 测试并加入可选的设备定位及合适的失败回退。
- 加入缓存、可自定义的 Markdown 模板，以及预报和天气预警。
- 增加真实 Vault 和移动端验证，再准备社区插件发布材料。

## 文档参考

- [和风天气：实时天气](https://dev.qweather.com/en/docs/api/weather/weather-current/)
- [和风天气：城市搜索](https://dev.qweather.com/en/docs/api/geoapi/city-lookup/)
- [和风天气：API Host](https://dev.qweather.com/en/docs/configuration/api-host/)
- [和风天气：API Key 认证](https://dev.qweather.com/en/docs/configuration/authentication/)
- [Obsidian 编辑器 API](https://docs.obsidian.md/Plugins/Editor/Editor)
