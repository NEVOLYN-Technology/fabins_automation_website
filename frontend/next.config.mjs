/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Surfaces problems early by double-invoking render and effect logic in
   * development. Has no effect on the production build.
   */
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },

  /**
   * Emits `.next/standalone`, a self-contained server bundling only the
   * node_modules actually reached at runtime. This is what the Dockerfile's
   * final stage copies, and it is the difference between a ~120 MB image and
   * one carrying the entire dependency tree.
   *
   * Vercel uses its own output format and ignores this, so it is safe to leave
   * enabled for both deployment targets.
   */
  output: 'standalone',

  /**
   * Hosts allowed to load the dev server's assets when it is reached over the
   * local network — for example, opening the site on a phone to check the
   * responsive layout.
   *
   * NOTE: this is one developer's LAN address and will not match yours. Replace
   * it with your own machine's local IP (`ipconfig` on Windows, `ifconfig` on
   * macOS/Linux), or delete the option entirely if you only ever use localhost.
   * It is a development-only setting and is ignored in production.
   */
  allowedDevOrigins: ['192.168.68.103', '192.168.68.103:3000'],
  async rewrites() {
    return [
      {
        source: '/logo.png',
        destination: '/fabins-logo.png',
      },
    ]
  },
}

export default nextConfig