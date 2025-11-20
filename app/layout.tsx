import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Importação corrigida para apontar para a pasta providers dentro de app
import { AnalyticsProvider } from '../providers/AnalyticsProvider'; 

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://app.aquiplanos.com.br'),
  // 1. TÍTULO E DESCRIÇÃO
  title: {
    default: "Aqui Planos - Planos de Saúde Empresariais com Menores Reajustes", // Título padrão
    template: "%s | Aqui Planos", // Como o título será formatado em páginas filhas
  },
  description:
    "Conectamos sua empresa às melhores operadoras de saúde do país. Mais de 30 mil colaboradores atendidos com redução comprovada de custos. Receba sua cotação em 24h!",

  // 2. TAGS DE UTILIDADE E ROBOTS
  generator: "V4 COMPANY - ROSOLEN & VERONZE CO.",
  keywords: ["planos de saúde empresariais", "cotação", "CNPJ", "saúde corporativa"],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  
  // 3. OPEN GRAPH (COMPARTILHAMENTO SOCIAL)
  openGraph: {
    title: "Cotação de Plano de Saúde Empresarial - Aqui Planos",
    description: "Receba as melhores ofertas de planos de saúde para o seu CNPJ em até 24 horas!",
    url: "https://app.aquiplanos.com.br/",
    siteName: "Aqui Planos",
    images: [
      {
        url: "/social-share-image.png", // Imagem na pasta /public
        width: 1200,
        height: 630,
        alt: "Logo da Aqui Planos e slogan de cotação empresarial",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  // 4. ÍCONES
  icons: {
    icon: '/favicon.ico', 
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png', // Ícone para iOS
  },

  // 5. VERIFICAÇÃO DE DOMÍNIO (FACEBOOK)
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
    // Adicionado 'suppressHydrationWarning' para evitar erros com extensões como Tag Assistant
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        {/*
          Envolvemos o 'children' com o AnalyticsProvider para que o
          rastreamento funcione em toda a aplicação.
        */}
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
        
        <Analytics />
      </body>
    </html>
  )
}