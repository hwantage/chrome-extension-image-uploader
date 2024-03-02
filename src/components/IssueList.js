import React, { useState, useEffect } from "react";
import { Table } from "antd";
import ViewService from "../services/ViewService.js";
import * as CommonFunc from "../common/CommonFunc.js";
import moment from "moment";
const config = process.env;

const IssueList = (props) => {
  let [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    ViewService.getIssueList()
      .then((res) => {
        if (res.status === 200) {
          if (res.data !== "") {
            setDataSource(res.data);
          }
        }
      })
      .catch((e) => {
        CommonFunc.openNotification("error", "조회를 실패했습니다.", e.message);
      });
  }, [props.issueListRenderer]);

  const columns = [
    {
      title: "등록 일시",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "이슈 아이디",
      dataIndex: "issueIdx",
      key: "issueIdx",
    },
    {
      title: "내용",
      dataIndex: "contents",
      key: "contents",
    },
  ];
  return <Table dataSource={dataSource} columns={columns} rowKey="issueIdx" />;
};

export default IssueList;
