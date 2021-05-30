const logger = require('../../logger')
const cheerio = require('cheerio')
const fs = require("fs")
const compareAndReview = require('../compareAndReview')
const path = require("path")
const scraperUtils = require("../scraperUtils")

const _formatMoneyToYNAB = function(amount){
  return parseInt("-" + amount.replace('$', '').replace(".", "").trim() + "0")
}

const getScrapedFile = function(){
  let scrapePath = path.join(scraperUtils.scraperBasePath, "amazon")
  let theFile = ""
  fs.readdirSync(scrapePath).forEach(fileName => {
    if(fileName.indexOf('.html') != -1){
      theFile = fs.readFileSync(path.join(scrapePath, fileName), "utf-8")
    }
  })
  return theFile
}

module.exports = async function(allTransactions){
  logger.debug(`Beginning Scraping for Amazon`)
  const ordersHTML = getScrapedFile()
  if(!ordersHTML){
    logger.warn("Please add scraped .html file to scraper/amazon (see readme for more details)");
    return
  }
  const $ = cheerio.load(ordersHTML)

  let orders = []
  $('table tr').each((i, tr) => {
    let tds = $(tr).find('td')
    const td = {
      'orderId': 0,
      'items': 1,
      'date': 3,
      'total': 4,
      'refund': 9,
      'payments': 10
    }

    let paymentsRaw = $(tds[td.payments]).text()
    let paymentDetail = paymentsRaw.split(';')
    let paymentDetails = []
    for(let i in paymentDetail){
      let detail = paymentDetail[i].split(":")
      if(detail.length == 3){
        paymentDetails.push({
          method: detail[0].trim(),
          date: detail[1].trim(),
          total: _formatMoneyToYNAB(detail[2]),
        })
      }
    }
    
    orders.push({
      orderId: $(tds[td.orderId]).text(),
      items: $(tds[td.items]).text().split(";").filter(i => i.trim().length),
      date: $(tds[td.date]).text(),
      total: _formatMoneyToYNAB($(tds[td.total]).text()),
      refund: _formatMoneyToYNAB($(tds[td.refund]).text()),
      payments: $(tds[td.payments]).text(),
      paymentDetails: paymentDetails
    })
  })

  scraperUtils.saveDebugData("amazon_orders", orders)

  let transactions = allTransactions.filter(t => (t.payee_name.includes('AMZN') || t.payee_name.includes("maz")))
  if(transactions.length){
    logger.title(`${transactions.length} Amazon Transactions Found to Review`)
    
    let matchingOrders = compareAndReview.getMatchingOrders(orders, transactions)

    await compareAndReview.reviewOrders(matchingOrders)
    scraperUtils.saveDebugData("matchingTransactions", matchingOrders)
    return matchingOrders
  }

  // Sometimes we might just be all done and not need to run a scrape.
  logger.success("No Amazon transactions found in YNAB.")
  return
}