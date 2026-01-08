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
      "authorization": "BXmfRBFFsz-7EExuoK-jFmdK7iI.*AAJTSQACMDIAAlNLABxVVVlmbzVrL1pvSVppZ28vVC8wZlg4SnFBTU09AAR0eXBlAANDVFMAAlMxAAIwNw..*",
      "content-type": "application/json",
      "cookie":
        'HD_DC=origin;akacd_usbeta=3916309645~rv=78~id=47bfefe54669e151ad4b959d78f50cf4;THD_CACHE_NAV_PERSIST=;_pxvid=aa9554eb-e4a1-11ef-8b96-7787caa1f511;AMCV_F6421253512D2C100A490D45%40AdobeOrg=MCMID|44599781805039209072029057124075161398;thda.s=f2399f24-e183-02fc-2a25-47e00a364606;thda.u=112969d3-64ac-0579-be54-6480d8afba52;_px_f394gi7Fvmc43dfg_user_id=YWIzYmRmMzAtZTRhMS0xMWVmLTgyZmQtNTUxZGRhOTg0MGVi;ajs_anonymous_id=4bef9410-b2f8-4958-8cd0-ab2ce271a3a9;PIM-SESSION-ID=Xfc6sldYgxl7YATB;ftr_ncd=6;THD_NUGGET=112969d3-64ac-0579-be54-6480d8afba52;THD_CUSTOMER=eyJzIjoiMDQxQUY0NzQ1RTcxNzY1NDBVOmYxYmIyOGE0LTc0MzItNGNlMi1hNDc5LTE2ODBiY2FmN2UyOSIsInUiOiIwNDFBRjQ3NDVFNzE3NjU0MFUiLCJpIjoiQlhtZlJCRkZzei03RUV4dW9LLWpGbWRLN2lJLipBQUpUU1FBQ01ESUFBbE5MQUJ4VlZWbG1ielZyTDFwdlNWcHBaMjh2VkM4d1psZzRTbkZCVFUwOUFBUjBlWEJsQUFORFZGTUFBbE14QUFJd053Li4qIiwiYyI6IkIyQyIsInQiOiIwNDFBRjQ3NDVFNkZGNjU0MFMiLCJ2IjoxNzM4ODU2OTAxMzM4LCJrIjoieSJ9.pUaYFrI7kyNjdKAqesFtxdfGIsgK-J8iMDL40JAYTQU8ZXOHLiXV8mrq1JoFP6dEeHJ9_SAU7FRoz1PzSX1uL9qNywZZgaRRXwWZGROpau7qE-BRbahwqRZasURs9YWLJnAFTJuPT1GwOjGaf-1M1v4i1JMyDcnOPhR7Gm5lGgo;THD_TRANSACT=c67e9c6d-bd9e-48a5-a4e3-d711835599f9;X-AK-PIM-INJECT=sync;QuantumMetricUserID=b5b924a0c917b6b0e2ab48583f156474;_gcl_au=1.1.2134715244.1738856916;QSI_SI_2lVW226zFt4dVJ3_intercept=true;THD_MCC_ID=32453825-cdc3-48fe-a65f-c5758aa03444;_gac_UA-32593878-1=1.1742393845.Cj0KCQjw1um-BhDtARIsABjU5x6nkb2Ud1H2HPC_OnTR-0gQYzT0wd6ZEriruG80uOZYbsHu84wW2MsaAtwAEALw_wcB;_gcl_aw=GCL.1742393845.Cj0KCQjw1um-BhDtARIsABjU5x6nkb2Ud1H2HPC_OnTR-0gQYzT0wd6ZEriruG80uOZYbsHu84wW2MsaAtwAEALw_wcB;_gcl_dc=GCL.1742393845.Cj0KCQjw1um-BhDtARIsABjU5x6nkb2Ud1H2HPC_OnTR-0gQYzT0wd6ZEriruG80uOZYbsHu84wW2MsaAtwAEALw_wcB;_gcl_gs=2.1.k1$i1742393834$u81939855;_ga=GA1.1.1752429371.1738856914;_ga_9H2R4ZXG4J=GS1.1.1742392983.6.1.1742393860.44.0.0;DELIVERY_ZIP=27265;DELIVERY_ZIP_TYPE=USER;THD_PERSIST=C6%3d%7b%22I1%22%3a%220%22%7d%3a%3bC6%5fEXP%3d1744987132%3a%3bC12%3dtriadwebcrafters%40gmail%2ecom%3a%3bC12%5fEXP%3d1794235132%3a%3bC13%3dJESSICA%3a%3bC13%5fEXP%3d1794235132;__gads=ID=0ce978adcd2c317c:T=1742395133:RT=1742395133:S=ALNI_MafWNPnc5rV2IVaBzkWZJ3-Aqz4yw;__gpi=UID=00000ffe7a9f5ba7:T=1742395133:RT=1742395133:S=ALNI_MbduYTiy_y7tc5N2eSZ376M-80w1Q;__eoi=ID=70d0699fedb44ccf:T=1742395133:RT=1742395133:S=AA-Afjb8OPLXhCu-hRod1BggS49Q;ecrSessionId=6A4541C290C4E4E471AD65EEA80D43D5;AKA_A2=A;bm_ss=ab8e18ef4e;THD_NR=1;kndctr_F6421253512D2C100A490D45_AdobeOrg_cluster=va6;THD_SESSION=;THD_CACHE_NAV_SESSION=;ak_bmsc=898391B44868258E5765C4A8D1D6A19E~000000000000000000000000000000~YAAQHrdNaA8FYqyVAQAAPcBlyRtQkJqPxWygBUFXrPvu+6B6qZCNODG35jEtN67VDqKY1u6YjhqLzMtplVxe14PhIbLhX49DCqblRuMy3mpcElcVxA5H8ozjfpWKpaLz7Im3lpC1YOv0sfa0yp8IFWxbWT7f8RvMjevhVde5idSP2AlDX8UNaPWFa4RLjWhM4H4MjeqzOhblmeQ3x1NjhutA7c7/jddPR9kml7uZsE5whtfuCYt0a5F4ib5knVJWXw2Gb7UE3YQ+yRwM2zA2ryGKTsuD9coqpOwNwAvN99bAA7UMm4r/R94h/gpjM5E+7Ct4PDeVAVplQC3FKqNcYBeJyOJP25l00F39erkFyXxCANoGFTWHeIhri//jcDmVUQUKx/wdoZ4T/CYcrgMmRWyltA0DlcCrZVwfMwjqYdxbyXpd4EFYZeeGzWPDSvCSGYl/Y8rMHnUY/u19ecW0J2t7;THD_LOCALIZER=%257B%2522WORKFLOW%2522%253A%2522LOCALIZED_BY_STORE%2522%252C%2522THD_FORCE_LOC%2522%253A%25220%2522%252C%2522THD_INTERNAL%2522%253A%25220%2522%252C%2522THD_LOCSTORE%2522%253A%25223633%252BHigh%2520Point%2520-%2520High%2520Point%252C%2520NC%252B%2522%252C%2522THD_STRFINDERZIP%2522%253A%252227262%2522%252C%2522THD_STORE_HOURS%2522%253A%25221%253B8%253A00-20%253A00%253B2%253B6%253A00-22%253A00%253B3%253B6%253A00-22%253A00%253B4%253B6%253A00-22%253A00%253B5%253B6%253A00-22%253A00%253B6%253B6%253A00-22%253A00%253B7%253B6%253A00-22%253A00%2522%252C%2522THD_STORE_HOURS_EXPIRY%2522%253A1742844293%257D;ads=81506ae2e166b0d54001cbce1823557e;bm_lso=3A602FCECE6BA4CB66DFCC334E807991052CD49F6EFDB168DDEED83EF2AC7F94~YAAQHrdNaP4UYqyVAQAATIdmyQPy23NI9G07HmeFeYZXttBnk2HMkKdA1ubSpPiEMAwZj8QQ/Q04N8xZJUYoLOhfp4UZ2s1WPn9J/Fhp6G+h4VoRvScXGGqp0UOzYcNVnkGsj12bb3kFgPuwSfXIaX2lr8atbphfBv4HDpDurlkb8Bvp0sKkWjFhDAR8ch0d0IViw57i3nC0y/Kt10DS+IW6dSBDs0VRzo1rBnDtTX8INXhRRoe8zmybqXPa3M4m1KKhSZed8WbfZ5V20zj4NdgL/jXtfuY8OETtn/STfbqcER4w2xjUTtyxrL+ET8y3fjmSyo44hLPec72VN/XOfrmRCFJKWVk5VfZypxfbk3Dh9O8LNiNkuVhQub2S0C/tqWlD7Vpz+iipwKKQvaOi+0XNHCAgm04j/9Lw3CsgoyPXVE5y8uRtkOXMKkWi47Hjbs5OE7Hwug30g8jg1a/EntDg3A==^1742840697577;QuantumMetricSessionID=155bc3c31df714b778ab29d04d5ebca6;akavpau_prod=1742841231~id=61fccf5a443af84b5b9a2a56b89240ff;bm_so=EFA3E8D43214DDFD31BB6AD2AFCB8D719BBF7F69BBCB590F86B3F6B2FFCACB5C~YAAQD7dNaFEBxKyVAQAAaiRqyQOKYmyMVR/6nILf2E9Ggo833jqB5qYE3ZWYqjNMgnIrMzupInuFl0Bu+pxPUPHgnNbzrobR0oKCcUPmQd6bz6XRJG3fnjhZVzKClVb03bzY5FQBO8iwNiH0ISjKEssxCroLxTCbQytRK5cf8uPwe2pWRuzyh8pU0fzoutcTVFHWeQpIqtPYAneXjmLL+ghr4dlyhmBIDG30BXZoAVunXTitp5q2yl8kcO3GKeuOSp+n+xsAgxOky4/e3ux6wZfgDOEcRZt45na7fhCxMRrPh1W2Rgxu1m5ob4567xvGAUsWaaPL64ATCoFRBCxMWVryPBRQAk87akV9mh7BQaqxAKqJ6tdvXfVeFPe5ab5rb4Fb5k1c9IwYsVytOTaaR+POcHjJRhaI1E9mBX1RLoVm90tq2pflsfMTsrt7guIbR2n0SkNkUk44Dg2MskHNprtRDg==;bm_sv=3FE648031F0F198A9BE3A576964D7219~YAAQD7dNaOYCxKyVAQAAKkhqyRsr1Jj2kKqhF3ENOrqR+HUXDJ1+RTI4YEtlrzglO8WchzULRwE0uPSKdbXq6zIfBGUeYoNUEzioyATqd/RqfsPJ+L4hNeVCfdDUR+kze8plZUq5GglwFE5mlit9Yf3byPZouPbeYMN3P7XtWjrKcKlpwmkMt9S8tvnSi+X3rki9dIBPCiZ3yaWPE/DuG5zMnRVB3SWmMnQvpTu0DskZs2gGJn0jpjlJf5LPVuSGoTJD~1;_px=8DfVSq5sF66r1xKJ+GW5Lpf6NI/93hG3b5zEaVtptGObA9PtC66O/sQOjADMW/6TlUKACMRs2tL2El0FA8F/nw==:1000:0Xm5vORKTdjeoWMoTxGcJqM3yItQLEJFTwOZ0/Jyb1st3T/iBi0ss57h8kc+yZaBbIkPpo4hfUEgcrpkp5RWbdHm4vgSAobmczl55GhiYGLGO+mJaUWGN1PhK6wvW5SidsQS0kCCB4miXzsVLs2LFTzrZF56wO5pZCi/+ZRKO8Ih9nvnZanuWLDlKf+1kOa6gnAkM0kcDvefcLQ/V3WKO6ITAc3gBjI7lldxay4dVKMTDn+w8gm/xqKCvO4rF8uwQt5AS+qvPq2JMYXCOiicYA==;QSI_HistorySession=https%3A%2F%2Fwww.homedepot.com%2Fs%2FRotor%2520Nozzle%2520Tree%2520for%252042SA%252B%252F52SA%252F5000%2520Series%2520Rotors%3FNCNI-5~1742516739838%7Chttps%3A%2F%2Fwww.homedepot.com%2Fp%2FRain-Bird-42SA-52SA-and-5000-Series-Rotor-Sprinkler-Nozzle-Sets-4252NZLPK%2F203829321~1742516797362%7Chttps%3A%2F%2Fwww.homedepot.com%2F~1742517241229%7Chttps%3A%2F%2Fwww.homedepot.com%2Fmyaccount%2Fpurchase-history~1742840939596;trx=5030107388332156797;forterToken=d5d78fda2a5e40549a90b304bdf5fb73_1742840939206__UDF43-m4_23ck_;bm_s=YAAQD7dNaIkFxKyVAQAA+W5qyQNY6ntUOpugAQBcy3IP6RvyTKoONHrL3j8jaQUm2fmgWPiDUxxw/LxpkVSO7PwmVj9HCu8kPJEiSePk3m0euvtwDdQx/GwdQhB4BqbjvX55BCjqec/J86LkEUOll2ZtiSdLncwnkwg5l94Th8j2T91JZ0+NdhTFO7BYWtrH/qs60cN5bqHKq9KAfqqtf5d4wV+UKGkfKgqNxr8s0GaHIiG5nWeIJpfS/boZn7X843bC+JlOR2c9GJBic9Hu0NwnX1PLpkyjuXm8SvPc2WgjWJSsngj0opGWTuHUvGK4u6usSroZNJ7Ahd+9X7KT0FLBk3xskh2IvUWZUy9VIM36e6wFDfBtDwhlZeKztBZNzyA8dLzrrKtjQsJ7lDvzfKYR/Nx5H59MoZhTY5qHc5xs7FShGBoi2jnKVY7diOuZ1mgmwzYE15Qc8PSS;_pxde=432b67250e1441f989b92898e79f3eea414345ef18b382bdf3aa9b70da59c276:eyJ0aW1lc3RhbXAiOjE3NDI4NDA5NjUzMTR9;bm_sz=7BAE7D7208869BB987099CCAB87B448D~YAAQD7dNaBcIxKyVAQAANqlqyRv1DxOn720u1hUqgIwqcxrlKymGezLafkl82GTJXO0iU/4C/LbmVddcCmQtacqMoGBzme+5opGCnEPdOue4JcxXWWt4n76uSTGhWowYEb4FEGQDvDPVlxJT8t+9hVpswIEECx+qmQHgdwM/KXSTnO0ned80r5dkKrUkpan52O17yxp9rB1IkcUCis2srgXBMZjJHROtPKbpnWggF63/OQRHavB5p+CzRRiVoF+xpfYbLWL0od7+nk4GbRHEdmRZ9Fr4zJ+xTUSdDQk1wCzqyb2cWk202A6y3btpWWQYzK2I4s1sDnvCL/Qxyj1DBBz1uoOR6jKccfICiWrJEN+JFcItsxzdlgmQ0OuMy5S7KAOy2+TrH8vP422QfI60lOOKV0UQ1yq5Ej58YDS5vS9m~4604486~3553591;RT="z=1&dm=www.homedepot.com&si=f09b2cfc-d260-450e-a617-a566b1d8a9cd&ss=m8nebg69&sl=2&tt=4uo&rl=1&ld=6xd9&r=4wvu78eq&ul=6xda&hd=6xt5";_abck=B0785E02FBF216525C91AD65110131E8~0~YAAQD7dNaCYIxKyVAQAAoqpqyQ0hxdSX9rQKct9H6hx0KznYW86wf5+746wB3ii2kgazsumY0HddtF9F7+UHB2ggFkD8dFvHBzCqLEpuJ8suUyF8XZ/lte0ibDfWJMxsdFzgiSPFliKWPciVqnBl6Q8Ggvs9CXbEhHqyNrPF26RQqOaaggIev2jfGAEik1od4GTslGccCeOCj3UGhvBcazoPmf6FApPi88Y1QLFieM8hpPxZch7K2NVlnBDC1XYmV8abESFZJehaf9G7Wyl7xydFVYRXh3efLqMsPWLQBwCzwMWtR+5bI+1Rsxt15qwkaP28QAGO/EMQoQr8ri1/m7U+5KuDms3wZEFWRwZw3AlsNKwDjURW/Nnv0UcV/nck6LOlaTzIzRJoflBG0+fY2cm4pxAQd+zRZrblwigQIszKQLd+wK1gOl/mT7Popu42y8RUbiiv1RNAPEb8+QZEiMmy+kidGmUrYtcz00eGi1Bo68IvR9P3DLRxidhcmriXoJpQw+uNBhKMRokZfkf39fJQWg7MfHxxyMM20yH0uXSvVQJPpX06fgza/p+azvurIqKMDn5VQ1y5yalmB+EMjJbLOV49c/3RvCN3psXO7FMKtOWke+TRfAO4Hmk3X2cW1rMixGMyXbU+QKWHbgvLbILwIzAoBgSkOvRCvOuVPjVP6Xm0RT9RQAGM7rgbdnoXFCpWzddUYa+i1PcdIg==~-1~-1~-1;kndctr_F6421253512D2C100A490D45_AdobeOrg_identity=CiY0NDU5OTc4MTgwNTAzOTIwOTA3MjAyOTA1NzEyNDA3NTE2MTM5OFIQCISwx9%5FNMhgBKgNWQTYwAfAB3deqy9wy;IN_STORE_API_SESSION=TRUE',
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
