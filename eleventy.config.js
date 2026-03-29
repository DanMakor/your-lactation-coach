import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import cssnano from 'cssnano';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { backgroundImageShortcode, imageShortcode, imageSmallShortcode } from './src/_includes/image.js';

export default function (eleventyConfig) {
  //compile tailwind before eleventy processes the files
  eleventyConfig.on('eleventy.before', async () => {
    const staleSitemapPath = path.resolve('./dist/sitemap.xml');
    if (fs.existsSync(staleSitemapPath) && fs.statSync(staleSitemapPath).isDirectory()) {
      fs.rmSync(staleSitemapPath, { recursive: true, force: true });
    }

    const tailwindInputPath = path.resolve('./src/assets/styles/index.css');

    const tailwindOutputPath = './dist/assets/styles/index.css';

    const faviconSourcePath = path.resolve('./src/assets/images/logo.png');
    const faviconOutputDir = path.resolve('./dist/assets/icons');
    if (!fs.existsSync(faviconOutputDir)) {
      fs.mkdirSync(faviconOutputDir, { recursive: true });
    }

    const faviconSizes = [
      { size: 16, filename: 'favicon-16x16.png' },
      { size: 32, filename: 'favicon-32x32.png' },
      { size: 180, filename: 'apple-touch-icon.png' },
    ];

    await Promise.all(
      faviconSizes.map(({ size, filename }) =>
        sharp(faviconSourcePath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .png()
          .toFile(path.join(faviconOutputDir, filename))
      )
    );

    const cssContent = fs.readFileSync(tailwindInputPath, 'utf8');

    const outputDir = path.dirname(tailwindOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const result = await processor.process(cssContent, {
      from: tailwindInputPath,
      to: tailwindOutputPath,
    });

    fs.writeFileSync(tailwindOutputPath, result.css);
  });

  const processor = postcss([
    //compile tailwind
    tailwindcss(),

    //minify tailwind css
    cssnano({
      preset: 'default',
    }),
  ]);

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addNunjucksAsyncShortcode("imageSmall", imageSmallShortcode);
  eleventyConfig.addNunjucksAsyncShortcode("bgImage", backgroundImageShortcode);


  return {
    dir: {
      input: 'src',
      output: 'dist'
    }
  };
}