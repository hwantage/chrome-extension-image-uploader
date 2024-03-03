import React, { useState, useRef, useEffect } from "react";
import { Modal } from "antd";
import "../css/tui-color-picker.css";
import "../css/tui-image-editor.css";
import ImageEditor from "@toast-ui/react-image-editor";
import axios from "axios";
import * as CommonFunc from "../common/CommonFunc.js";
const config = process.env;

// ImageEditor테마 설정 : 상단 로고 삭제, load 버튼 삭제
const myTheme = {
  "common.bi.image": "",
  "common.bisize.width": "0",
  "common.bisize.height": "0",
  "common.backgroundImage": "none",
  "common.border": "0px",

  // header
  "header.backgroundImage": "none",
  "header.backgroundColor": "transparent",
  "header.border": "0px",

  // load button
  "loadButton.backgroundColor": "#fff",
  "loadButton.border": "1px solid #ddd",
  "loadButton.color": "#222",
  "loadButton.fontFamily": "NotoSans, sans-serif",
  "loadButton.fontSize": "12px",
  "loadButton.display": "none",

  // download button
  "downloadButton.backgroundColor": "#fff",
  "downloadButton.border": "1px solid #ddd",
  "downloadButton.color": "#222",
  "downloadButton.fontFamily": "NotoSans, sans-serif",
  "downloadButton.fontSize": "12px",
  "downloadButton.display": "none",
};

