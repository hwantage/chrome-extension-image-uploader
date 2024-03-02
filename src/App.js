import React, { useState, useEffect } from "react";
import { Modal, Input, Button } from "antd";
import UploaderWithPreview from "./components/UploaderWithPreview";
import IssueList from "./components/IssueList.js";
import "./css/App.css";
import * as CommonFunc from "./common/CommonFunc.js";
import ViewService from "./services/ViewService.js";

const { TextArea } = Input;

const App = (props) => {
  const [issueIdx, setIssueIdx] = useState("");
  const [inputIssue, setInputIssue] = useState("");
  const [isIssueModalVisible, setIsIssueModalVisible] = useState(true);
  const [issueListRenderer, setIssueListRenderer] = useState(0);

  useEffect(() => {
    initIssueIdx();
  }, []);

  const initIssueIdx = () => {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      chrome.storage.local.get(["inprogress"], function (result) {
        var data = result["inprogress"];
        if (data) {
          const key = result["inprogress"].contents; // inprogress 상태의 이슈 아이디
          // key 값으로 기존 작성중인 내용을 가져온다.
          chrome.storage.local.get([key], function (res) {
            if (data) {
              setIssueIdx(key);
              setInputIssue(res[key].contents); // 기존 작성중이던 메모 재현
            } else {
              generateNewIssueIdx();
            }
          });
        } else {
          generateNewIssueIdx();
        }
      });
    } else {
      const inprogress = localStorage.getItem("inprogress");
      if (inprogress) {
        const key = JSON.parse(inprogress).contents;
        const data = localStorage.getItem(key);
        if (data) {
          setIssueIdx(key);
          setInputIssue(JSON.parse(data).contents);
        } else {
          generateNewIssueIdx();
        }
      } else {
        generateNewIssueIdx();
      }
    }
  };

  // 새 이슈 아이디 채번
  const generateNewIssueIdx = () => {
    const newIssueIdx = CommonFunc.generateGuid(); // 신규 이슈 아이디 채번
    setIssueIdx(newIssueIdx);
    CommonFunc.setStorage(newIssueIdx, "");
    CommonFunc.setStorage("inprogress", newIssueIdx); // 현재 이슈 아이디를 작성중인 정보로 저장 시킴. 추후 창을 닫고 재 진입시 이어서 작성 가능.
  };

  // 이슈 저장 처리
  const saveIssue = () => {
    if (confirm("작성하신 내용을 제출하시겠습니까?")) {
      CommonFunc.setStorage(issueIdx, inputIssue);
      let jsonData = {
        issueIdx: issueIdx,
        inputIssue: inputIssue,
      };
      ViewService.saveIssue(JSON.stringify(jsonData))
        .then((res) => {
          if (res.status === 200) {
            CommonFunc.openNotification("success", "저장이 완료됐습니다.", "");
            CommonFunc.removeStorage("inprogress"); // 작성중인 정보를 초기화 한다.
            setInputIssue("");
            setIsIssueModalVisible(false); // 창 닫기
            setIssueListRenderer(issueListRenderer + 1); // 테이블 갱신
          }
        })
        .catch((e) => {
          CommonFunc.openNotification(
            "error",
            "저장을 실패했습니다.",
            e.message
          );
        });
    }
  };

  // 취소 버튼 클릭. 창 닫기 처리
  const closeIssueModal = () => {
    setIsIssueModalVisible(false);
    CommonFunc.setStorage(issueIdx, inputIssue); // 현재 이슈 아이디를 작성중인 정보로 저장 시킴. 추후 창을 닫고 재 진입시 이어서 작성 가능.
  };

  return (
    <>
      <Button
        type="primary"
        size="small"
        className="ui-btn"
        onClick={() => {
          initIssueIdx();
          setIsIssueModalVisible(true);
        }}
      >
        UI 신고
      </Button>

      {issueIdx && (
        <Modal
          title="UI 신고"
          open={isIssueModalVisible}
          okText="확인"
          cancelText="취소"
          onOk={saveIssue}
          onCancel={closeIssueModal}
          width={700}
        >
          <TextArea
            type="text"
            rows={10}
            value={inputIssue}
            onChange={(e) => {
              setInputIssue(e.target.value);
            }}
          ></TextArea>
          <div style={{ width: "100%", textAlign: "right" }}>
            <Button
              type="text"
              size="small"
              className="tt-btn"
              disabled={inputIssue ? false : true}
              onClick={() => {
                setInputIssue("");
              }}
            >
              내용 삭제
            </Button>
          </div>
          <span className="uploader">
            <UploaderWithPreview key={issueIdx} issueIdx={issueIdx} />
          </span>
        </Modal>
      )}

      <IssueList issueListRenderer={issueListRenderer} />
    </>
  );
};

export default App;
