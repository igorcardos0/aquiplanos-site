import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { AnalyticsProvider } from '../providers/AnalyticsProvider'; 

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://app.aquiplanos.com.br'),
  title: {
    default: "Aqui Planos - Planos de Saúde Empresariais com Menores Reajustes",
    template: "%s | Aqui Planos",
  },
  description:
    "Conectamos sua empresa às melhores operadoras de saúde do país. Mais de 30 mil colaboradores atendidos com redução comprovada de custos. Receba sua cotação em 24h!",

  generator: "V4 COMPANY - ROSOLEN & VERONZE CO.",
  keywords: ["planos de saúde empresariais", "cotação", "CNPJ", "saúde corporativa"],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  
  openGraph: {
    title: "Cotação de Plano de Saúde Empresarial - Aqui Planos",
    description: "Receba as melhores ofertas de planos de saúde para o seu CNPJ em até 24 horas!",
    url: "https://app.aquiplanos.com.br/",
    siteName: "Aqui Planos",
    images: [
      {
        url: "/social-share-image.png",
        width: 1200,
        height: 630,
        alt: "Logo da Aqui Planos e slogan de cotação empresarial",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  icons: {
    icon: '/favicon.ico', 
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  verification: {
    other: {
      "facebook-domain-verification": "ygtimavpdvk0qz1cvayb07v9n2az1z",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
        
        <Analytics />
      </body>
    </html>
  )
}