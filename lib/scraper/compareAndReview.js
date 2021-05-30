const differenceInDays = require('date-fns/differenceInDays')
const prompts = require('prompts')
const Logger = require('../logger')
const { getYnabAPI, ourBudgetId, ourUncategorizedCategoryId } = require('../ynabAPI')

const getMatchingOrders = function (orders, transactions) {
  let matches = {
    likely: {},
    unsure: []
  }
  for (let i in transactions) {
    let transaction = transactions[i]
    let possibleOrders = orders.filter(o => o.total == transaction.amount)
    if (possibleOrders.length == 0) {
      matches.unsure.push({
        transaction,
        orders: [],
        reason: "no orders matching that total found"
      })
      continue
    }

    let inRangeOrders = possibleOrders.filter(order => Math.abs(differenceInDays(new Date(order.date), new Date(transaction.date))) < 5)

    if (inRangeOrders.length == 1) {
      matches.likely[transaction.id] = {
        transaction,
        order: inRangeOrders[0]
      }
    } else if (inRangeOrders.length > 1) {
      matches.unsure.push({
        transaction,
        orders: inRangeOrders,
        reason: "too many likely matches"
      })
    } else if (possibleOrders.length == 1){
      matches.likely[transaction.id] = {
        transaction,
        order: possibleOrders[0],
        reason: "Order is out of normal date range!"
      }
    } else {
      matches.unsure.push({
        transaction,
        orders: possibleOrders,
        reason: "no matches in date range"
      })
    }
  }

  return matches
}

const viewItemDetails = function(review){
  console.log(`-------------------------------
Amount: ${review.amount}
Current Memo: ${review.memo}
Items:
    * ${review.items.join("\n    *")}
`)
  // some have reasons to review
  if(review.reason){
    console.log(`** Note: ${review.reason} **`)
    console.log(" ")
  }
}
const setMemo = async function(review){
  const promptsOptions = { onCancel: () => { throw Error("cancel memos") } }
  viewItemDetails(review)
  let memo = await prompts({
    type: 'text', // this SHOULD be number but number is really broken so we are using text instead.
    name: 'value',
    message: `What's the Memo? ('s' to skip)`,
    min: 1,
    validate: value => value.length
  }, promptsOptions)

  if(memo.value == 's' || memo.value == 'skip'){
    return false
  }

  let areYouSure = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Are you sure you want to save this to YNAB?',
    initial: true
  }, promptsOptions)

  if(areYouSure.value){
    return memo.value
  }
  // retry this one
  return await setMemo(review)
}

const saveTransaction = function(transaction){
  return getYnabAPI()
    .then(api => api.transactions.updateTransaction(ourBudgetId(), transaction.id, { transaction }))
    .then(resp => {
      Logger.success("Saved Successfully!")
    })
    .catch(err => {
      console.error(err)
      Logger.error("Caught an error saving transaction to YNAB", err)
    })
}


const reviewLikelyOrders = async function(matchingOrders) {
  const likelyOrders = Object.values(matchingOrders.likely)
  try {
    for (let i in likelyOrders) {
      const order = likelyOrders[i]
      let review = {
        amount: (order.transaction.amount / 1000),
        items: order.order.items,
        memo: order.transaction.memo || "",
        reason: order.reason || ""
      }
      let newMemo = await setMemo(review)
      if (newMemo) {
        let transaction = {
          id: order.transaction.id,
          memo: newMemo,
          category_id: ourUncategorizedCategoryId(), // to keep the category uncategorized, we need to pass in this id, weirdly.
        }
        // actually save to ynab
        await saveTransaction(transaction)
      }
    }
  } catch (e) {
    if (e.message = "cancel memos") {
      return
    }
    Logger.error("Caught an error adding likely memos to YNAB.", e)
  }
}

const reviewUnsureOrders = async function (matchingOrders) {
  const unsureOrders = matchingOrders.unsure.map(order => {
    return {
      issue: order.reason,
      matches: order.orders.length,
      amount: (order.transaction.amount / 1000),
      date: order.transaction.date
    }
  })
  Logger.title(`${unsureOrders.length} Order(s) Remain unclear:`)
  console.table(unsureOrders)
}

const reviewOrders = async function (matchingOrders) {
  try {
    if (matchingOrders.likely && Object.values(matchingOrders.likely).length) {
      await reviewLikelyOrders(matchingOrders)
      Logger.success("Finished Reviewing Likely Orders")
    } else {
      Logger.success("No Likely Matches found")
    }
    await reviewUnsureOrders(matchingOrders)
  } catch(e){
    Logger.error("Caught an error reviewing orders.")
  }
}

module.exports = {
  getMatchingOrders,
  reviewOrders,
}