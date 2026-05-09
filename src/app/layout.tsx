import "./globals.css";

export const metadata = {
  title: "Empaerial | We Don’t Fly. We Redefine Air.",
  description:
    "Empaerial is an elite international UAV innovation team engineering the future of aerospace — where flight is redefined through precision, code, and vision.",
  icons: { icon: "/images/logo.png" },
  viewport: "width=device-width, initial-scale=1.0",
  keywords: [
    "Empaerial",
    "UAV",
    "Drone Innovation",
    "Aerospace Engineering",
    "Empærial",
    "International Team",
    "Drone Research",
    "Next-Gen UAV",
    "Autonomous Flight"
  ],
  authors: [{ name: "Empaerial Team" }],
  openGraph: {
    title: "Empaerial | We Don’t Fly. We Redefine Air.",
    description:
      "Empaerial — the global UAV innovation program redefining flight with next-generation technology and international collaboration.",
    url: "https://empaerial.com",
    siteName: "Empaerial",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Empaerial UAV logo and futuristic drone concept",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Empaerial | We Don’t Fly. We Redefine Air.",
    description:
      "Empaerial — global UAV innovation, advanced aerospace design, and international collaboration redefining flight.",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Propeller symbol — referenced via <use href="#prop-bare"/> anywhere in the tree */}
        <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }} aria-hidden="true">
          <defs>
            <symbol id="prop-bare" viewBox="0 0 200 60">
              <path d="M 2 30 L 98 30 C 78 52,26 52,2 30 Z" fill="currentColor" />
              <path d="M 198 30 L 102 30 C 122 8,174 8,198 30 Z" fill="currentColor" />
              <circle cx="100" cy="30" r="9" fill="currentColor" />
            </symbol>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
