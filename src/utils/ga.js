import { app, remote } from 'electron'
import * as ua from 'universal-analytics'
import { v4 as uuidv4 } from 'uuid'
import { JSONStorage } from 'node-localstorage'

const universalApp = app || remote.app
const nodeStorage = new JSONStorage(universalApp.getPath('userData'))

// Retrieve the userid value, and if it's not there, assign it a new uuid.
const uid = nodeStorage.getItem('uid') || uuidv4()
console.log(`uid=${uid}`)
// (re)save the userid, so it persists for the next app session.
nodeStorage.setItem('uid', uid)
const ga = ua('UA-188502966-1', uid)

/**
 * Send GA measurement event
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/events
 * https://developers.google.com/analytics/devguides/collection/protocol/v1/devguide
 *
 * @param {*} category Typically the object that was interacted with (e.g. 'Video')
 * @param {*} action The type of interaction (e.g. 'play')
 * @param {*} label Useful for categorizing events (e.g. 'Fall Campaign')
 * @param {*} value A numeric value associated with the event (e.g. 42)
 */
export function trackEvent(category, action, label, value) {
  if (!category || !action) {
    throw new Error('Category and Action params are required')
  }
  if (enableTrack()) {
    ga
      .event(Object.assign({
        ec: category,
        ea: action,
      }, label ? { el: label } : {}, value ? { ev: Number(value) } : {}))
      .send()
    // console.log('ga.send', [category, action, label, value])
  }
}

/**
 * Send GA page view
 * @param {*} dp document path
 * @param {*} dt document title
 * @param {*} dh document hostname
 */
export function pv(dp = '', dt = '', dh = '') {
  if (enableTrack()) {
    ga
      .pageview({ dp, dt, dh })
      .send()
    // ga('send', 'pageview', [page], [fieldsObject]);
  }
}

/**
 * 开启埋点
 * @param {*} enable 开启与否
 */
export function enableTrack(enable) {
  if (typeof enable === 'boolean') {
    nodeStorage.setItem('track', enable)
  } else {
    return nodeStorage.getItem('track') !== false
  }
}
