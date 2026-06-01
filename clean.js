const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '.next');

function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file, index) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        try {
          fs.unlinkSync(curPath);
        } catch (e) {
          console.warn(`Could not delete file ${curPath} (it might be locked)`);
        }
      }
    });
    try {
      fs.rmdirSync(directoryPath);
    } catch (e) {
      console.warn(`Could not delete directory ${directoryPath} (it might be locked)`);
    }
  }
}

console.log("Cleaning Next.js cache...");
deleteFolderRecursive(nextDir);
console.log("Done! You can now start your dev server.");
