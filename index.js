const puppeteer = require('puppeteer-extra')
const express = require('express')
const app = express()
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

let inChat = false

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

let page
;(function run() {
    puppeteer.launch({ headless: false }).then(async browser => {
        try {
            page = await browser.newPage()
            //await page.setViewport({ width: 1920, height: 1080 })
            await page.goto('https://chat.openai.com/chat')
            // Abuse the fact their authentication isn't asked every time
            await page.waitForSelector('button.btn.relative.btn-primary', { timeout: 5000 })
            await timeout(1000)
            await page.click('button.btn.relative.btn-primary')

            // Google Sign In
            await page.waitForNavigation()
            await page.waitForSelector('button[type="submit"][data-provider="google"]')
            await page.click('button[type="submit"][data-provider="google"]')

            await page.waitForNavigation()
            await page.waitForSelector('input[type="email"]')
            await timeout(1000)
            await page.type('input[type="email"]', process.env.Google_Username)
            await page.keyboard.press('Enter')

            await page.waitForNavigation()
            await page.waitForSelector('input[type="password"]')
            await timeout(1000)
            await page.type('input[type="password"]', process.env.Google_Password)
            await page.keyboard.press('Enter')

            // Chat
            await page.waitForNavigation()
            for (let i = 0; i < 4; i++) {
                await page.waitForSelector('button.btn.relative.ml-auto')
                await page.click('button.btn.relative.ml-auto')
            }

            if (process.env.Name_Of_Chat) {
                console.log(`//div[text()="${process.env.Name_Of_Chat}"]`)
                await timeout(500)
                await (await page.$x(`//div[text()="${process.env.Name_Of_Chat}"]`))[0].click()
            }

            await page.waitForNavigation()
            await timeout(1000)
            inChat = true
        } catch (e) {
            // If it didn't work this time run it again
            await browser.close()
            return run()
        }
    })
})()
//document.querySelector('label.ctp-checkbox-label>input').click()

app.get('/:phrase', async (req, res) => {
    if (!inChat) {
        return res.status(500).send("Bot still hasn't joined the chat")
    }

    await page.type('form>div>div>textarea', req.params.phrase)
    await page.keyboard.press('Enter')
    await timeout(3000)
    res.status(200).send(
        await page.evaluate(
            document => [...document.querySelectorAll('div.markdown.prose.w-full.break-words')].slice(-1)[0]
        )
    )
})

app.listen(process.env.PORT || 8080, () => {
    console.log(`App listening at port ${process.env.PORT || 8080}`)
})
