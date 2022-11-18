const fs = require("fs");
const path = require("path");
const moment = require("moment");

const the_path = "/home/noga/Desktop/test";
const new_path = "/home/noga/Desktop";
let targetPath = "";

const fsp = fs.promises;


async function createTargetFolder(target) {
  targetPath = path.resolve(target, "קבצים ממויינים");

  await fsp.mkdir(targetPath, { recursive: true });
}

async function isFolderRecurse(dir) {
  const files = await fsp.readdir(dir);

  files.forEach(async (fileName) => {
    const filepath = path.resolve(dir, fileName);

    const stats = await fsp.stat(filepath);
    const isFile = stats.isFile();
    isFile ? handleFile(filepath, fileName) : isFolderRecurse(filepath);
  });
}

async function handleFile(filePath, fileName) {
  const stats = await fsp.stat(filePath);
  const fileDateCreated = moment(stats.birthtime).format("DD.MM.YY");

  await insertFileToFolder(filePath, fileDateCreated, fileName);
}

async function insertFileToFolder(oldPath, folderName, fileName) {
  const newFolderPath = path.resolve(targetPath, folderName);
  if (!fs.existsSync(newFolderPath)) {
    await fsp.mkdir(newFolderPath, { recursive: true });
  }

  try {
    await fsp.access(oldPath, fs.constants.R_OK);
    await fsp.access(newFolderPath, fs.constants.W_OK);
    await fsp.cp(oldPath, path.resolve(newFolderPath, fileName), {
      preserveTimestamps: true,
    });

    console.log("File copied successfully.");
  } catch (ex) {
    if (ex.errno === -2) console.error(`File "${oldPath}" doesn't exist.`);
    else if (ex.errno === -13)
      console.error(`Could not access "${path.resolve(newFolderPath)}"`);
    else console.error(ex);
  }
}


async function sort(oldPath, newPath) {
  await createTargetFolder(newPath);
  await isFolderRecurse(oldPath);
  // fs.opendir(newPath);
}

(async () => {
  await sort(the_path, new_path);
})();
