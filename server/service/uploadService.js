require("dotenv").config();
const fs = require("fs");
const fsPromises = require("fs").promises;
const sharp = require("sharp");
const path = require("path");
module.exports = {
  // 이슈 저장
  saveIssue: function (req, res) {
    const uploadPath = process.env.REACT_APP_UPLOAD_PATH;
    const data = JSON.parse(req.query[0]);

    if (!data.issueIdx || !data.inputIssue) {
      res.status(400).send("Missing issueIdx or inputIssue");
      return;
    }

    const filePath = path.join(uploadPath, `${data.issueIdx}.txt`);

    fs.writeFile(filePath, data.inputIssue, "utf8", (err) => {
      if (err) {
        console.error("Error writing file:", err);
        res.status(500).send("Error writing file");
        return;
      }
      console.log(`File ${data.issueIdx}.txt saved successfully`);
      res.send("File saved successfully");
    });
  },

  // 파일 생성일자 비교 함수
  compareFileDates: function (fileA, fileB) {
    const uploadPath = process.env.REACT_APP_UPLOAD_PATH;
    const statA = fs.statSync(path.join(uploadPath, fileA));
    const statB = fs.statSync(path.join(uploadPath, fileB));
    return statB.mtime.getTime() - statA.mtime.getTime();
  },

  // 이슈 목록 조회
  getIssueList: function (req, res) {
    const uploadPath = process.env.REACT_APP_UPLOAD_PATH;
    const data = [];

    fs.readdir(uploadPath, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        res.send(JSON.stringify(data));
        return;
      }

      // .txt 파일만 필터링
      const txtFiles = files.filter((file) => path.extname(file) === ".txt");

      // 최근 파일 생성일자로 정렬
      txtFiles.sort(this.compareFileDates);

      // 각 파일의 내용과 생성일자를 읽어와서 data 배열에 추가
      txtFiles.forEach((file) => {
        const filePath = path.join(uploadPath, file);

        data.push({
          issueDate: fs.statSync(filePath).mtime,
          issueIdx: path.parse(file).name,
          contents: fs.readFileSync(filePath, "utf8"),
        });
      });

      res.send(JSON.stringify(data));
    });
  },

  // 파일 목록 조회
  getFileList: function (req, res) {
    const uploadPath =
      process.env.REACT_APP_UPLOAD_PATH + req.params.data + "/";

    // 디렉토리가 존재하는지 확인
    fs.access(uploadPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("Error accessing directory:", err);
        res.send(JSON.stringify([]));
        return;
      }
      // 디렉토리가 존재하면 파일 목록을 읽어옴
      fs.readdir(uploadPath, function (error, filelist) {
        if (error) {
          console.error("Error reading directory:", error);
          res.send(JSON.stringify([]));
        } else {
          res.send(JSON.stringify(filelist));
        }
      });
    });
  },

  // 파일 조회
  getUploadedFile: function (req, res) {
    const issueIdx = req.params.issueIdx;
    const fileName = req.params.fileName;
    const filePath = `${process.env.REACT_APP_UPLOAD_PATH}/${issueIdx}/${fileName}`; // 이미지 파일이 저장된 경로
    const thumbnail = req.query.thumbnail === "true" ? true : false;

    // 파일을 읽어서 클라이언트에게 전송
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error("Error reading image file:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      // 파일의 확장자를 추출
      let contentType = "image/jpeg"; // 기본적으로 JPEG로 설정
      const extension = fileName.split(".").pop().toLowerCase();
      switch (extension) {
        case "jpg":
        case "jpeg":
          contentType = "image/jpeg";
        case "png":
          contentType = "image/png";
        case "gif":
          contentType = "image/gif";
        case "webp":
          contentType = "image/webp";
        case "webp2":
          contentType = "image/webp";
        default:
          contentType = "application/octet-stream";
      }

      if (!thumbnail) {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      } else {
        // 이미지 리사이즈 처리
        sharp(data)
          .resize(100, 80)
          .toBuffer()
          .then((thumbnail) => {
            // 생성된 썸네일을 클라이언트에게 전송
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            res.end(thumbnail);
          })
          .catch((err) => {
            console.error("Error creating thumbnail:", err);
            res.status(500).send("Internal Server Error");
          });
      }
    });
  },

  // 파일 삭제
  fileDelete: function (req, res) {
    const data = JSON.parse(req.query[0]);
    const uploadPath = process.env.REACT_APP_UPLOAD_PATH + data.issueIdx + "/";
    let result = "success";
    let resultMessage = "File is deleted";

    try {
      fs.unlinkSync(uploadPath + data.fileName, { recursive: false });
    } catch (err) {
      console.error(err);
      result = "fail";
      resultMessage = "File not exist.";
    }

    res.send({
      status: result,
      message: resultMessage,
      data: {
        name: data.fileName,
        issueIdx: data.issueIdx,
      },
    });
  },

  // 파일 삭제 함수 Promise.
  unlinkFile: function (filePath) {
    return fsPromises
      .unlink(filePath)
      .then(() => {
        console.log("파일 삭제 완료 : ", filePath);
      })
      .catch((err) => {
        console.error("파일 삭제 중 오류 발생:", err);
        throw err; // 에러를 다시 던져서 상위 함수에서 처리할 수 있도록 합니다.
      });
  },

  // 파일 업로드
  fileUpload: function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }
    let file = req.files.file;
    const uploadPath =
      process.env.REACT_APP_UPLOAD_PATH + req.body.issueIdx + "/";

    // 디렉토리 생성
    fs.mkdirSync(uploadPath, { recursive: true });
    let fileName = file.name;
    if (typeof req.body.overwrite === "undefined") {
      // 파일 이름 중복 확인
      let flag = true;
      let count = 0;

      while (flag) {
        if (fs.existsSync(uploadPath + fileName)) {
          count++;
          fileName = count + "_" + file.name;
        } else {
          flag = false;
        }
      }

      file.mv(uploadPath + fileName, function (err) {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }
        res.send({
          status: true,
          message: "File is uploaded",
          data: {
            fileName: fileName,
            mimetype: file.mimetype,
            size: file.size,
            issueIdx: req.body.issueIdx,
          },
        });
      });
    } else {
      this.unlinkFile(uploadPath + fileName)
        .then(() => {
          console.log("파일 덮어쓰기를 위해 삭제 : ", uploadPath + fileName);

          file.mv(uploadPath + fileName, function (err) {
            if (err) {
              console.log(err);
              return res.status(500).send(err);
            }
            res.send({
              status: true,
              message: "File is uploaded",
              data: {
                fileName: fileName,
                mimetype: file.mimetype,
                size: file.size,
                issueIdx: req.body.issueIdx,
              },
            });
          });
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    }
  },
};
