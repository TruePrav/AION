import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "AION — Smart Money Intelligence",
  description: "Multi-chain smart money tracking, wallet grading, and automated token discovery.",
};

// Runs before React hydrates — prevents a light/dark flash on first paint.
const NO_FLASH_SCRIPT = `
(function(){try{
  var t=localStorage.getItem('oracle-theme');
  if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
  var r=document.documentElement;
  if(t==='dark'){r.classList.add('dark');}else{r.classList.remove('dark');}
  r.style.colorScheme=t;
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, jetbrainsMono.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <ThemeProvider>
          <ConfirmProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
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
