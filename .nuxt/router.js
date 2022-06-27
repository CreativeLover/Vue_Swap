import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _25873233 = () => interopDefault(import('..\\pages\\SelectChangeCoin.vue' /* webpackChunkName: "pages/SelectChangeCoin" */))
const _72a0bde3 = () => interopDefault(import('..\\pages\\SelectCoin.vue' /* webpackChunkName: "pages/SelectCoin" */))
const _244aead8 = () => interopDefault(import('..\\pages\\stableToken.vue' /* webpackChunkName: "pages/stableToken" */))
const _3c84b7ac = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/SelectChangeCoin",
    component: _25873233,
    name: "SelectChangeCoin"
  }, {
    path: "/SelectCoin",
    component: _72a0bde3,
    name: "SelectCoin"
  }, {
    path: "/stableToken",
    component: _244aead8,
    name: "stableToken"
  }, {
    path: "/",
    component: _3c84b7ac,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
