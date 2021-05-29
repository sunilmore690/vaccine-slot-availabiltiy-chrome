const chromium = require('chrome-aws-lambda')

exports.handler = async (event, context) => {
  const params = JSON.parse(event.body);
  const pageUrl = params.pageUrl;
  if(!pageUrl){
    return {
      statusCode: 200,
      body: JSON.stringify({
        available: false,
      }),
    };
  }
  let available = false;
  let browser = null
  console.log('spawning chrome headless')
  try {
    const executablePath = await chromium.executablePath

    // setup
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: executablePath,
      headless: chromium.headless,
    })
 
    // Do stuff with headless chrome
    const page = await browser.newPage()
     await page.setUserAgent(
       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
     );
     await page.goto(pageUrl, { waitUntil: "networkidle2" });
     //await page.waitForSelector(".result-loaded", { timeout: 5000 });
     await page.waitForTimeout(2000);

      available = await page.evaluate(() => {
       return document.querySelector(".got-result") ? true : false;
     });
     
    

  } catch (error) {
    console.log('error', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error
      })
    }
  } finally {
    // close browser
    if (browser !== null) {
      await browser.close()
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      available: available,
    })
  }
}
