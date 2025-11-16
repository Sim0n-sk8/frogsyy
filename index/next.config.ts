import withPWA from "next-pwa";

const nextConfig = withPWA({
  reactStrictMode: true,
  pwa: {
    dest: "public",       // service worker output folder
    register: true,       // auto-register service worker
    skipWaiting: true,    // immediately activate new SW
    disable: process.env.NODE_ENV === "development", // disable PWA in dev
    runtimeCaching: [
      {
        // Cache your images
        urlPattern: /^\/frg.*\.png$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images-cache",
          expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
        },
      },
      {
        // Cache other static assets
        urlPattern: /\.(?:js|css|html|json)$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
        },
      },
    ],
  },
});

export default nextConfig;
