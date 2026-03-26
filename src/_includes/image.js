import Image from "@11ty/eleventy-img";

async function generateImageMetadata(src, widths, formats) {
  return Image(src, {
    widths,
    formats,
    outputDir: "./dist/assets/images/",
    urlPath: "/assets/images/",
    sharpOptions: { quality: 80 },
  });
}

export async function imageShortcode(src, alt = "", sizes = "100vw", classes = "") {
  if (!alt) throw new Error("Missing alt text.");

  const metadata = await generateImageMetadata(src, [320, 640, 1024, 1600], ["avif", "webp", "jpeg"]);

  const imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
    class: classes,
  };

  return Image.generateHTML(metadata, imageAttributes);
}

export async function backgroundImageShortcode(src, baseWidth = 640) {
  const numericBaseWidth = Number(baseWidth);
  const retinaWidth = numericBaseWidth * 2;
  const metadata = await generateImageMetadata(src, [numericBaseWidth, retinaWidth], ["webp", "jpeg"]);

  const webpImages = metadata.webp || [];
  const jpegImages = metadata.jpeg || [];

  const webp1x = webpImages.find((image) => image.width === numericBaseWidth) || webpImages[0];
  const webp2x = webpImages.find((image) => image.width === retinaWidth) || webpImages[webpImages.length - 1];
  const jpeg1x = jpegImages.find((image) => image.width === numericBaseWidth) || jpegImages[0];
  const jpeg2x = jpegImages.find((image) => image.width === retinaWidth) || jpegImages[jpegImages.length - 1];

  if (!jpeg1x) {
    throw new Error(`Could not generate a background image for ${src}`);
  }

  const imageSetEntries = [
    webp1x && `url('${webp1x.url}') type('image/webp') 1x`,
    webp2x && `url('${webp2x.url}') type('image/webp') 2x`,
    `url('${jpeg1x.url}') type('image/jpeg') 1x`,
    jpeg2x && `url('${jpeg2x.url}') type('image/jpeg') 2x`,
  ].filter(Boolean);

  return `url('${jpeg1x.url}'); background-image: image-set(${imageSetEntries.join(", ")})`;
}