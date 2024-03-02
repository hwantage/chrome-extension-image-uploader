import axios from "axios";

class ViewService {
  // 파일 삭제
  fileDelete(data = "") {
    return axios({
      method: "post",
      url: process.env.REACT_APP_SERVER_URL + "/fileDelete/",
      params: data,
    });
  }

  // 파일 리스트 조회
  getFileList(data = "") {
    return axios.get(process.env.REACT_APP_SERVER_URL + "/getFileList/" + data);
  }

  // 이슈 저장
  saveIssue(data = "") {
    return axios({
      method: "post",
      url: process.env.REACT_APP_SERVER_URL + "/saveIssue/",
      params: data,
    });
  }

  getIssueList() {
    return axios.get(process.env.REACT_APP_SERVER_URL + "/getIssueList/");
  }
}

export default new ViewService();
