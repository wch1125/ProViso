/**
 * Post-build fixups. The output is deployed to BOTH GitHub Pages and Cloudflare
 * Pages during the migration, so this emits what each host needs. The files are
 * inert on the host that does not use them.
 *
 * Usage: node scripts/postbuild.mjs
 *
 *   GitHub Pages    404.html    SPA fallback (Pages serves it for unknown paths)
 *                   .nojekyll   stops Jekyll swallowing files that start with _
 *                   CNAME       binds the custom domain
 *
 *   Cloudflare      _redirects  SPA fallback. Cloudflare serves a matching
 *                               static file first, so the static
 *                               /demo/index.html product-demo page still wins.
 *
 * When GitHub Pages is retired (see .claude/plans/cloudflare-migration-runbook.md,
 * step 5), drop CNAME and .nojekyll — Cloudflare binds its custom domain in
 * project settings, and a stale CNAME pointing at a dead host is worse than none.
 */
import { existsSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = 'dist';

if (!existsSync(join(outDir, 'index.html'))) {
  console.error(`postbuild: ${outDir}/index.html is missing — did the build run?`);
  process.exit(1);
}

// --- GitHub Pages
copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'));
writeFileSync(join(outDir, '.nojekyll'), '');
writeFileSync(join(outDir, 'CNAME'), 'proviso.finance');

// --- Cloudflare Pages
writeFileSync(join(outDir, '_redirects'), '/*  /index.html  200\n');

console.log(`postbuild: ${outDir} ready (GitHub Pages + Cloudflare Pages)`);
