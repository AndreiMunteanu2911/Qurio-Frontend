import sharp from 'sharp';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const faviconPath = join(root, 'src', 'lib', 'assets', 'favicon.png');
const resDir = join(root, 'android', 'app', 'src', 'main', 'res');

const BG = '#160831';

function parseHex(c) {
  const h = c.replace('#', '');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

const bgRgb = parseHex(BG);

async function makeIcon(src, dest, w, h, bg, logoScale = 0.65) {
  const logoPx = Math.round(Math.min(w, h) * logoScale);

  const icon = await sharp(src).resize(logoPx, logoPx, { fit: 'inside', withoutEnlargement: false }).toBuffer();
  const iconMeta = await sharp(icon).metadata();
  const left = Math.round((w - iconMeta.width) / 2);
  const top = Math.round((h - iconMeta.height) / 2);

  const create = { width: w, height: h, channels: 4 };
  if (bg) {
    create.background = { r: bgRgb.r, g: bgRgb.g, b: bgRgb.b, alpha: 1 };
  } else {
    create.background = { r: 0, g: 0, b: 0, alpha: 0 };
  }

  await sharp({ create })
    .composite([{ input: icon, top, left }])
    .png()
    .toFile(dest);
}

async function resizeFullIcon(src, dest, size) {
  await sharp(src)
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(dest);
}

async function main() {
  const meta = await sharp(faviconPath).metadata();
  console.log(`Favicon: ${meta.width}x${meta.height}`);

  // --- Launcher icons (full icon on bg) ---
  const iconSizes = {
    'mipmap-mdpi': { launcher: 48, adaptive: 108 },
    'mipmap-hdpi': { launcher: 72, adaptive: 162 },
    'mipmap-xhdpi': { launcher: 96, adaptive: 216 },
    'mipmap-xxhdpi': { launcher: 144, adaptive: 324 },
    'mipmap-xxxhdpi': { launcher: 192, adaptive: 432 },
  };

  for (const [dir, { launcher, adaptive }] of Object.entries(iconSizes)) {
    const outDir = join(resDir, dir);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    await resizeFullIcon(faviconPath, join(outDir, 'ic_launcher.png'), launcher);
    await resizeFullIcon(faviconPath, join(outDir, 'ic_launcher_round.png'), launcher);
    await resizeFullIcon(faviconPath, join(outDir, 'ic_launcher_foreground.png'), adaptive);

    console.log(`  ${dir} (${launcher}px / adaptive ${adaptive}px)`);
  }

  // --- Splash screens ---
  const splashSizes = {
    'drawable': { w: 480, h: 320 },
    'drawable-land-mdpi': { w: 480, h: 320 },
    'drawable-land-hdpi': { w: 800, h: 480 },
    'drawable-land-xhdpi': { w: 1280, h: 720 },
    'drawable-land-xxhdpi': { w: 1600, h: 960 },
    'drawable-land-xxxhdpi': { w: 1920, h: 1280 },
    'drawable-port-mdpi': { w: 320, h: 480 },
    'drawable-port-hdpi': { w: 480, h: 800 },
    'drawable-port-xhdpi': { w: 720, h: 1280 },
    'drawable-port-xxhdpi': { w: 960, h: 1600 },
    'drawable-port-xxxhdpi': { w: 1280, h: 1920 },
  };

  for (const [dir, { w, h }] of Object.entries(splashSizes)) {
    const outDir = join(resDir, dir);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    await makeIcon(faviconPath, join(outDir, 'splash.png'), w, h, true, 0.3);
    console.log(`  ${dir} (${w}x${h})`);
  }

  // --- Update XMLs ---
  writeFileSync(
    join(resDir, 'values', 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${BG}</color>
</resources>
`
  );

  writeFileSync(
    join(resDir, 'drawable', 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportHeight="108"
    android:viewportWidth="108">
    <path
        android:fillColor="${BG}"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`
  );

  writeFileSync(
    join(resDir, 'drawable-v24', 'ic_launcher_foreground.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportHeight="108"
    android:viewportWidth="108">
    <path
        android:fillColor="#00000000"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`
  );

  console.log('\nAll assets generated!');
}

main().catch(console.error);
