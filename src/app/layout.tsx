import "~/styles/globals.css";

import { Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { ModalProvider } from "~/app/providers/modal";
import { BoardProvider } from "~/app/providers/board";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata = {
  title: "Kan",
  description: "The open source Trello alternative",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable}`}>
      <body className="h-screen overflow-hidden font-sans">
        <TRPCReactProvider headers={headers()}>
          <ModalProvider>
            <BoardProvider>{children}</BoardProvider>
          </ModalProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
