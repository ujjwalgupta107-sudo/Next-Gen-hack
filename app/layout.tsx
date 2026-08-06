import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofVault AI — Protecting Digital Creativity Through AI & Blockchain",
  description:
    "Decentralized ownership verification platform. Prove ownership of digital assets using AI fingerprinting and blockchain anchoring. Fast, cheap, global, tamper-proof.",
  keywords: [
    "digital ownership",
    "blockchain",
    "AI",
    "copyright",
    "NFT",
    "IPFS",
    "creator economy",
    "Web3",
  ],
  openGraph: {
    title: "ProofVault AI",
    description: "Protecting Digital Creativity Through AI & Blockchain",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
