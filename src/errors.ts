export class AtmosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AtmosError';
  }
}

export function userMessage(error: unknown): string {
  return error instanceof Error ? error.message : '发生未知错误。';
}
