const logger = require('../../../logger')
const config = require('../../../config')
const setup = require('../../../setup')
const compareAndReview = require('../../compareAndReview')
const scraperUtils = require("../../scraperUtils")
const puppeteer = require('puppeteer')

const gracePeriod = (1000 * 60 * 60 * 24 * 2) // 2 days in ms
const _formatMoneyToYNAB = function(amount){
  return parseInt(amount.replace('$', '').replace(".", "").trim() + "0")
}

const doAmazonScrape = async function(oldestDate){
  logger.info("Beginning amazon scrape, this can take a moment")
  const oldestDateToScrape = Date.parse(oldestDate) - gracePeriod
  const browser = await puppeteer.launch({ headless: false }) // set to true to look nicer
  const page = await browser.newPage()
  await page.goto("https://www.amazon.com/cpe/yourpayments/transactions")

  await page.waitForSelector("#ap_email_login")
  await page.type("#ap_email_login", config.get("amazon_username"))
  await page.click("#continue")

  await page.waitForSelector("#ap_password")
  await page.type("#ap_password", config.get("amazon_password"))
  await page.click("#signInSubmit")
  try {
    await page.waitForSelector("#cpefront-mpo-widget")
  } catch (e) {
    logger.error("Your amazon login appears to be invalid, try running `ynab setup amazon` and updating your credentials.")
    process.exit(1)
    return
  }

  let keepProcessingOrders = true
  let transactions = []
  try {
    while (keepProcessingOrders) {
      await page.waitForSelector("#cpefront-mpo-widget > [data-pmts-component-id]")
      const { pageTransactions, currentWidgetId, foundOldestOrder } = await page.evaluate((oldestDate) => {
        let trans = []
        let foundOldestOrder = false
        // eg: originalDate = "February 4, 2022"
        // converts to: 2022-02-04
        const convertDate = (originalDate) => {
          let [monthDay, year] = originalDate.split(", ")
          let [monthPretty, daySimple] = monthDay.split(" ")
          const monthOpts = {
            "January": "01",
            "February": "02",
            "March": "03",
            "April": "04",
            "May": "05",
            "June": "06",
            "July": "07",
            "August": "08",
            "September": "09",
            "October": "10",
            "November": "11",
            "December": "12",
          }
          const month = monthOpts[monthPretty]
          const day = daySimple < 10 ? `0${daySimple}` : daySimple.toString()
          return `${year}-${month}-${day}`
        }
        document.querySelectorAll(".a-box-group").forEach((boxGroup) => {
          // continue the loop if it's the "pending" orders, or any other one we don't know about.
          if (boxGroup.querySelector(".a-box-title").innerText != "Completed") {
            return
          }
          boxGroup.querySelectorAll("[data-pmts-component-id].apx-transaction-date-container").forEach((part) => {
            const id = part.getAttribute("data-pmts-component-id")
            const transactionDate = convertDate(part.innerText)
            // if its equal to or newer than the oldest date we will accept, add it.
            if (oldestDate - Date.parse(transactionDate) <= 0) {
              document.querySelectorAll(`[data-pmts-component-id="${id}"] .apx-transactions-line-item-component-container`).forEach((item) => {
                const orderObject = item.querySelector(".a-link-normal")
                const totalObject = item.querySelector(".a-text-right")
                if (totalObject) {
                  trans.push({
                    date: transactionDate,
                    orderId: orderObject.innerText,
                    orderUrl: orderObject.getAttribute("href"),
                    total: totalObject.innerText,
                    refund: null, // not on this page anymore
                    items: [], // will fill in on next step
                  })
                }
              })
            } else {
              // if we are beyond the date we care about, don't keep moving through pages
              foundOldestOrder = true
            }
          })
        })
        // get the current widget id, since that's the only thing that changes between pages
        const currentWidgetId = document.querySelector("#cpefront-mpo-widget > [data-pmts-component-id]").getAttribute("data-pmts-component-id")
        return { pageTransactions: trans, currentWidgetId, foundOldestOrder }
      }, oldestDateToScrape)
      keepProcessingOrders = !foundOldestOrder
      transactions = transactions.concat(pageTransactions)
      if (keepProcessingOrders) {
        await page.click("#cpefront-mpo-widget .a-span-last .a-button-input")
        // since the click above does some JS, not a navigation, wait for the current JS to be replaced
        await page.waitForFunction((selector) => !document.querySelector(selector), {}, `#cpefront-mpo-widget > [data-pmts-component-id=${currentWidgetId}]`)
      }
    } // end while
  } catch (e) {
    logger.error("Amazon scrape failed to finish. ", e)
  }
  // to keep browser open for debugging, uncomment below:
  // console.log("Browser left open. Press Ctrl+C to exit.")
  // await new Promise(() => {})

  // now, for each transaction we care about, get the item details and otherwise transform the data
  for (let i in transactions) {
    const { orderUrl } = transactions[i]
    // change the total to a YNAB total
    transactions[i].total = _formatMoneyToYNAB(transactions[i].total)
    // Get the item details
    await page.goto(orderUrl)
    // URLS can go to several different types of pages depending on what the order is.
    // Most Common Regular orders
    if (orderUrl.includes("summary/edit.html")) {
      await page.waitForSelector("[data-component=shipments]")
      transactions[i].items = await page.evaluate(() => {
        let products = []
        document.querySelectorAll("[data-component=shipments] .a-col-right .a-row > .a-link-normal").forEach((link) => {
          products.push(link.innerText)
        })
        return products
      })
    }
    // for amazon digital orders
    else if (orderUrl.includes("order-details")) {
      try {
        await page.waitForSelector("#orderDetails")
        transactions[i].items = await page.evaluate(() => {
          let products = []
          document.querySelectorAll(".sample a").forEach((link) => {
            products.push(link.innerText)
          })
          return products
        })
      } catch (e) {
        console.warn(`Amazon DIGITAL order URL ${orderUrl} had issues, don't know how to proceed.`)
        transactions[i].items = [orderUrl]
      }
    }
    // otherwise, who knows? just look at the link manually
    else {
      console.warn(`Amazon order URL ${orderUrl} is unknown, don't know how to get products.`)
      transactions[i].items = [orderUrl]
    }
  }
  await browser.close()
  return transactions
}

module.exports = async function(allTransactions){
  logger.debug(`Beginning Scraping for Amazon`)
  if (!config.has('amazon_username') || !config.has('amazon_password')){
    logger.info("You will need to set up your amazon access first:")
    await setup.amazon()
  }
  let transactions = allTransactions.filter(t => (t.payee_name.includes('AMZN') || t.payee_name.includes("maz") || t.payee_name.includes("AMAZON")))
  if (transactions.length) {
    logger.title(`${transactions.length} Amazon Transactions Found to Review`)
    const oldestDate = transactions[0].date
    const orders = await doAmazonScrape(oldestDate)
    const matchingOrders = compareAndReview.getMatchingOrders(orders, transactions)

    await compareAndReview.reviewOrders(matchingOrders)
    scraperUtils.saveDebugData("matchingTransactions", matchingOrders)
    return matchingOrders
  }
  // Sometimes we might just be all done and not need to run a scrape.
  logger.success("No Amazon transactions found in YNAB.")
  return
}