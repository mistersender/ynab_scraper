const { getYnabAPI, ourBudgetId, ourUncategorizedCategoryId } = require('../ynabAPI.js')
const { getMatchingOrders, getMatchingTransactions } = require('./compareAndReview')
const scraperUtils = require("./scraperUtils")
const Logger = require('../logger')
const _formatMoneyToYNAB = function (amount) {
  amount = parseFloat(amount).toFixed(2)
  return parseInt(amount.replace('$', '').replace(".", "").trim() + "0")
}
const go = async function () {

  // Get All Transactions:
  // const ynabAPI = await getYnabAPI()
  // const transactionsResp = await ynabAPI.transactions.getTransactions(ourBudgetId())
  // scraperUtils.saveDebugData("allYNABTrans", transactionsResp)

  // Filter Transactions:
  // const ynabData = require('../../scraper/temp/allYNABTrans.json')
  // const trans = ynabData.data.transactions
  // const startDate = new Date('2022-10-31')
  // const endDate = new Date('2023-01-01')
  // const isInRange = function (dt) {
  //   const currentDt = new Date(dt)
  //   return currentDt > startDate && currentDt < endDate
  // }
  // let inRangeOrders = trans.filter(t => isInRange(t.date) && t.account_name === 'Main Credit Card')
  // scraperUtils.saveDebugData("allNovDec", inRangeOrders)
  // Logger.success(`Sucess. ${inRangeOrders.length}`)

  // Compare Transactions:
  const ynabTransactions = require('../../scraper/temp/allNovDec.json')
  const chaseTransactions = require('../../scraper/temp/chaseNovDec.json')
  Logger.info(`YNAB Total Transactions: ${ynabTransactions.length}; Chase Total Transactions: ${chaseTransactions.length}, diff: ${chaseTransactions.length - ynabTransactions.length}`)
  
  let orderId = 0
  const chaseOrders = chaseTransactions.map((t) => {
    orderId++
    return {
      "date": t['Post Date'],
      "orderId": orderId,
      "total": _formatMoneyToYNAB(t.Amount),
      "description": t.Description
    }
  })
  const matchedYNAB = getMatchingTransactions(chaseOrders, ynabTransactions, 2)
  scraperUtils.saveDebugData("tempMatchesInYNAB", matchedYNAB)
  Logger.info(`Chase Transactions Found in YNAB: ${Object.keys(matchedYNAB.likely).length},  unsure ${matchedYNAB.unsure.length}, none ${matchedYNAB.none.length}`)

  const matchedChase = getMatchingOrders(chaseOrders, ynabTransactions, 2)
  scraperUtils.saveDebugData("tempMatchesInChase", matchedChase)
  Logger.info(`YNAB Transactions Found in Chase: ${Object.keys(matchedChase.likely).length},  unsure ${matchedChase.unsure.length}`)

  
  Logger.success(`Finished YNAB: ${ynabTransactions.length}, Chase: ${chaseTransactions.length}, diff: ${chaseTransactions.length - ynabTransactions.length}`)

  let dates = {}
  matchedYNAB.none.forEach(n => {
    dates[n.order.date] ? dates[n.order.date]++ : dates[n.order.date] = 1
  })
  Logger.info(dates)
}
go()