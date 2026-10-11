# Atmos

English | [简体中文](./README.zh-CN.md)

Atmos is an Obsidian plugin that fetches current weather for a selected location and inserts a short Markdown summary at the cursor in the active editor. It uses your own QWeather API Host and API Key. The plugin interface and inserted weather text are currently in Chinese.

## Features

- Search for a city or district in mainland China and select a result, or enter coordinates with an optional display name.
- Test the saved location and credentials by requesting current weather.
- Insert the condition and temperature into a note. Feels-like temperature and humidity appear when supplied by the API; the summary includes QWeather attribution.

## Installation

Atmos has not yet been submitted to or published in the Obsidian Community Plugins directory. Submission preparation is in progress. If it is approved and published, users will be able to install it from **Settings → Community plugins → Browse**. Until then, install it manually:

1. Install [Node.js](https://nodejs.org/), then run `npm install` and `npm run build` in this repository.
2. Create `<your vault>/.obsidian/plugins/atmos/` and copy `manifest.json` and the generated `main.js` into it.
3. In Obsidian, open **Settings → Community plugins**, enable community plugins if necessary, and enable **Atmos**.

The manifest requires Obsidian 1.5.0 or later and does not mark the plugin as desktop only. Mobile operation has not yet been verified.

## Getting started

1. In the [QWeather developer console](https://dev.qweather.com/), create a project and an **API KEY** credential. Find your dedicated **API Host** in the console settings. These are separate values.
2. Open **Settings → Atmos 天气** in Obsidian. Enter the API Host and API Key.
3. Search for a mainland China city or district and choose a result. Alternatively, enter latitude and longitude, optionally enter a place name, and click **保存坐标** (Save coordinates).
4. Click **测试** (Test). When it succeeds, open a note in the editor and run **Atmos: 插入当前天气** (Insert current weather) from the command palette.

## Configuration

| Setting | What it does |
| --- | --- |
| API Host | Your dedicated QWeather API domain, such as `abcxyz.qweatherapi.com`. An HTTPS URL with no path is also accepted; ports, paths, and query parameters are rejected. |
| API Key | QWeather API KEY credential used in requests. |
| Location | One saved search result or manually entered coordinates. Latitude must be from −90 to 90 and longitude from −180 to 180. A manual name is optional; coordinates are shown when no name is provided. |

Search is restricted to mainland China and returns up to ten results. Both search and weather requests ask QWeather for Chinese text. There is no setting for units or output format.

## Privacy and network requests

Atmos saves the API Host, API Key, and selected location in the plugin's `data.json`. The API Key is not encrypted in this file. Obsidian Vault synchronization may synchronize `data.json`; do not share the file or commit it to a repository.

Requests go to the API Host you configure and use Obsidian's network request API. City search sends the search text and search parameters. A current-weather request sends the selected location's latitude and longitude and the language parameter. Both requests include the API Key in the `X-QW-Api-Key` request header. The plugin does not send note contents to QWeather.

## Current scope

Atmos currently supports manual location search in mainland China, manual coordinates, a credential/location test, and insertion of current weather at the editor cursor. Automatic device or IP location, automatic daily-note creation or writing, scheduled updates, forecasts, alerts, caching, and custom output templates are not implemented. Live loading in an Obsidian vault and mobile operation have not yet been verified.

## Troubleshooting

- **API Host format error:** copy the dedicated HTTPS domain from the QWeather console. Enter only the domain; paths, ports, and query parameters are not accepted.
- **HTTP 401 or 403:** check that the API Host and API Key belong to the intended QWeather project and that the key was copied correctly.
- **Cannot connect:** check the network connection and API Host, then retry. Atmos does not contact QWeather until you search, test, or insert weather.
- **No search result:** search is limited to mainland China. You can enter latitude and longitude manually instead.
- **Weather response incomplete:** retry later and check the QWeather service and account status.

## Development

With Node.js and npm installed, run:

```sh
npm install
npm run check
npm test
npm run build
npm run verify
```

`npm run check` checks TypeScript types; `npm test` runs offline tests with mocked responses; `npm run build` writes `main.js` in the repository root; and `npm run verify` runs type checking, a production build, and the release verification script. During development, `npm run dev` watches the source and rebuilds `main.js`; reload Atmos in Obsidian to use the new build. The build does not install the plugin into a vault.

## License

MIT. See [LICENSE](./LICENSE).
