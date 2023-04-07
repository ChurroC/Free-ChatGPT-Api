const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// puppeteer usage as normal
puppeteer.launch({ headless: true }).then(async browser => {
    const page = await browser.newPage()
    page.screenshot({ path: 'update.png' })
    await page.goto('https://chat.openai.com/chat')
    page.screenshot({ path: 'update.png' })
    await page.waitForSelector('button.btn.relative.btn-primary')
    page.screenshot({ path: 'update.png' })
})
