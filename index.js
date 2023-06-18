const puppeteer = require('puppeteer');
const QRCode = require('qrcode');

(async () => {

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://web.whatsapp.com/', {
        waitUntil: "domcontentloaded",
    });
    const data = await page.waitForSelector('[data-testid="qrcode"]');
    const newData = await page.waitForSelector('canvas');
    let OldQRdata = await page.evaluate(() => {
        let qrEle = document.querySelector('[data-testid="qrcode"]').getAttribute('data-ref');
        return qrEle;
    });
    console.log(OldQRdata);


 
    async function getQrCode() {

        let NewQRcode = await page.evaluate(() => {
            let qrEle = document.querySelector('[data-testid="qrcode"]');
            if (qrEle !== null) {
                qrEle = qrEle.getAttribute("data-ref");
                return qrEle;
            } else {
                return null;
            }

        });
        let refreshBtn = await page.evaluate(() => {
            let refresh = document.querySelector('[data-testid="refresh-large"]');
            return refresh;
        });
        //  QRCode.toString(qrdata, function (err, url) { console.log(url) });
        if (OldQRdata === NewQRcode) {
        } else {
            if (NewQRcode === null) {
                if (refreshBtn !== null) {
                    await page.evaluate(() => {
                        document.querySelector('[data-testid="refresh-large"]').click();
                    });
                    clearInterval(getQrCode);
                } else {
                    //user is logged in
                    clearInterval(getQrCode);
                    console.log("user is logged in");
                    setTimeout(
                        async () => {
                            let sendSms = await page.evaluate(() => {
                                let element = document.createElement('a');
                                element.href = `https://api.whatsapp.com/send?phone=919999999999&text=Your%20message`;
                                element.id = "contactElement";
                                document.body.append(element);
                                document.getElementById('contactElement').click();
                            });
                            const waitForSendBtn = await page.waitForSelector('[data-testid="send"]');
                            let clickSend = await page.evaluate(() => {
                                document.querySelectorAll('[data-testid="send"]')[0].click();
                            });

                        }, 60000)
                }
            }
            console.log(NewQRcode);
        }
        OldQRdata = NewQRcode;
    }

    setInterval(getQrCode, 2000);
    // await browser.close();
})();
