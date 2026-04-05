import fs from "fs";
import path from "path";
import sharp from "sharp";

const PAD_INPUT_DIR = "./input-pad";
const CROP_INPUT_DIR = "./input-crop";
const OUTPUT_DIR = "./../images";
const SIZE = 200;

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

async function processFolder(inputDir: string, mode: "pad" | "crop") {
  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    if (!/\.(png|jpe?g|webp|gif)$/i.test(file)) continue;

    const inputPath = path.join(inputDir, file);
    const baseName = path.parse(file).name;
    const outputPath = path.join(OUTPUT_DIR, `${baseName}.webp`);

    let image = sharp(inputPath);

    if (mode === "crop") {
      image = image.resize({
        width: SIZE,
        height: SIZE,
        fit: "cover",
        position: "centre"
      });
    } else {
      image = image.resize({
        width: SIZE,
        height: SIZE,
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      });
    }

    await image.webp({ lossless: true }).toFile(outputPath);
  }
}

async function run() {
  ensureDir(OUTPUT_DIR);

  const results: string[] = [];

  await processFolder(PAD_INPUT_DIR, "pad");
  await processFolder(CROP_INPUT_DIR, "crop");

  // regenerate markdown after both folders processed
  const files = fs.readdirSync(OUTPUT_DIR);

  for (const file of files) {
    const baseName = path.parse(file).name;
    const mdPath = path.join("./images", file).replace(/\\/g, "/");
    results.push(`![${baseName}](${mdPath})`);
  }

  results.forEach((result) => {
    console.log(result);
  });
}

run().catch(console.error);
