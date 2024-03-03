import React, { useState } from "react";
import { Modal } from "antd";
const config = process.env;

const UploadFileViewer = (props) => {
  const [fileName, setFileName] = useState(props.fileName);
  const [isUplodFileViewerVisible, setIsUplodFileViewerVisible] = useState(
    props.isUplodFileViewerVisible
  );
  const [uploadedFiles] = useState(props.uploadedFiles);
  const [issueIdx] = useState(props.issueIdx);
  const [imgOnError, setImgOnError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const changeFile = (file) => {
    if (file !== fileName) {
      setImageLoading(true);
      setFileName(file);
      setImgOnError(false);
    }
  };

  const closeModal = () => {
    setIsUplodFileViewerVisible(false);
  };

  return (
    <Modal
      title="File Viewer"
      open={isUplodFileViewerVisible}
      cancelText="닫기"
      onCancel={closeModal}
      footer={null}
      width={1050}
    >
      <div className="header-img-list">
        <div style={{ maxWidth: 1000 }}>
          {(() => {
            return uploadedFiles.map((file, index) => (
              <div className="header-img-item" key={file}>
                <img
                  src={
                    config.REACT_APP_SERVER_URL +
                    "/getUploadedFile" +
                    "/" +
                    props.issueIdx +
                    "/" +
                    file +
                    "?thumbnail=true"
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
              props.issueIdx +
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
          <img
            src={
              config.REACT_APP_SERVER_URL +
              "/getUploadedFile" +
              "/" +
              props.issueIdx +
              "/" +
              fileName
            }
            title={fileName}
            alt={fileName}
            style={{
              maxWidth: 1000,
              display: imageLoading ? "none" : "initial",
            }}
            onLoad={() => setImageLoading(false)} // 이미지 로딩 완료 시 상태 변경
            onError={(event) => {
              event.target.src = "/img/imgicon.png";
              event.onerror = null;
              setImgOnError(true);
            }}
          />
          {imageLoading ? (
            <span>
              <br />
              Loading...
            </span>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default UploadFileViewer;
