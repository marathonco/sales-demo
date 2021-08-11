/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';

// Use with precache injection
self.skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({url}) => url.pathname.endsWith('.mp4'),
  new CacheFirst({
    cacheName: 'video',
    plugins: [
      // new CacheableResponsePlugin({statuses: [200]}),
      new RangeRequestsPlugin(),
    ],
    matchOptions: {
      ignoreSearch: true,
      ignoreVary: true
    },
  })
)

// TODO: why is this not ever logging?
console.log('custom service worker is here...')
