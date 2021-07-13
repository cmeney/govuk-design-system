/* eslint-env jest */

const { setupPage } = require('../lib/jest-utilities.js')
const configPaths = require('../config/paths.json')
const PORT = configPaths.testPort

let page
let baseUrl = 'http://localhost:' + PORT

beforeEach(async () => {
  page = await setupPage()
})

afterEach(async () => {
  await page.deleteCookie({ name: 'design_system_cookies_policy' })
  await page.close()
})

const COOKIE_BANNER_SELECTOR = '[data-module="govuk-cookie-banner"]'

describe('Cookie banner', () => {
  describe('is hidden', () => {
    it('when JavaScript is disabled', async () => {
      await page.setJavaScriptEnabled(false)
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      const isCookieBannerHidden = await page.waitForSelector(COOKIE_BANNER_SELECTOR, { visible: false })
      expect(isCookieBannerHidden).toBeTruthy()
    })

    it('is hidden when JavaScript is enabled and the consent cookie version is valid', async () => {
      await page.setCookie({ name: 'design_system_cookies_policy', value: '{"analytics":true, "version":1', domain: 'design-system.service.gov.uk' })
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      const isCookieBannerHidden = await page.waitForSelector(COOKIE_BANNER_SELECTOR, { visible: false })
      expect(isCookieBannerHidden).toBeTruthy()
    })

    it('when on the cookies page', async () => {
      await page.setCookie({ name: 'design_system_cookies_policy', value: '{"analytics":true, "version":1', domain: 'design-system.service.gov.uk' })
      await page.goto(`${baseUrl}/cookies/`, { waitUntil: 'load' })

      const isCookieBannerHidden = await page.waitForSelector(COOKIE_BANNER_SELECTOR, { visible: false })
      expect(isCookieBannerHidden).toBeTruthy()
    })
  })

  describe('is visible', () => {
    it('when JavaScript is enabled and there is no consent cookie', async () => {
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      const isCookieBannerVisible = await page.waitForSelector(COOKIE_BANNER_SELECTOR, { visible: true })
      expect(isCookieBannerVisible).toBeTruthy()
    })

    it('when JavaScript is enabled and the consent cookie version is outdated', async () => {
      await page.setCookie({ name: 'design_system_cookies_policy', value: '{"analytics":true, "version":0', domain: 'design-system.service.gov.uk' })
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      const isCookieBannerVisible = await page.waitForSelector(COOKIE_BANNER_SELECTOR, { visible: true })
      expect(isCookieBannerVisible).toBeTruthy()
    })
  })

  describe('accept button', () => {
    it('sets the consent cookie', async () => {
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })

      const initialCookie = await page.cookies()
      expect(initialCookie).toEqual([])

      await page.click('.js-cookie-banner-accept')
      const newCookie = await page.cookies()
      expect(newCookie[0].name).toEqual('design_system_cookies_policy')
      expect(newCookie[0].value).toEqual('{"analytics":true,"version":1}')
    })

    it('hides the cookie message', async () => {
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      await page.click('.js-cookie-banner-accept')

      const isCookieMessageHidden = await page.waitForSelector('.js-cookie-banner-message', { visible: false })
      expect(isCookieMessageHidden).toBeTruthy()
    })

    it('shows the confirmation message', async () => {
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      await page.click('.js-cookie-banner-accept')

      const isConfirmationMessageVisible = await page.waitForSelector('.js-cookie-banner-confirmation-accept', { visible: true })
      expect(isConfirmationMessageVisible).toBeTruthy()
    })

    it('moves user focus to the confirmation message', async () => {
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      await page.click('.js-cookie-banner-accept')

      const confirmationMessageTabindex = await page.evaluate(() => document.body.querySelector('.js-cookie-banner-confirmation-accept').getAttribute('tabindex'))
      expect(confirmationMessageTabindex).toEqual('-1')
    })
  })

  describe('reject button', () => {
    it('sets the consent cookie', async () => {
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })

      const initialCookie = await page.cookies()
      expect(initialCookie).toEqual([])

      await page.click('.js-cookie-banner-reject')
      const newCookie = await page.cookies()
      expect(newCookie[0].name).toEqual('design_system_cookies_policy')
      expect(newCookie[0].value).toEqual('{"analytics":false,"version":1}')
    })

    it('hides the cookie message', async () => {
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      await page.click('.js-cookie-banner-reject')

      const isCookieMessageHidden = await page.waitForSelector('.js-cookie-banner-message', { visible: false })
      expect(isCookieMessageHidden).toBeTruthy()
    })

    it('shows the confirmation message', async () => {
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      await page.click('.js-cookie-banner-reject')

      const isConfirmationMessageVisible = await page.waitForSelector('.js-cookie-banner-confirmation-reject', { visible: true })
      expect(isConfirmationMessageVisible).toBeTruthy()
    })

    it('moves user focus to the confirmation message', async () => {
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      await page.click('.js-cookie-banner-reject')

      const confirmationMessageTabindex = await page.evaluate(() => document.body.querySelector('.js-cookie-banner-confirmation-reject').getAttribute('tabindex'))
      expect(confirmationMessageTabindex).toEqual('-1')
    })
  })

  describe('hide button', () => {
    it('hides the accept confirmation message', async () => {
      // Accept cookies
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      await page.click('.js-cookie-banner-accept')

      // Click the hide button
      await page.click('.js-cookie-banner-hide--accept')

      const isConfirmationMessageHidden = await page.waitForSelector('.js-cookie-banner-confirmation-accept', { visible: false })
      const isCookieBannerHidden = await page.waitForSelector(COOKIE_BANNER_SELECTOR, { visible: false })

      expect(isConfirmationMessageHidden).toBeTruthy()
      expect(isCookieBannerHidden).toBeTruthy()
    })

    it('hides the reject confirmation message', async () => {
      // Reject cookies
      await page.goto(`${baseUrl}`, { waitUntil: 'load' })
      await page.click('.js-cookie-banner-reject')

      // Click the hide button
      await page.click('.js-cookie-banner-hide--reject')

      const isConfirmationMessageHidden = await page.waitForSelector('.js-cookie-banner-confirmation-reject', { visible: false })
      const isCookieBannerHidden = await page.waitForSelector(COOKIE_BANNER_SELECTOR, { visible: false })

      expect(isConfirmationMessageHidden).toBeTruthy()
      expect(isCookieBannerHidden).toBeTruthy()
    })
  })
})