const UploadFileEditor = (props) => {
  const [fileName, setFileName] = useState(props.fileName);
  const [isUplodFileViewerVisible, setIsUploadFileViewerVisible] = useState(
    props.isUplodFileViewerVisible
  );
  const [uploadedFiles, setUploadedFiles] = useState(props.uploadedFiles);
  const [issueIdx, setIssueIdx] = useState(props.issueIdx);
  const [imgOnError, setImgOnError] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.imageEditorInst;
      if (editor) {
        // Shape Stroke 의 기본 색상을 빨간색으로 변경
        editor.ui.shape.options.stroke = "#ff0000";
        editor.ui.shape._els.strokeColorpicker._color = "#ff0000";
        editor.ui.shape.colorPickerControls[1].colorElement.style.backgroundColor =
          "#ff0000";
        // Text Color 의 기본 색상을 빨간색으로 변경
        editor.ui.text.colorPickerInputBox.defaultValue = "#ff0000";
        editor.ui.text._els.color = "#ff0000";
        editor.ui.text._els.textColorpicker.color = "#ff0000";
        editor.ui.text._els.textColorpicker.colorElement.style.backgroundColor =
          "#ff0000";

        // 이미지 편집 저장을 위한 Apply 버튼 생성
        var element = editorRef.current.getRootElement();
        var applyButton = document.createElement("button");
        applyButton.innerHTML = "Apply";
        applyButton.style.backgroundColor = "#1890ff";
        applyButton.style.color = "#fff";
        applyButton.style.fontFamily = "NotoSans, sans-serif";
        applyButton.style.fontSize = "12px";
        applyButton.style.border = "1px solid #000";
        applyButton.style.width = "100px";

        // 버튼을 맨 끝에 추가
        var headerButtons = element.querySelector(
          ".tui-image-editor-header-buttons"
        );
        headerButtons.appendChild(applyButton);

        // 버튼 클릭 이벤트 핸들러 추가
        applyButton.addEventListener("click", () => {
          handleApply();
        });

        // 이미지 편집 저장을 위한 Append 버튼 생성
        var appendButton = document.createElement("button");
        appendButton.innerHTML = "Append";
        appendButton.style.backgroundColor = "#ff9818";
        appendButton.style.color = "#fff";
        appendButton.style.fontFamily = "NotoSans, sans-serif";
        appendButton.style.fontSize = "12px";
        appendButton.style.border = "1px solid #000";
        appendButton.style.width = "100px";

        // 버튼을 맨 끝에 추가
        headerButtons.appendChild(appendButton);

        // 버튼 클릭 이벤트 핸들러 추가
        appendButton.addEventListener("click", () => {
          handleAppend();
        });
      }
    }
  }, []);

  const handleApply = () => {
    saveImage(fileName, "1");
  };

  const handleAppend = () => {
    saveImage(fileName);
  };

  const changeFile = (fileName) => {
    setFileName(fileName);
    setImgOnError(false);
    console.log(
      config.REACT_APP_SERVER_URL +
        "/getUploadedFile" +
        "/" +
        issueIdx +
        "/" +
        fileName
    );
    // ImageEditor 파일 변경
    const editorInstance = editorRef.current.getInstance();
    editorInstance.loadImageFromURL(
      config.REACT_APP_SERVER_URL +
        "/getUploadedFile" +
        "/" +
        issueIdx +
        "/" +
        fileName,
      fileName
    );
  };

  const closeModal = () => {
    setIsUploadFileViewerVisible(false);
    props.closedUploadFileEditor(uploadedFiles); // 부모창 이미지 목록 갱신 처리
  };

  // ImageEditor 이미지 Blob 변환
  const dataURItoBlob = (dataURI, mimeString) => {
    var byteString = atob(dataURI.split(",")[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  };

  const saveImage = (filename, overwrite) => {
    const editorInstance = editorRef.current.getInstance();
    editorInstance.resetZoom(); // 저장하기 전에 이미지 zoom 100%로 변경
    const data = editorInstance.toDataURL();
    const mimeString = getFileMimeType(filename);
    var blob = dataURItoBlob(data, mimeString);
    const file = new File([blob], filename, {
      type: mimeString,
      lastModified: new Date(),
    });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("issueIdx", issueIdx); // issueIdx 정보 추가
    if (overwrite !== undefined) {
      formData.append("overwrite", "1"); // 이미지 overwrite
    }

    // 파일을 서버로 전송합니다.
    axios
      .post(config.REACT_APP_SERVER_URL + "/fileUpload", formData)
      .then((response) => {
        // 성공적으로 업로드되었을 때의 처리
        CommonFunc.openNotification(
          "success",
          "파일 업데이트를 성공했습니다.",
          ""
        );
        if (overwrite === undefined) {
          console.log("이미지를 새로 추가하고 이미지를 state에 추가한다.");
          setUploadedFiles([...uploadedFiles, response.data.data.fileName]);
        } else {
          console.log("이미지만 갱신한다.");
          setUploadedFiles([...uploadedFiles]);
        }
      })
      .catch((error) => {
        // 업로드 중에 발생한 오류 처리
        CommonFunc.openNotification(
          "error",
          "파일 업데이트를 실패했습니다.",
          error.message
        );
      });
  };

  const getFileMimeType = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "webp":
        return "image/webp";
      case "webp2":
        return "image/webp";
      default:
        return "application/octet-stream";
    }
  };

  return (
    <Modal
      title="FileEditor"
      open={isUplodFileViewerVisible}
      cancelText="닫기"
      onCancel={closeModal}
      footer={null}
      width={1033}
    >
      <div
        style={{
          width: "100%",
          display: "inline-flex",
          justifyContent: "center",
          maxWidth: 1000,
          borderBottom: "1px solid rgb(240 240 240)",
          paddingBottom: "5px",
          marginBottom: "5px",
          marginTop: "-10px",
        }}
      >
        <div style={{ maxWidth: 1000 }}>
          {(() => {
            return uploadedFiles.map((file, index) => (
              <div className="header-img-item" key={file}>
                <img
                  src={
                    config.REACT_APP_SERVER_URL +
                    "/getUploadedFile" +
                    "/" +
                    issueIdx +
                    "/" +
                    file +
                    "?thumbnail=true" +
                    "&" +
                    Date.now()
                  }
                  title={file}
                  alt={file}
                  className={file === fileName ? "selected-img" : "normal-img"}
                  onClick={() => changeFile(file)}
                  onError={(event) => {
                    event.target.src = "/img/imgicon.png";
                    event.onerror = null;
                  }}
                />
              </div>
            ));
          })()}
        </div>
      </div>
      <div style={{ clear: "both", textAlign: "center" }}>
        <div>
          <a
            href={
              config.REACT_APP_SERVER_URL +
              "/getUploadedFile" +
              "/" +
              issueIdx +
              "/" +
              fileName
            }
          >
            {fileName}
            <img
              src="/img/download.webp"
              title={fileName}
              alt="download"
              className="btn-img-download"
            />
          </a>
          <br />
          <div
            style={{
              maxWidth: 1000,
              height: "800px",
              border: "solid 1px #efefef",
            }}
          >
            <ImageEditor
              ref={editorRef}
              includeUI={{
                loadImage: {
                  path:
                    config.REACT_APP_SERVER_URL +
                    "/getUploadedFile" +
                    "/" +
                    issueIdx +
                    "/" +
                    fileName +
                    "?" +
                    Date.now(),
                  name: fileName,
                },
                theme: myTheme,
                initMenu: "shape",
                uiSize: {
                  width: "1000px",
                  height: "800px",
                },
                menuBarPosition: "bottom",
              }}
              cssMaxHeight={550}
              cssMaxWidth={1000}
              selectionStyle={{
                cornerSize: 20,
                rotatingPointOffset: 70,
              }}
              usageStatistics={false}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UploadFileEditor;
