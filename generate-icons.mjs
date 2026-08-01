import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const src = 'public/logo.png';
const resDir = 'android/app/src/main/res';

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

(async () => {
  for (const [folder, size] of Object.entries(sizes)) {
    const dir = join(resDir, folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    await sharp(src)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(join(dir, 'ic_launcher.png'));

    await sharp(src)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(join(dir, 'ic_launcher_round.png'));

    console.log(`Generated ${folder} (${size}x${size})`);
  }

  await sharp(src)
    .resize(432, 432, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(join(resDir, 'drawable', 'ic_launcher_foreground.png'));

  console.log('Done!');
})();
