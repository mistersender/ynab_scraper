const logger = require('../../../logger')
const config = require('../../../config')
const setup = require('../../../setup')
const compareAndReview = require('../../compareAndReview')
const scraperUtils = require("../../scraperUtils")
const puppeteer = require('puppeteer')


const gracePeriod = (1000 * 60 * 60 * 24 * 2) // 2 days in ms
const _formatMoneyToYNAB = function (amount) {
  return parseInt(amount.replace('$', '').replace(".", "").trim() + "0")
}

const doSiteScrape = async function (oldestDate) {
  logger.info("Beginning chewy scrape, this can take a moment")
  const oldestDateToScrape = Date.parse(oldestDate) - gracePeriod
  const browser = await puppeteer.launch({ headless: false }) // set to false to debug easier
  const page = await browser.newPage()
  await page.goto('https://www.chewy.com/app/account/orderhistory')

  await page.waitForSelector('#username')
  await page.click('#username')
  await page.type('#username', config.get('chewy_username'))

  await page.waitForSelector('#password')
  await page.click('#password')
  await page.type('#password', config.get('chewy_password'))
  await new Promise(r => setTimeout(() => r(), 1000))
  await page.click('#form-login--submit-button')
  try {
    await page.waitForSelector('.order-list')
  } catch (e) {
    logger.error("Your chewy login appears to be invalid, try running `ynab setup chewy` and updating your credentials.")
    process.exit(1)
  }

  const transactions = await page.evaluate((oldestDate) => {
    let trans = []
    // eg: originalDate = "February 4, 2022" 
    // converts to: 2022-02-04
    const convertDate = originalDate => {
      let [monthDay, year] = originalDate.split(', ')
      let [monthPretty, daySimple] = monthDay.split(" ")
      const monthOpts = {
        'January': '01',
        'February': '02',
        'March': '03',
        'April': '04',
        'May': '05',
        'June': '06',
        'July': '07',
        'August': '08',
        'September': '09',
        'October': '10',
        'November': '11',
        'December': '12'
      }
      const monthOptsShort = {
        'Jan': '01',
        'Feb': '02',
        'Mar': '03',
        'Apr': '04',
        'May': '05',
        'Jun': '06',
        'Jul': '07',
        'Aug': '08',
        'Sep': '09',
        'Oct': '10',
        'Nov': '11',
        'Dec': '12'
      }
      const month = monthOpts[monthPretty] || monthOptsShort[monthPretty]
      const day = daySimple < 10 ? `0${daySimple}` : daySimple.toString()
      return `${year}-${month}-${day}`
    }
    document.querySelectorAll('.order-list .order-list__order header a').forEach(orderLink => {
      const orderId = orderLink.getAttribute('href').split('orderID=')[1]
      const orderDateRaw = orderLink.querySelector('div p').innerText.split("Placed on ")[1]
      const transactionDate = convertDate(orderDateRaw)
      if (oldestDate - Date.parse(transactionDate) <= 0) {
        trans.push({
          date: transactionDate,
          orderId,
          orderUrl: `https://www.chewy.com/app/account/order-details/invoice?orderID=${orderId}`,
          total: null,
          refund: null, // not on this page anymore
          items: [], // will fill in on next step
        })
      }
      else {
        // if we are beyond the date we care about, don't keep moving through pages
        return
      }
    })
    return trans
  }, oldestDateToScrape)

  console.log("transactions", transactions)

  return transactions
  
  // TODO: 1. chewy is onto us, it knows we're scraping.
  // gotta loop over transactions and use the pages. here's a good test one:
  // https://www.chewy.com/app/account/order-details/invoice?orderID=1156854631

  // now, for each transaction we care about, get the item details and otherwise transform the data
  for (let i in transactions) {
    const { orderUrl } = transactions[i]
    // change the total to a YNAB total
    transactions[i].total = _formatMoneyToYNAB(transactions[i].total)
    // Get the item details
    await page.goto(orderUrl)
    // URLS can go to several different types of pages depending on what the order is.
    // Most Common Regular orders
    if (orderUrl.includes('summary/edit.html')) {
      await page.waitForSelector('.shipment')
      transactions[i].items = await page.evaluate(() => {
        let products = []
        document.querySelectorAll('.shipment .a-col-right .a-row > .a-link-normal').forEach(link => {
          products.push(link.innerText)
        })
        return products
      })
    }
    // for chewy digital orders
    else if (orderUrl.includes('order-details')) {
      await page.waitForSelector('#digitalOrderSummaryContainer')
      transactions[i].items = await page.evaluate(() => {
        let products = []
        document.querySelectorAll('.sample a').forEach(link => {
          products.push(link.innerText)
        })
        return products
      })
    }
    // otherwise, who knows? just look at the link manually
    else {
      console.warn(`Chewy order URL ${orderUrl} is unknown, don't know how to get products.`)
      transactions[i].items = [orderUrl]
    }
  }
  await browser.close()
  return transactions
}

module.exports = async function (allTransactions) {
  logger.debug(`Beginning Scraping for Chewy`)
  if (!config.has('chewy_username') || !config.has('chewy_password')) {
    logger.info("You will need to set up your chewy access first:")
    await setup.chewy()
  }
  let transactions = allTransactions.filter(t => (t.payee_name.includes('CHEWY.COM')))
  if (transactions.length) {
    logger.title(`${transactions.length} Chewy Transactions Found to Review`)
    const oldestDate = transactions[0].date
    const orders = await doSiteScrape(oldestDate)
    console.log(orders)
    // const matchingOrders = compareAndReview.getMatchingOrders(orders, transactions)

    // await compareAndReview.reviewOrders(matchingOrders)
    // scraperUtils.saveDebugData("matchingTransactions", matchingOrders)
    // return matchingOrders
  }
  // Sometimes we might just be all done and not need to run a scrape.
  logger.success("No Chewy transactions found in YNAB.")
  return
}