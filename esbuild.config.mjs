import esbuild from 'esbuild';
import { builtinModules } from 'node:module';

const production = process.argv.includes('production');
const options = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'main.js',
  format: 'cjs',
  target: 'es2022',
  platform: 'browser',
  external: ['obsidian', 'electron', ...builtinModules],
  sourcemap: production ? false : 'inline',
  minify: production,
  logLevel: 'info',
};
if (production) {
  await esbuild.build(options);
} else {
  const context = await esbuild.context(options);
  await context.watch();
}
