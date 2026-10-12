import { cp, mkdir } from 'node:fs/promises';

await mkdir('public', { recursive: true });
await cp('index.html', 'public/index.html');
await cp('styles.css', 'public/styles.css');
await cp('data', 'public/data', { recursive: true });
