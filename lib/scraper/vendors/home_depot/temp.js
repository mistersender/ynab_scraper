const logger = require("../../../logger")
const config = require("../../../config")
const setup = require("../../../setup")
const compareAndReview = require("../../compareAndReview")
const scraperUtils = require("../../scraperUtils")
// const puppeteer = require("puppeteer")
const puppeteer = require("puppeteer-extra")
const StealthPlugin = require("puppeteer-extra-plugin-stealth")

const gracePeriod = 1000 * 60 * 60 * 24 * 2 // 2 days in ms
const _formatMoneyToYNAB = function (amount) {
  return parseInt(amount.replace("$", "").replace(".", "").trim() + "0")
}

const getOrders = async function (oldestDate) {
  const response = await fetch("https://www.homedepot.com/oms/customer/order/v1/user/041AF4745E7176540U/orderhistory", {
    "headers": {
      "accept": "application/json",
      "authorization": "RPOmHEDmoiLWFWq7jD65WqC2yiw.*AAJTSQACMDIAAlNLABxRSWt2bkZlRUsxenpIRHpIN0o3ZU1QeFQ0NFU9AAR0eXBlAANDVFMAAlMxAAIwNw..*",
      "content-type": "application/json",
      "cookie":
        "HD_DC=origin;
        akacd_usbeta=3916309645~rv=78~id=47bfefe54669e151ad4b959d78f50cf4;
        THD_CACHE_NAV_PERSIST=;
        _pxvid=aa9554eb-e4a1-11ef-8b96-7787caa1f511;
        AMCV_F6421253512D2C100A490D45%40AdobeOrg=MCMID|44599781805039209072029057124075161398;
        thda.s=f2399f24-e183-02fc-2a25-47e00a364606;
        thda.u=112969d3-64ac-0579-be54-6480d8afba52;
        _px_f394gi7Fvmc43dfg_user_id=YWIzYmRmMzAtZTRhMS0xMWVmLTgyZmQtNTUxZGRhOTg0MGVi;
        ajs_anonymous_id=4bef9410-b2f8-4958-8cd0-ab2ce271a3a9;
        PIM-SESSION-ID=Xfc6sldYgxl7YATB;
        ftr_ncd=6;
        THD_NUGGET=112969d3-64ac-0579-be54-6480d8afba52;
        X-AK-PIM-INJECT=sync;
        QuantumMetricUserID=b5b924a0c917b6b0e2ab48583f156474;
        _gcl_au=1.1.2134715244.1738856916;
        QSI_SI_2lVW226zFt4dVJ3_intercept=true;
        THD_MCC_ID=32453825-cdc3-48fe-a65f-c5758aa03444;
        _gac_UA-32593878-1=1.1742393845.Cj0KCQjw1um-BhDtARIsABjU5x6nkb2Ud1H2HPC_OnTR-0gQYzT0wd6ZEriruG80uOZYbsHu84wW2MsaAtwAEALw_wcB;
        _gcl_aw=GCL.1742393845.Cj0KCQjw1um-BhDtARIsABjU5x6nkb2Ud1H2HPC_OnTR-0gQYzT0wd6ZEriruG80uOZYbsHu84wW2MsaAtwAEALw_wcB;
        _gcl_dc=GCL.1742393845.Cj0KCQjw1um-BhDtARIsABjU5x6nkb2Ud1H2HPC_OnTR-0gQYzT0wd6ZEriruG80uOZYbsHu84wW2MsaAtwAEALw_wcB;
        _gcl_gs=2.1.k1$i1742393834$u81939855;
        _ga=GA1.1.1752429371.1738856914;
        _ga_9H2R4ZXG4J=GS1.1.1742392983.6.1.1742393860.44.0.0;
        DELIVERY_ZIP=27265;
        DELIVERY_ZIP_TYPE=USER;
        __gads=ID=0ce978adcd2c317c:T=1742395133:RT=1742395133:S=ALNI_MafWNPnc5rV2IVaBzkWZJ3-Aqz4yw;
        __gpi=UID=00000ffe7a9f5ba7:T=1742395133:RT=1742395133:S=ALNI_MbduYTiy_y7tc5N2eSZ376M-80w1Q;
        __eoi=ID=70d0699fedb44ccf:T=1742395133:RT=1742395133:S=AA-Afjb8OPLXhCu-hRod1BggS49Q;
        ecrSessionId=6A4541C290C4E4E471AD65EEA80D43D5;
        THD_NR=1;
        THD_SESSION=;
        THD_CACHE_NAV_SESSION=;
        ak_bmsc=898391B44868258E5765C4A8D1D6A19E~000000000000000000000000000000~YAAQHrdNaA8FYqyVAQAAPcBlyRtQkJqPxWygBUFXrPvu+6B6qZCNODG35jEtN67VDqKY1u6YjhqLzMtplVxe14PhIbLhX49DCqblRuMy3mpcElcVxA5H8ozjfpWKpaLz7Im3lpC1YOv0sfa0yp8IFWxbWT7f8RvMjevhVde5idSP2AlDX8UNaPWFa4RLjWhM4H4MjeqzOhblmeQ3x1NjhutA7c7/jddPR9kml7uZsE5whtfuCYt0a5F4ib5knVJWXw2Gb7UE3YQ+yRwM2zA2ryGKTsuD9coqpOwNwAvN99bAA7UMm4r/R94h/gpjM5E+7Ct4PDeVAVplQC3FKqNcYBeJyOJP25l00F39erkFyXxCANoGFTWHeIhri//jcDmVUQUKx/wdoZ4T/CYcrgMmRWyltA0DlcCrZVwfMwjqYdxbyXpd4EFYZeeGzWPDSvCSGYl/Y8rMHnUY/u19ecW0J2t7;
        // THD_LOCALIZER=%257B%2522WORKFLOW%2522%253A%2522LOCALIZED_BY_STORE%2522%252C%2522THD_FORCE_LOC%2522%253A%25220%2522%252C%2522THD_INTERNAL%2522%253A%25220%2522%252C%2522THD_LOCSTORE%2522%253A%25223633%252BHigh%2520Point%2520-%2520High%2520Point%252C%2520NC%252B%2522%252C%2522THD_STRFINDERZIP%2522%253A%252227262%2522%252C%2522THD_STORE_HOURS%2522%253A%25221%253B8%253A00-20%253A00%253B2%253B6%253A00-22%253A00%253B3%253B6%253A00-22%253A00%253B4%253B6%253A00-22%253A00%253B5%253B6%253A00-22%253A00%253B6%253B6%253A00-22%253A00%253B7%253B6%253A00-22%253A00%2522%252C%2522THD_STORE_HOURS_EXPIRY%2522%253A1742844293%257D;
        // ads=81506ae2e166b0d54001cbce1823557e;
        // QuantumMetricSessionID=98b49ed038c6616e195089c69036516d;
        // kndctr_F6421253512D2C100A490D45_AdobeOrg_cluster=va6;
        // THD_CUSTOMER=eyJzIjoiMDQxQUY0NzQ1RTcxNzY1NDBVOmQ1Y2RhZGRlLWUwMWUtNGExZi05YzI0LTdiMmFiZTc4MTg5MyIsInUiOiIwNDFBRjQ3NDVFNzE3NjU0MFUiLCJpIjoiUlBPbUhFRG1vaUxXRldxN2pENjVXcUMyeWl3LipBQUpUU1FBQ01ESUFBbE5MQUJ4UlNXdDJia1psUlVzeGVucElSSHBJTjBvM1pVMVFlRlEwTkZVOUFBUjBlWEJsQUFORFZGTUFBbE14QUFJd053Li4qIiwiYyI6IkIyQyIsInQiOiIwNDFBRjQ3NDVFNkZGNjU0MFMiLCJ2IjoxNzQyODQzNzk2NzE5LCJrIjoieSJ9.o3kcXxhUcSOVYzcDK1SMd-WS4u7iJFPHePujzTltoEEI7gLXRqkRRGdMPQ3bgGUV8boawYRFxn5iGPwbW0aKH899sUeCWX2fz5IjWxFvJWlvycGA2aVcyp00aNeA15MHzJrzm1kx7LiMRH4jDH9bcYBL5nDOuQxNUvF8bhsQW7M;
        // THD_TRANSACT=98ea8b1b-b106-4bdc-9b45-cbf4a4a05e7a;
        // THD_PERSIST=%3D%3A%3BC12%3Dtriadwebcrafters%40gmail.com%3A%3BC12_EXP%3D1774379796%3A%3BC13%3DJESSICA%3A%3BC13_EXP%3D1774379796;
        // bm_lso=E3B2871689F83E1B9ED1AB7E7CA9988F3D7F58280044E751A50382C7A41FA5D7~YAAQOG0+F7j+FKaVAQAAAeuWyQNHBbniG+KUYsLIAHvl36tRP4NbNoDyJgwvKqnPFBLPvz5ULsvMqdcs8UkVkivueDFe4WN4xuQwdgPGk+DrpBrTm+BZKsfNQ+LBqTtHAkOFYYFzdjlQmUZb3v/HbdmOD0VRQ71AY1TMjRe2U1d4o9k4ettnf9jOgRf52fJNWAK7apJkwv55Lonf4lIPce+w6+BL88Rv3EcFsGGCNBEMWTzbPJXtM5sAC7KXokkWEZ8L90SxTmcGLY+BI+KiI4JxFwYv24idU7Qf14GZ6XFKUPmTYSpIF8TAawGB3ISN1xAS9xN40VVc5L3zVDhwXuLTSBO+F3ZSizIFSLCmcUiAVR1epFhnwvkUARhxPUv2FkRIPqbG/4Ip2Ya/W/3V3V+i5ecGdR9Tvh5SeThqYO+/xtDeaPgD/PQo+U62dWnitgMNlfE3t5GyRs2HA1FUe1JFxA==^1742843870572;
        // akavpau_prod=1742844468~id=3a6da9c5593d68f634e659944666b663;
        // bm_sv=3FE648031F0F198A9BE3A576964D7219~YAAQBW0+F6Rl562VAQAAybWbyRtfDZbU1UOZFDRozZ03hOtHaZy0Iayxx1j1Pcyb85zwYXzm8VgP/fE0gFFlmutBmuPR3I0ssfuQN322vcahDAp8J11bllNAZwrZLbe+M+jiWmm2f8OlV3EO1iGqKNU45PnR8Ai09ZIJ9qIqZH88nEYlTTSs4wvz3Qa5SdqeprkL2caZ9gr19rlDd/gE3AwCg5XtoTrgwy9r0fhUPHakiZn5WGRCE/HnIJC4zmaKGyt96A==~1;
        // QSI_HistorySession=https%3A%2F%2Fwww.homedepot.com%2Fmyaccount%2Fpurchase-history~1742843645218%7Chttps%3A%2F%2Fwww.homedepot.com%2F~1742843654262%7Chttps%3A%2F%2Fwww.homedepot.com%2Fcart~1742843675515%7Chttps%3A%2F%2Fwww.homedepot.com%2F~1742843699486%7Chttps%3A%2F%2Fwww.homedepot.com%2Fauth%2Fview%2Fsignin%3Fredirect%3D%2F%26ref%3D~1742843724595%7Chttps%3A%2F%2Fwww.homedepot.com%2F~1742843870910%7Chttps%3A%2F%2Fwww.homedepot.com%2Fmyaccount%2Fpurchase-history~1742844180295;
        // trx=5030107388332156797;
        // forterToken=d5d78fda2a5e40549a90b304bdf5fb73_1742844177110__UDF43-m4_23ck_;
        // _px=yOtl52OzT2o23j+Oc17mffVFqLYcePe3W4HXb2fMtwsQ3zykIjvmpj+mrnUaKpICLQgkNd3Ph/66b8jPozh/TA==:1000:H5eXOkxIQVOdyVCVbsLjS+5/k4wOdLtH8TcXrGKxxNaTrLU7mCRzQrVRwcOnzVAOwb7kR8OyUgZ+TUkyNq6t2mtuF0ysACWERTx8Rh7OXvNnLdpZ4LEFyOupCXlWNaVQTg4h0PAdidoHHKY87Us1o3v3SaQdkWCw+fCohnEY1Y7BhQaWuNZcNLr5Pe5RXlSIOTUfTkBvsotC22sR6nYeUvYpfBIEf0xxjtmoAmKHbyDAUsFNaMRzKjAHZouo1I5EBCBQ8T7qKjY/wLkQa+nFRg==;
        // AKA_A2=A;
        // bm_ss=ab8e18ef4e;
        // bm_so=F5BB2C5E2ED449203496445884E87214E8295B6F10CF125830D4CDA97D5EA72B~YAAQxOHdFwZfC6yVAQAAKNehyQPWRWJwKS4bJqSZFUibUvWBBtmLc3+rAhw7I9mRbfnBGhoUMUkR5if4dQFK6lYQgDT+W++bXV9K6jJpIMPH6vvZFhy6SlwBAQae9fUef+LkzRuaQB/b3kobNSJtvLLChtO9o9yDlt7CLR86AdPG7a4zUJP845CjLk9gO4liqmTdHTmcHURTgM4bwsceOzwdmwHoh6OSIUaETWGGsDYycBQj7sA8qTyFA57KbS/QLrJ52+oMX6ZIKtAoVEtdg0oDZPuke7O/VtU0LS+mlplAHsXCKj0XbzdqaAU2vIXxfKld5vs0/6QrmYDEn3GchaH1lrAF2X4WThvyq9uNuBr3VX2Wlx2/ixqyjRI30GlKFgGIZh1RlbxleAW0SDOY1a+uv0Cm+9EJZytsjLVRPmoerFblr5fRCclFOYnbs9AKFdMTfEyatu8H5zyhhgo3kV2rNw==;
        // bm_s=YAAQxOHdF+9gC6yVAQAA0AWiyQOjTbdqe0FUK1X6aw6vbKJh7EQVUcNMfk5rAUCOYRI2vK02FOE+NCnE6+OP0V1URJMZY89Yjs7/XhOEQuuqxCGDb58pTsO6Vvk/EiTMLmj0Ivvgpt4No8doVP8Rmgw+00HHtVdNkjU3oZew2xctSnvei0dQ/0Tb7x56egCyQ7wSB0TzG1EkQ99rB3OCU2oUpnOxYtrlNMJ/I1KtrPZF/KBswFm727ViYLOAPDfqpsnj5HC2rB7z/tfwI6vXr3eZhrtDyfFT8ZMdgboKoJeLEGQtsV9y2tVLOy96Fh6kwZx8NNRUcVD/Zme6llObeMnIWds/3V00GAXtWxMBweQc7quVnR9qZaqz3Piwzp8ZIrg2O4PMYIS9Kbp+D18VnqjGPkc5wMbB9jmkZe5uCNdomsVhqWUmmZbKewxcf4x2I6FIjiriIAN5ybuV;
        // bm_sz=7BAE7D7208869BB987099CCAB87B448D~YAAQxOHdFxhzC6yVAQAAgMCjyRsMXM2aqmXB8CUdlwv5o01nDNFNct2ryrZPTHZdlc8Mt1CCFId2Fgp3v6x+rt4yXuYg9HGwbFC1XLINg24feg439s2kFBu80nR/mlCjXg7oCLIjJj5ymeAMMtn80oQFtfnmzSMSOKk3DNMASiPMD874gYu6AKkyiXO5w5SBmfPbZOcwZcbwmc/IQU5IlXSQrBnL17QMQzYitDfXvmAu6+76P5HFKJ0ggujePwhWAykpWscqY+2AcIF9rXkgHXoMtlxrIkkwUM450MJKbXEZLJxavS3ip/u1WJQUS1wx8RcdmI8iYQbglFaUwBNSBlRt1XzqhzIYtWT9jYQVnlAEbHXlCtoyBhB0kyDpqrL+Pm2w5krwEws/f93qAtd20MvNNVqHgGq94wXjFY5XItp9Ik2frzJp69JED1Am+z4755+56ntnkQzFojD2RA+yknlRzD9WHBfiDDdqi8tt/hQCiyHfUlgp60XcsdEwkwEt9w==~4604486~3553591;
        // _abck=B0785E02FBF216525C91AD65110131E8~0~YAAQxOHdFyFzC6yVAQAA8cGjyQ2uPzqlbbwAWqKicL7eADf5ZCf7JSLRZ0zh7TCYj5TAxKiZN3WvrzNWWDWgQSDo1qFjlrw9EutHDi0qmXf1AyXQyZOmIem5csqTDtuQfW9oPI7TJ9tBWR+95ADHfn/xxKn5lR8+5ed16Fg7IRCXZH5PITGNnkL6lddJkMt4+1h4VcdmmeWwydZPZEuHumsy63XGN2NMObYgEihIxNbvBajd2O/zA2VCTYh9/DjPmZ5waxBgA1yz56DaMa+PAN0yyAVfn2zD9i95LaCDuf9KxfswCT3nTnR/A8TvoCV0Wlp06Kl93aJIlKVQdceZkRX4moTqO8LGLuOmdG0EOfFdHJ0cIOs4DJNZT27PaYlc+gpC5p6/7zwE3B+zWIEsP0jo53U3KTrV6nncW+1vPLtdFfwM9/HdHYr7KVJLEIBbZcHuhVVjqUa8URgTDJDN6JcgnqCpWUMrMDBkcVSpI4+JJfzzzHj7Z6635MKuQos96Lgx6wQ208GVlGD7aJ8pQ40qCvW+KCtYpdRCpLIQb9dadF1cBMgeWrVgEA2Ur01Wbiz+Qe3MMLd9X/roNwtzuY33D+XRBwo7VyUF3SMOMg5gfeMH7F5XFoKMMr4rlHEe9JNnVWUUppHQLntUfULBO2HFgOT9LZ20YM3+NyNRdFAYAnaufKvs/s394jVilz/OG5JQt6s5Y3vwvllA1SpPHxLvdow/0YrOPVaGwOt6pwvCgJRFpcBHBmr4jR/9qW9OiyQrXKz30tRGL0v+fqnYE1PCfotjTPcfwnhVXKemEiKHVQ==~-1~-1~-1;
        // kndctr_F6421253512D2C100A490D45_AdobeOrg_identity=CiY0NDU5OTc4MTgwNTAzOTIwOTA3MjAyOTA1NzEyNDA3NTE2MTM5OFIQCISwx9%5FNMhgBKgNWQTYwAfABnoqPzdwy;
        // IN_STORE_API_SESSION=TRUE;
        // _pxde=0581a30c7af8d9ce0df91d945736ba5be6cd7435689dcf967f0e4b042216bd13:eyJ0aW1lc3RhbXAiOjE3NDI4NDQ3MDgyOTB9",
      "Referer": "https://www.homedepot.com/myaccount/purchase-history",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    "body": '{"orderHistoryRequest":{"pageSize":20,"pageNumber":1,"startDate":"2023-02-24","endDate":"2025-03-24"}}',
    "method": "POST",
  })
  if (!response.ok) {
    console.error(`Error: ${response.status} ${response.statusText}`)
    return
  }

  const orders = await response.json()
  console.log("home depot orders:", orders)
}

const doHomeDepotScrape = async function (oldestDate) {
  logger.info("Beginning home_depot scrape, this can take a moment")

  // await getOrders(oldestDate)
  // return
  const oldestDateToScrape = Date.parse(oldestDate) - gracePeriod
  puppeteer.use(StealthPlugin())

  const browser = await puppeteer.launch({
    headless: false, // set to true to look nicer
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const page = await browser.newPage()
  await page.goto("https://www.homedepot.com/myaccount/purchase-history")

  await page.waitForSelector("#username")
  await page.type("#username", config.get("home_depot_username"))
  await page.click("#sign-in-button")

  await page.waitForSelector("#ap_password")
  await page.type("#ap_password", config.get("home_depot_password"))
  await page.click("#signInSubmit")
  try {
    await page.waitForSelector("#cpefront-mpo-widget")
  } catch (e) {
    logger.error("Your home_depot login appears to be invalid, try running `ynab setup home_depot` and updating your credentials.")
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

                trans.push({
                  date: transactionDate,
                  orderId: orderObject.innerText,
                  orderUrl: orderObject.getAttribute("href"),
                  total: item.querySelector(".a-text-right").innerText,
                  refund: null, // not on this page anymore
                  items: [], // will fill in on next step
                })
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
    logger.error("Home Depot scrape failed to finish. ", e)
  }

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
    // for home_depot digital orders
    else if (orderUrl.includes("order-details")) {
      await page.waitForSelector("#digitalOrderSummaryContainer")
      transactions[i].items = await page.evaluate(() => {
        let products = []
        document.querySelectorAll(".sample a").forEach((link) => {
          products.push(link.innerText)
        })
        return products
      })
    }
    // otherwise, who knows? just look at the link manually
    else {
      console.warn(`Home Depot order URL ${orderUrl} is unknown, don't know how to get products.`)
      transactions[i].items = [orderUrl]
    }
  }
  await browser.close()
  return transactions
}

module.exports = async function (allTransactions) {
  logger.debug(`Beginning Scraping for Home Depot`)
  if (!config.has("home_depot_username") || !config.has("home_depot_password")) {
    logger.info("You will need to set up your home_depot access first:")
    await setup.home_depot()
  }
  let transactions = allTransactions.filter((t) => t.payee_name.includes("The Home Depot"))
  console.log("all")
  if (transactions.length) {
    logger.title(`${transactions.length} Home Depot Transactions Found to Review`)
    const oldestDate = transactions[0].date
    const orders = await doHomeDepotScrape(oldestDate)
    const matchingOrders = compareAndReview.getMatchingOrders(orders, transactions)

    await compareAndReview.reviewOrders(matchingOrders)
    scraperUtils.saveDebugData("matchingTransactions", matchingOrders)
    return matchingOrders
  }
  // Sometimes we might just be all done and not need to run a scrape.
  logger.success("No Home Depot transactions found in YNAB.")
  return
}
