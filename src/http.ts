import { requestUrl } from 'obsidian';
import { AtmosError } from './errors';

export function normalizeApiHost(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new AtmosError('请先填写和风天气 API Host。');
  let url: URL;
  try {
    url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
  } catch {
    throw new AtmosError('API Host 格式无效，请填入控制台提供的域名。');
  }
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.port || (url.pathname !== '/' && url.pathname !== '') || url.search || url.hash) {
    throw new AtmosError('API Host 只能填写 HTTPS 域名，不能包含路径、端口或参数。');
  }
  return url.origin;
}

export async function getJson<T>(host: string, key: string, path: string): Promise<T> {
  if (!key.trim()) throw new AtmosError('请先填写和风天气 API Key。');
  const url = `${normalizeApiHost(host)}${path}`;
  try {
    const response = await requestUrl({ url, method: 'GET', headers: { 'X-QW-Api-Key': key.trim() }, throw: false });
    if (response.status < 200 || response.status >= 300) {
      const hint = response.status === 401 || response.status === 403 ? '请检查 API Host 和 API Key。' : '请稍后重试并检查和风天气服务状态。';
      throw new AtmosError(`天气服务返回 HTTP ${response.status}。${hint}`);
    }
    return response.json as T;
  } catch (error) {
    if (error instanceof AtmosError) throw error;
    throw new AtmosError('无法连接和风天气，请检查网络与 API Host。');
  }
}
