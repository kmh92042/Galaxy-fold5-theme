// Run against the local Vite server: npm run dev -- --port 5173
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import JSZip from 'jszip';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1200}}); await page.goto('http://127.0.0.1:5173');
 await page.screenshot({path:'/tmp/nocturne-desktop.png',fullPage:true});
 const ready=page.waitForEvent('download');await page.getByRole('button',{name:'테마 팩 다운로드'}).click(); const file=await ready;
 const zip=await JSZip.loadAsync(await readFile(await file.path()));
 for(const [name,entry] of Object.entries(zip.files)) { if(entry.dir)continue; const target=`design/exports/${name}`;await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await writeFile(target,await entry.async('nodebuffer')); }
 console.log('Exported 3 wallpapers, 8 icons and application guide to design/exports.');
} finally {await browser.close();}
