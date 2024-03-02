import { notification } from "antd";

/**
 * 지정된 유형, 메시지, 설명, 버튼, 키로 알림을 엽니다.
 *
 * @param {string} type - 알림의 유형입니다. 가능한 값은 'success', 'info', 'warning', 'error'입니다.
 * @param {string} message - 알림에 표시될 메시지입니다.
 * @param {string} description - 알림에 표시될 설명입니다.
 * @param {ReactNode} button - 알림에 표시될 버튼입니다.
 * @param {string} key - 알림의 고유 키입니다.
 * @returns {void}
 */
export function openNotification(type, message, description, button, key) {
  notification[type]({
    message: message,
    description: description,
    placement: "bottomLeft",
    duration: 5,
    btn: button,
    key: key,
  });
}

/**
 * 지정된 저장소에 값을 설정합니다.
 * 크롬 익스텐션 환경에서와 일반 브라우저 환경에서 모두 동작합니다.
 *
 * @param {string} key - 값을 설정할 키입니다.
 * @param {any} contents - 저장할 내용입니다.
 * @returns {void}
 */
export function setStorage(key, contents) {
  var value = {
    contents: contents,
  };

  let setObj = {};
  setObj[key] = value;
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set(setObj);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * 지정된 키와 연결된 값을 저장소에서 제거합니다.
 * 크롬 익스텐션 환경에서와 일반 브라우저 환경에서 모두 동작합니다.
 *
 * @param {string} key - 제거할 값의 키입니다.
 * @returns {void}
 */
export function removeStorage(key) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.remove(key);
  } else {
    localStorage.removeItem(key);
  }
}

/**
 * GUID (전역 고유 식별자)를 생성합니다.
 *
 * @returns {string} 생성된 GUID.
 */
export function generateGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
