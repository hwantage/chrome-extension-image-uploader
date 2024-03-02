const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const app = express();
const uploadService = require("./service/uploadService");
require("dotenv").config();
app.use(fileUpload());
app.set("port", process.env.REACT_APP_SERVER_PORT);
app.use(cors());

// interceptor Function
const logger = function (req, res, next) {
  console.log("[URI]" + decodeURI(req.url));
  next();
};

// 파일 조회
app.get("/getUploadedFile/:issueIdx/:fileName", logger, (req, res) => {
  uploadService.getUploadedFile(req, res);
});

// 파일 업로드
app.post("/fileUpload/", logger, (req, res) => {
  uploadService.fileUpload(req, res);
});

// 파일 삭제
app.post("/fileDelete/", logger, (req, res) => {
  uploadService.fileDelete(req, res);
});

// 파일 목록 조회
app.get("/getFileList/:data", logger, (req, res) => {
  uploadService.getFileList(req, res);
});

// 이슈 저장
app.post("/saveIssue/", logger, (req, res) => {
  uploadService.saveIssue(req, res);
});

// 이슈 목록 조회
app.get("/getIssueList/", logger, (req, res) => {
  uploadService.getIssueList(req, res);
});

// Listen
app.listen(app.get("port"), () => {
  console.log(app.get("port") + "번 포트로 서버를 시작합니다.");
});
