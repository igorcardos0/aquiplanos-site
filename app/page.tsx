"use client"
import { useEffect } from "react"
import Header from "@/components/header"
import Hero from "@/components/hero"
import Operadoras from "@/components/operadoras"
import SocialProof from "@/components/social-proof"
import Benefits from "@/components/benefits"
import HowItWorks from "@/components/how-it-works"
import Cases from "@/components/cases"
import ConversionForm from "@/components/conversion-form"
import FAQ from "@/components/faq"
import Footer from "@/components/footer"

export default function Home() {
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash
      if (hash) {
        const id = hash.substring(1)
        setTimeout(() => {
          const element = document.getElementById(id)
          if (element) {
            element.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)
      }
    }

    handleHashScroll()

    window.addEventListener('hashchange', handleHashScroll)

    return () => {
      window.removeEventListener('hashchange', handleHashScroll)
    }
  }, [])

  return (
    <div>
      <Header />
      <Hero />
      <Operadoras />
      <SocialProof />
      <Benefits />
      <HowItWorks />
      <Cases />
      <ConversionForm />
      <FAQ />
      <Footer />
    </div>
  )
}
