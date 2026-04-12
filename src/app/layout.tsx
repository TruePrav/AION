import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import { ThemeProvider } from "@/components/ThemeProvider";
import AIChatLoader from "@/components/AIChatLoader";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "AION — Smart Money Intelligence",
  description: "Multi-chain smart money tracking, wallet grading, and automated token discovery.",
  icons: {
    icon: "/favicon.svg",
  },
};

// Runs before React hydrates — prevents a light/dark flash on first paint.
const NO_FLASH_SCRIPT = `
(function(){try{
  var t=localStorage.getItem('aion-theme');
  if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
  var r=document.documentElement;
  if(t==='dark'){r.classList.add('dark');}else{r.classList.remove('dark');}
  r.classList.add('ocean-theme');
  r.style.colorScheme=t;
}catch(e){}})();
`;

// Microsoft Clarity — free heatmaps & session recordings
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "";
const CLARITY_SCRIPT = CLARITY_ID
  ? `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${CLARITY_ID}");`
  : "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, jetbrainsMono.variable, "ocean-theme")} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
        {CLARITY_SCRIPT && <script dangerouslySetInnerHTML={{ __html: CLARITY_SCRIPT }} />}
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <ThemeProvider>
          <ConfirmProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AIChatLoader />
            <Analytics />
            <SpeedInsights />
          </ConfirmProvider>
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: "!bg-card !border !border-border !text-foreground !font-sans",
                title: "!text-foreground !font-medium",
                description: "!text-muted-foreground",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
