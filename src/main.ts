import { Notice, Plugin } from 'obsidian';
import { userMessage } from './errors';
import { currentWeather } from './weather-provider';
import { renderWeather } from './renderer';
import { AtmosSettingTab } from './settings';
import { DEFAULT_SETTINGS, type AtmosSettings } from './types';

export default class AtmosPlugin extends Plugin {
  settings: AtmosSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new AtmosSettingTab(this.app, this));
    this.addCommand({
      id: 'insert-current-weather',
      name: '插入当前天气',
      editorCallback: async (editor) => {
        const { apiHost, apiKey, location } = this.settings;
        if (!location) {
          new Notice('请先在 Atmos 设置中选择地点或填写坐标。');
          return;
        }
        const cursor = editor.getCursor();
        try {
          const weather = await currentWeather(apiHost, apiKey, location);
          editor.replaceRange(renderWeather(location, weather), cursor);
          new Notice('已插入当前天气。');
        } catch (error) {
          new Notice(userMessage(error));
        }
      },
    });
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
