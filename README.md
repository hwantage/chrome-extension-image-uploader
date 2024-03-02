# 크롬 익스텐션 UI 문제점 신고 기능

Create-react-app 으로 시작한 코드입니다.

CRA 에서 크롬 익스텐션 개발을 위한 환경을 제공합니다. (Boilerplate code)

React 환경으로 크롬 익스텐션을 개발 해 볼 수 있으며, 로컬 브라우저에서 테스트 및 크롬 익스텐션에서의 동작이 모두 가능하도록 구현되었습니다.

다음과 같은 기능을 포함합니다.

- CRA 환경에서 시작하였음.
- 크롬 익스텐션 아이콘을 클릭해서 전체 새창으로 창을 띄울 수 있음.
- 웹 사이트에서 특정 버튼을 클릭한 경우 팝업 창으로 UI를 띄울 수 있음.
- 작성중인 내용을 storage에 저장하여 창이 닫힌 후 다시 열릴때 입력 내용을 유지합니다. (로컬 환경에서는 localStorage를 이용하도록 처리됩니다.)
- 크롬 익스텐션 관련 API 사용시 발생하는 에러가 발생하지 않도록 처리 (.eslintrc.js)
- content.js 파일과 background.js 파일이 최종 build 디렉토리에 복사되지 않기 때문에 build 이후 파일을 copy 하도록 처리하였음.(copy-files.js)
- antd 를 이용하여 UI 를 구성하였음.
- 이미지 업로드 기능을 제공. 별도의 서버 실행이 필요합니다.(서버 소스 포함)
- 로컬 테스트가 가능하도록 코드를 배포합니다.
- 이미지 선택 업로드 뿐만 아니라 클립보드 내용을 copy & paste 로 업로드 처리가 가능합니다.

## Installation

clone my project

### `git clone https://github.com/hwantage/chrome-extension-image-uploader`

소스 코드를 다운로드 합니다.

### `npm install`

관련 라이브러리를 설치합니다.

### `npm run server`

이미지를 처리하는 서버를 실행합니다. 기본 포트는 3000 포트로 동작합니다. `.env` 파일에서 포트를 변경할 수 있습니다.

### `npm run start`

웹 UI를 실행합니다. 2024포트에서 동작합니다. `package.json` 파일에서 포트 설정을 변경할 수 있습니다.

### `npm run build`

빌드를 수행합니다. `build` 디렉토리를 크롬 확장 프로그램 관리에서 `압축해제된 확장 프로그램을 로드합니다.` 를 선택하여 익스텐션에 등록합니다.

(npm run start 로 로컬에서 잘 동작하는 것을 확인 후 npm run build 결과를 크롬 익스텐션으로 등록)
