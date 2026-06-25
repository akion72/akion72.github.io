import { build, context } from 'esbuild';
import { copyFileSync, mkdirSync, cpSync } from 'fs';

const isProduction = process.argv.includes('--production');
const isWatch = process.argv.includes('--watch');

const shared = {
  bundle: true,
  target: 'chrome120',
  sourcemap: !isProduction,
  minify: isProduction,
  logLevel: 'info',
};

const contentBuild = {
  ...shared,
  entryPoints: { content: 'src/content.ts' },
  outdir: 'dist',
  format: 'iife',
};

const mainBuild = {
  ...shared,
  entryPoints: {
    background: 'src/background.ts',
    popup: 'src/popup.ts',
  },
  outdir: 'dist',
  format: 'esm',
  splitting: false,
};

function copyStatic() {
  mkdirSync('dist', { recursive: true });
  copyFileSync('manifest.json', 'dist/manifest.json');
  copyFileSync('src/popup.html', 'dist/popup.html');
  copyFileSync('src/popup.css', 'dist/popup.css');
  cpSync('icons', 'dist/icons', { recursive: true });
}

copyStatic();

if (isWatch) {
  const ctx1 = await context(contentBuild);
  const ctx2 = await context(mainBuild);
  await ctx1.watch();
  await ctx2.watch();
  console.log('Watching for changes...');
} else {
  await Promise.all([build(contentBuild), build(mainBuild)]);
}
