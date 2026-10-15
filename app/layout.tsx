import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "cn";
import { EntryGate } from "@/components/entry-gate";
import { AppShell } from "@/components/layout/app-shell";
import { hasEditAccess } from "@/lib/admin/session";
import { getSiteName } from "@/lib/site";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const siteName = getSiteName();

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: "Current projects, responsibilities, meetings, and tasks.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const editing = await hasEditAccess();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full font-sans", geist.variable)}
    >
      <body className="min-h-full">
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html[data-entered='1'] .entry-gate{display:none!important}",
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(sessionStorage.getItem("planner-entered")==="1"){document.documentElement.setAttribute("data-entered","1")}}catch(e){}',
          }}
        />
        <EntryGate siteName={siteName} />
        <div id="app">
          <AppShell siteName={siteName} editing={editing}>
            {children}
          </AppShell>
        </div>
      </body>
    </html>
  );
}
