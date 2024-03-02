const fs = require("fs");
const path = require("path");

// 이동할 파일
const filesToCopy = [
  { source: "src/content.js", target: "build/content.js" },
  { source: "src/background.js", target: "build/background.js" },
];

// 파일을 복사하는 함수
function copyFile(source, target, callback) {
  fs.copyFile(source, target, (err) => {
    callback(err);
  });
}

// 파일을 복사함
filesToCopy.forEach(({ source, target }) => {
  copyFile(source, target, (err) => {
    if (err) {
      console.error(`Error copying file ${source}: ${err}`);
    } else {
      console.log(`Successfully copied ${source} to ${target}`);
    }
  });
});
