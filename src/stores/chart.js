import { defineStore } from 'pinia'
import { publishChart, subscribeChart, loadLastChart } from '../lib/sync.js'

// Holds the current chart for whichever tab this store lives in.
// A Pinia store is per-tab, so cross-tab sync still rides on BroadcastChannel
// (via the sync module): the control tab broadcasts, the display tab listens.
export const useChartStore = defineStore('chart', {
  state: () => ({
    chart: null,
    meta: null,
    _subscribed: false,
  }),
  actions: {
    // Called by the control view after a successful calculation.
    setChart(chart, meta) {
      this.chart = chart
      this.meta = meta
      publishChart({ chart, meta })
    },
    // Called once at app start: seed from the last snapshot, then listen for
    // updates broadcast by the control tab.
    init() {
      if (this._subscribed) return
      this._subscribed = true
      const last = loadLastChart()
      if (last) {
        this.chart = last.chart ?? null
        this.meta = last.meta ?? null
      }
      subscribeChart((payload) => {
        if (!payload) return
        this.chart = payload.chart ?? null
        this.meta = payload.meta ?? null
      })
    },
  },
})
