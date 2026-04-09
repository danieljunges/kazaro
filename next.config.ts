import type { NextConfig } from "next";
import { attachSecurityHeadersToConfig } from "@/lib/security/http-security-headers";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
    ],
  },
};

export default attachSecurityHeadersToConfig(nextConfig);
