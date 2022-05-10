const basePath = process.cwd();
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

const { preview } = require(`${basePath}/src/config.js`);

const saveProjectPreviewImage = async (req) => {
  const buildDir = `${basePath}/build/${req.body.address}`;
  const rawdata = fs.readFileSync(`${buildDir}/json/_metadata.json`);
  const metadataList = JSON.parse(rawdata);
  // Extract from preview config
  const { thumbWidth, thumbPerRow, imageRatio, imageName } = preview;
  // Calculate height on the fly
  const thumbHeight = thumbWidth * imageRatio;
  // Prepare canvas
  const previewCanvasWidth = thumbWidth * thumbPerRow;
  const previewCanvasHeight =
    thumbHeight * Math.ceil(metadataList.length / thumbPerRow);
  // Shout from the mountain tops
  console.log(
    `Preparing a ${previewCanvasWidth}x${previewCanvasHeight} project preview with ${metadataList.length} thumbnails.`
  );

  // Initiate the canvas now that we have calculated everything
  const previewPath = `${buildDir}/${imageName}`;
  const previewCanvas = createCanvas(previewCanvasWidth, previewCanvasHeight);
  const previewCtx = previewCanvas.getContext("2d");

  // Iterate all NFTs and insert thumbnail into preview image
  // Don't want to rely on "edition" for assuming index
  for (let index = 0; index < metadataList.length; index++) {
    const nft = metadataList[index];
    await loadImage(`${buildDir}/images/${nft.edition}.png`).then((image) => {
      previewCtx.drawImage(
        image,
        thumbWidth * (index % thumbPerRow),
        thumbHeight * Math.trunc(index / thumbPerRow),
        thumbWidth,
        thumbHeight
      );
    });
  }

  // Write Project Preview to file
  fs.writeFileSync(previewPath, previewCanvas.toBuffer("image/png"));
  console.log(`Project preview image located at: ${previewPath}`);
};

module.exports = { saveProjectPreviewImage };

