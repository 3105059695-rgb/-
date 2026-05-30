// convert-v2.js
const fs = require("fs");
const { Jimp } = require("jimp");

const OUT = "C:/tongwei-universe/public";

function rawToJpg(rawPath, jpgPath, w, h) {
  const buf = fs.readFileSync(rawPath);
  return new Jimp({ width: w, height: h, color: 0xFFFFFFFF }).then(img => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        if (idx + 3 < buf.length) {
          const r = buf[idx];
          const g = buf[idx + 1];
          const b = buf[idx + 2];
          img.setPixelColor(Jimp.rgbaToInt(r, g, b, 255), x, y);
        }
      }
    }
    return img.cover({ w: 300, h: 300 }).quality(85).write(jpgPath);
  });
}

async function main() {
  // tianxiwei: 4915200 / 4 = 1228800 -> 1280x960
  console.log("tianxiwei...");
  await rawToJpg(`${OUT}/tianxiwei.png`, `${OUT}/tianxiwei.jpg`, 1280, 960);
  console.log("  -> tianxiwei.jpg OK");

  // liyitong: 3764880 / 4 = 941220 -> 大概 1024x919 或 970x970
  console.log("liyitong...");
  await rawToJpg(`${OUT}/liyitong.png`, `${OUT}/liyitong.jpg`, 1024, 919);
  console.log("  -> liyitong.jpg OK");

  // 清理
  for (const f of ["tianxiwei.png", "liyitong.png", "img_2.png", "img_3.png"]) {
    try { fs.unlinkSync(`${OUT}/${f}`); } catch {}
  }
  console.log("Done!");
}

main().catch(e => console.error(e));
