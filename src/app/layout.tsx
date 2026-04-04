import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AGENCY_CONFIG } from '@/utils/agency-config'
import { CookieBanner } from "@/components/cookie-banner";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: `${AGENCY_CONFIG.name} | Internal Tool`,
  description: AGENCY_CONFIG.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {process.env.NEXT_PUBLIC_GSC_ID && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GSC_ID} />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-950 font-sans">
        <TooltipProvider>
          {children}
          <CookieBanner />
          <Toaster position="top-right" closeButton richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
