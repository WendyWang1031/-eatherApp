// service-worker.js
import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

clientsClaim();

const cacheName = "your-cache-name";
const cacheExpiration = {
  maxEntries: 50,
  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
};

precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute();
// Add your custom route configurations, for example, for API requests

// Cache Google Fonts with a stale-while-revalidate strategy, with custom expiration
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: "google-fonts",
    plugins: [new ExpirationPlugin(cacheExpiration)],
  })
);
