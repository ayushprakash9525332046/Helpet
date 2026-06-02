import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.40", "172.20.10.2"],
  experimental: {
    staleTimes: {
      // Keep dynamic pages always-fresh (admin data, bookings) but let the
      // client router cache prefetched *static* segments for 3 min so
      // Back/forward and repeat navigations are instant instead of refetching.
      dynamic: 0,
      static: 180,
    },
  },
};

export default nextConfig;
