/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Tillat bilder fra Supabase Storage. Bytt ut host når du kjenner
    // ditt Supabase-prosjekt (f.eks. abcxyz.supabase.co).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
