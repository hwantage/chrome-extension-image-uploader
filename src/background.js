// 익스텐션 아이콘을 클릭해서 창을 여는 경우 이벤트 처리
async function start() {
  const currentWindow = await chrome.windows.getCurrent();
  chrome.windows.create({
    url: "index.html",
    width: currentWindow.width,
    height: currentWindow.height,
    type: "popup",
  });
}
chrome.action.onClicked.addListener(start);

// 웹페이지에서 UI 신고 버튼 클릭 이벤트 처리
async function buttonClick(request, sender, sendResponse) {
  if (request.action === "buttonClicked") {
    //console.log("이메일 : ", request.email);
    chrome.windows.create({
      url: "index.html",
      type: "popup",
      width: 1000,
      height: 1000,
    });
  }
}
chrome.runtime.onMessage.addListener(buttonClick);
