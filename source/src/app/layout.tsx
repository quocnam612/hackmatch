import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { ChatDrawer } from "@/components/ChatDrawer";
import { LeftSidebar } from "@/components/LeftSidebar";
import "./globals.css";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("hackmatch:theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HackMatch — Team-Matching for SPD Challenge 2026",
  description: "Register your skills, host or find a project, and get a constraint-matched team with an explanation.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Plain native <script>, not next/script: this must run synchronously
            from the server-rendered HTML before hydration, and only needs to
            execute once via the browser's own HTML parser. */}
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <Header />
        <div className="flex flex-1">
          <LeftSidebar />
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
        <ChatDrawer />
      </body>
    </html>
  );
}
