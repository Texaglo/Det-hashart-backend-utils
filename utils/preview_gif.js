const basePath = process.cwd();
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

const { format, preview_gif } = require(`${basePath}/src/config.js`);


const loadImg = async (_img) => {
  return new Promise(async (resolve) => {
    const loadedImage = await loadImage(`${_img}`);
    resolve({ loadedImage: loadedImage });
  });
};

// read image paths
const imageList = [];


const saveProjectPreviewGIF = async (req) => {
  const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);
  let hashlipsGiffer = null;

  const buildDir = `${basePath}/build/${req.body.address}`;
  const imageDir = `${buildDir}/images`;
  const canvas = createCanvas(format.width, format.height);
  const ctx = canvas.getContext("2d");
  const rawdata = fs.readdirSync(imageDir).forEach((file) => {
    imageList.push(loadImg(`${imageDir}/${file}`));
  });
  // Extract from preview config
  const { numberOfImages, order, repeat, quality, delay, imageName } =
    preview_gif;
  // Extract from format config
  const { width, height } = format;
  // Prepare canvas
  const previewCanvasWidth = width;
  const previewCanvasHeight = height;

  if (imageList.length < numberOfImages) {
    console.log(
      `You do not have enough images to create a gif with ${numberOfImages} images.`
    );
  } else {
    // Shout from the mountain tops
    console.log(
      `Preparing a ${previewCanvasWidth}x${previewCanvasHeight} project preview with ${imageList.length} images.`
    );
    const previewPath = `${buildDir}/${imageName}`;

    ctx.clearRect(0, 0, width, height);

    hashlipsGiffer = new HashlipsGiffer(
      canvas,
      ctx,
      `${previewPath}`,
      repeat,
      quality,
      delay
    );
    hashlipsGiffer.start();

    await Promise.all(imageList).then((renderObjectArray) => {
      // Determin the order of the Images before creating the gif
      if (order == "ASC") {
        // Do nothing
      } else if (order == "DESC") {
        renderObjectArray.reverse();
      } else if (order == "MIXED") {
        renderObjectArray = renderObjectArray.sort(() => Math.random() - 0.5);
      }

      // Reduce the size of the array of Images to the desired amount
      if (parseInt(numberOfImages) > 0) {
        renderObjectArray = renderObjectArray.slice(0, numberOfImages);
      }

      renderObjectArray.forEach((renderObject, index) => {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(
          renderObject.loadedImage,
          0,
          0,
          previewCanvasWidth,
          previewCanvasHeight
        );
        hashlipsGiffer.add();
      });
    });
    hashlipsGiffer.stop();
  }
};

module.exports = { saveProjectPreviewGIF };

