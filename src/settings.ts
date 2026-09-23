import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type AtmosPlugin from './main';
import { userMessage } from './errors';
import { locationLabel, parseCoordinates } from './location';
import { searchLocations } from './location-search';
import { currentWeather } from './weather-provider';

export class AtmosSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: AtmosPlugin) { super(app, plugin); }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Atmos 天气' });
    containerEl.createEl('p', { text: '先填写和风天气控制台中的 API Host 和 API Key，再搜索地点或填写坐标。' });

    new Setting(containerEl).setName('API Host').setDesc('例如 abcxyz.qweatherapi.com；每位用户都有自己的域名。')
      .addText((text) => text.setPlaceholder('abcxyz.qweatherapi.com').setValue(this.plugin.settings.apiHost).onChange(async (value) => {
        this.plugin.settings.apiHost = value.trim();
        await this.plugin.saveSettings();
      }));
    new Setting(containerEl).setName('API Key').setDesc('仅保存在本地 Obsidian 插件数据中。')
      .addText((text) => {
        text.inputEl.type = 'password';
        text.setPlaceholder('在此粘贴 API Key').setValue(this.plugin.settings.apiKey).onChange(async (value) => {
          this.plugin.settings.apiKey = value.trim();
          await this.plugin.saveSettings();
        });
      });

    containerEl.createEl('h3', { text: '地点' });
    const selected = containerEl.createEl('p', { text: this.plugin.settings.location ? `当前地点：${locationLabel(this.plugin.settings.location)}` : '尚未选择地点。' });
    let searchText = '';
    const results = containerEl.createDiv();
    new Setting(containerEl).setName('搜索中国大陆城市').setDesc('输入城市或区县名称后点击搜索，从候选结果中选择。')
      .addText((text) => text.setPlaceholder('例如 海淀').onChange((value) => { searchText = value; }))
      .addButton((button) => button.setButtonText('搜索').onClick(async () => {
        results.empty();
        try {
          const locations = await searchLocations(this.plugin.settings.apiHost, this.plugin.settings.apiKey, searchText);
          if (!locations.length) { results.createEl('p', { text: '未找到地点，请尝试其他名称或直接填写坐标。' }); return; }
          for (const location of locations) {
            new Setting(results).setName(locationLabel(location))
              .addButton((choice) => choice.setButtonText('选择').onClick(async () => {
                this.plugin.settings.location = location;
                await this.plugin.saveSettings();
                selected.setText(`当前地点：${locationLabel(location)}`);
                results.empty();
                new Notice(`已选择 ${location.name}。`);
              }));
          }
        } catch (error) { new Notice(userMessage(error)); }
      }));

    let latitude = '';
    let longitude = '';
    let name = '';
    new Setting(containerEl).setName('纬度').addText((text) => text.setPlaceholder('31.74').onChange((value) => { latitude = value; }));
    new Setting(containerEl).setName('经度').addText((text) => text.setPlaceholder('119.57').onChange((value) => { longitude = value; }));
    new Setting(containerEl).setName('地点名称').setDesc('可选；用于插入笔记时显示。')
      .addText((text) => text.setPlaceholder('例如 北京').onChange((value) => { name = value; }))
      .addButton((button) => button.setButtonText('保存坐标').onClick(async () => {
        try {
          const location = parseCoordinates(latitude, longitude, name);
          this.plugin.settings.location = location;
          await this.plugin.saveSettings();
          selected.setText(`当前地点：${locationLabel(location)}`);
          new Notice('坐标已保存。');
        } catch (error) { new Notice(userMessage(error)); }
      }));

    new Setting(containerEl).setName('测试连接').setDesc('读取已选地点的实时天气，确认配置可用。')
      .addButton((button) => button.setButtonText('测试').onClick(async () => {
        try {
          const location = this.plugin.settings.location;
          if (!location) { new Notice('请先选择地点或保存坐标。'); return; }
          const weather = await currentWeather(this.plugin.settings.apiHost, this.plugin.settings.apiKey, location);
          new Notice(`连接成功：${location.name} ${weather.temperature}${weather.unit}，${weather.condition}`);
        } catch (error) { new Notice(userMessage(error)); }
      }));
  }
}
