import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.2.100", "172.26.2.219"],
};

export default nextConfig;
