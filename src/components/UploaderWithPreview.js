import React, { useRef, useCallback, useState, useEffect } from "react";
import Uploady from "@rpldy/uploady";
import { useItemFinishListener, useItemProgressListener } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import { usePasteUpload } from "@rpldy/upload-paste";
import { Input } from "antd";
import { FileImageTwoTone, CloseSquareTwoTone } from "@ant-design/icons";
import * as CommonFunc from "../common/CommonFunc.js";
import ViewService from "../services/ViewService.js";
import UploadFileViewer from "./UploadFileViewer.js";
const config = process.env;

/**
 * @name UploaderWithPreview.js
 * @description
 * : Copy & Paste 또는 직접 파일 선택하여 업로드 하는 컴포넌트
 * : Preview 기능을 통해 업로드된 파일 확인(Custom 개발)
 * : https://react-uploady.netlify.app/
 * : https://react-uploady-storybook.netlify.app/?path=/story/welcome--page
 * @param {issueIdx} props
 * @returns <Uploady />
 * @author hwantage
 */

const PasteArea = (props) => {
  const containerRef = useRef(null);
  let [isFocused, setIsFocused] = useState(false); // Input Box 업로드 영역 활성/비활성 상태 관리
  let [uploadedFiles, setUploadedFiles] = useState([]); // 파일 목록 관리
  let [progressRate, setProgressRate] = useState(0);
  let [progressStatus, setProgressStatus] = useState(0);
  let [imageCacheRenderer, setImageCacheRenderer] = useState(0);

  useEffect(() => {
    ViewService.getFileList(props.issueIdx)
      .then((res) => {
        if (res.status === 200) {
          if (res.data !== "") {
            setUploadedFiles(res.data);
          }
        } else CommonFunc.openNotification("error", "조회를 실패했습니다.", "");
      })
      .catch((e) => {
        CommonFunc.openNotification("error", "조회를 실패했습니다.", e.message);
      });
  }, [props.issueIdx]);

  /**
   * onDeleteFile : 이미지 삭제 버튼 클릭 이벤트 처리
   * desc : <PreviewArea/> 컴포넌트에 전달되는 함수
   * pramas :
   *    fileName - 삭제된 이미지
   *    uploadedFiles - 이미지 목록 (현재 있는 함수의 state를 사용할 수 없어 하위 컴포넌트로 전달 후 다시 전달 받아야 함)
   * info : state를 변경 하더라도 PreviewArea 컴포넌트가 릴로드 되지 않아 마지막에 setIsFocused() 를 통해 강제 릴로드 처리.
   */
  const onDeleteFile = useCallback((fileName, uploadedFiles) => {
    let newUploadedFiles = uploadedFiles;
    const index = newUploadedFiles.findIndex(function (item) {
      return item === fileName;
    });
    if (index > -1) newUploadedFiles.splice(index, 1);
    setUploadedFiles([...newUploadedFiles]);
    setIsFocused(true);
    setIsFocused(false);
  }, []);

  useItemProgressListener((item) => {
    //callback is optional for this hook
    setProgressStatus(1);
    setProgressRate(item.completed);
    if (item.completed === 100) {
      setProgressStatus(0);
    }
    /*console.log(`item ${item.id} is ${item.completed}% done and ${item.loaded} bytes uploaded`);*/
  });

  /**
   * useItemFinishListener : 이미지 업로드 완료 이벤트 처리
   * desc : 업로드가 완료되면 호출됨.
   * pramas :
   *    result - <Uploady destination="url"/> 에 의해 처리된 결과 값
   * info : result 객체내의 uploadResponse 객체에 http Response 내용이 들어 있음. 이 값을 이용하여 이미지 목록 관리.
   */
  useItemFinishListener((result) => {
    // 업로드 완료 후 파일 목록 State 정보 갱신
    setUploadedFiles((uploadedFiles) => [
      ...uploadedFiles,
      result.uploadResponse.data.data.fileName,
    ]);
    CommonFunc.openNotification("success", "업로드가 완료됐습니다.", "");
  });

  usePasteUpload(props, containerRef, null);

  // 이미지 수정 팝업 닫기 한 경우 이미지 수정사항이 발생했을 수 있으니 파일 목록 다시 그리기
  const onEditCompleted = useCallback((changedFiles) => {
    setUploadedFiles((uploadedFiles) => [...changedFiles]);
    setIsFocused(true);
    setIsFocused(false);
    setImageCacheRenderer(imageCacheRenderer + 1);
  }, []);

  return (
    <>
      <div ref={containerRef}>
        <Input
          prefix={<FileImageTwoTone />}
          value={
            isFocused
              ? "붙여 넣기 가능"
              : "이 영역을 선택하시면 스크린샷을 붙여넣기 할 수 있습니다."
          }
          readOnly={true}
          className={isFocused ? "paste-uploader-focused" : "paste-uploader"}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
        ></Input>
        <UploadButton
          text="파일 직접 선택"
          className="ant-btn ant-btn-primary"
          params={{ issueIdx: props.issueIdx }}
        />
        <PreviewArea
          issueIdx={props.issueIdx}
          uploadedFiles={uploadedFiles}
          onDeleteFile={onDeleteFile}
          progressRate={progressRate}
          progressStatus={progressStatus}
          onEditCompleted={onEditCompleted}
          imageCacheRenderer={imageCacheRenderer}
        />
      </div>
    </>
  );
};
const PreviewArea = (props) => {
  let [isUplodFileViewerVisible, setIsUplodFileViewerVisible] = useState(false);
  let [modalRerender, setModalRerender] = useState(0);
  let [viewFileName, setViewFileName] = useState();
  let [progressRate, setProgressRate] = useState(0);
  let [progressStatus, setProgressStatus] = useState(0);

  useEffect(() => {
    setProgressRate(props.progressRate);
    setProgressStatus(props.progressStatus);
  }, [props.progressRate, props.progressStatus]);

  const deletePreview = async (fileName) => {
    let jsonData = {
      issueIdx: props.issueIdx,
      fileName: fileName,
    };

    ViewService.fileDelete(JSON.stringify(jsonData))
      .then((res) => {
        if (res.status === 200) {
          CommonFunc.openNotification("success", "삭제가 완료됐습니다.", "");
          // 업로드 완료 후 데이터 저장 처리 (props로 전달받은 부모 함수 onDeleteFile 호출)
          props.onDeleteFile(fileName, props.uploadedFiles);
        }
      })
      .catch((e) => {
        CommonFunc.openNotification("error", "삭제를 실패했습니다.", e.message);
      });
  };

  const showUploadFileViewer = (fileName) => {
    setIsUplodFileViewerVisible(true);
    setViewFileName(fileName);
    setModalRerender(++modalRerender);
  };

  // UploadFileEditor 모달 창 닫기시 호출될 펑션
  const closedUploadFileEditor = async (uploadedFiles) => {
    props.onEditCompleted(uploadedFiles);
  };

  return (
    <>
      <br />
      <div>
        {(() => {
          return props.uploadedFiles.map((fileName, index) => (
            <div key={fileName} style={{ float: "left", textAlign: "right" }}>
              <img
                src={
                  config.REACT_APP_SERVER_URL +
                  "/getUploadedFile" +
                  "/" +
                  props.issueIdx +
                  "/" +
                  fileName +
                  "?thumbnail=true" +
                  "&" +
                  props.imageCacheRenderer
                }
                title={fileName}
                alt="previewImage"
                style={{ display: "block", cursor: "pointer" }}
                onClick={() => showUploadFileViewer(fileName)}
                onError={(event) => {
                  event.target.src = "/img/imgicon.png";
                  event.onerror = null;
                }}
              />
              <CloseSquareTwoTone
                twoToneColor="red"
                style={{
                  marginRight: "3px",
                  marginTop: "-2px",
                }}
                onClick={() => {
                  deletePreview(fileName);
                }}
              />
            </div>
          ));
        })()}
        <div
          key="progress"
          style={{
            float: "left",
            textAlign: "right",
            display: progressStatus === 0 ? "none" : "block",
          }}
        >
          <img
            src="/img/imgicon.png"
            style={{ display: "block", cursor: "pointer" }}
          />
          <div
            style={{
              height: "3px",
              backgroundColor: "red",
              width: `${progressRate}%`,
            }}
          ></div>
        </div>
      </div>
      <div style={{ clear: "both" }}></div>
      <UploadFileViewer
        key={modalRerender}
        issueIdx={props.issueIdx}
        fileName={viewFileName}
        uploadedFiles={props.uploadedFiles}
        isUplodFileViewerVisible={isUplodFileViewerVisible}
        closedUploadFileEditor={closedUploadFileEditor}
      />
    </>
  );
};

const UploaderWithPreview = (props) => {
  return (
    <Uploady
      destination={{ url: config.REACT_APP_SERVER_URL + "/fileUpload" }}
      accept="image/*"
    >
      <PasteArea
        autoUpload={true}
        params={{ issueIdx: props.issueIdx }}
        issueIdx={props.issueIdx}
      />
    </Uploady>
  );
};

export default UploaderWithPreview;
