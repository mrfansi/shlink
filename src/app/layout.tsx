import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "Shlink - Modern URL Shortener",
		template: "%s | Shlink",
	},
	description: "Open source enterprise-grade URL shortener built with Next.js and Cloudflare Workers. Features analytics, custom domains, and QR codes.",
	keywords: ["url shortener", "link management", "analytics", "qr code", "open source"],
	authors: [{ name: "Shlink Team" }],
	creator: "Shlink Team",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://short.link",
		title: "Shlink - Modern URL Shortener",
		description: "Secure, fast, and reliable URL shortening for your business.",
		siteName: "Shlink",
	},
	twitter: {
		card: "summary_large_image",
		title: "Shlink - Modern URL Shortener",
		description: "Secure, fast, and reliable URL shortening for your business.",
		creator: "@shlink",
	},
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
		</html>
	);
}
