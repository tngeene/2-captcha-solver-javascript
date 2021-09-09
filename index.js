require("chromedriver");
require("dotenv").config();
const Client = require("@infosimples/node_two_captcha");
const { Builder, By, Key, until } = require("selenium-webdriver");

const client = new Client(process.env.CAPTCHA_API_KEY, {
  timeout: 60000,
  polling: 5000,
  throwErrors: false,
});

const initiateCaptchaRequest = async () => {
  console.log("solving captcha...");
  try {
    client
      .decodeRecaptchaV2({
        googlekey: process.env.GOOGLE_CAPTCHA_KEY,
        pageurl: process.env.WEBSITE_URL,
      })
      .then(function (response) {
        //   if captcha is solved, launch selenium driver.
        launchSelenium(response);
      });
  } finally {
    //   do something
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function launchSelenium(response) {
  if (response) {
    console.log("Captcha Solved! Launching Browser instance...");
    let driver = await new Builder().forBrowser("chrome").build();
    // Navigate to Url
    await driver.get(process.env.WEBSITE_URL);

    await driver.findElement(By.id("name")).sendKeys("Ted");
    await driver.findElement(By.id("phone")).sendKeys("000000000");
    await driver.findElement(By.id("email")).sendKeys("tngeene@captcha.com");
    await driver.findElement(By.id("comment-content")).sendKeys("test comment");

    const gCaptchResponseInput = await driver.findElement(
      By.id("g-recaptcha-response")
    );
    await driver.executeScript(
      "arguments[0].setAttribute('style','type: text; visibility:visible;');",
      gCaptchResponseInput
    );

    await gCaptchResponseInput.sendKeys(`${response.text}`);

    await driver.executeScript(
      "arguments[0].setAttribute('style','display:none;');",
      gCaptchResponseInput
    );

    await driver.findElement(By.id("send-message")).click();

    // wait 8 seconds and close browser window
    await sleep(8000);

    driver.quit();
  } else {
    //   if no text return request time out message
    console.log("Request timed out.");
  }
}

(async function main() {
  const response = await initiateCaptchaRequest();
})();
