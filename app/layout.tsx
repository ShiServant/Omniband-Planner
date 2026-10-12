import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "cn";
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
  description: "Current projects, responsibilities, meetings, and decisions.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const editing = await hasEditAccess();

  return (
    <html lang="en" className={cn("h-full font-sans", geist.variable)}>
      <body className="min-h-full">
        <AppShell siteName={siteName} editing={editing}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
