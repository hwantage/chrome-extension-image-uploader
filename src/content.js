var button = document.getElementsByName("submit-button")[0];

if (button) {
  button.addEventListener("click", function () {
    var email = document.getElementById("email").value;
    chrome.runtime.sendMessage({ action: "buttonClicked", email: email });
  });
}
