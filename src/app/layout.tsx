import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { CyberBackground } from "@/components/cyber-background";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IEEE MTT-S Student Chapter — Join the Club",
  description:
    "Apply to join the IEEE MTT-S university student chapter. Pick from Technical, Design, Management, or Social.",
  icons: {
    icon: "/ieee-mtts.png",
  },
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('ieeemtts-theme');
    var dark = stored ? stored === 'dark' : true;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <CyberBackground />
        <AuthProvider>
          <MotionConfig reducedMotion="user">
            {children}
            <Toaster />
          </MotionConfig>
        </AuthProvider>
      </body>
    </html>
  );
}