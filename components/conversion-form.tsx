"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { trackConversion } from "@/lib/analytics"

export default function ConversionForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: "",
    empresa: "",
    cargo: "",
    email: "",
    telefone: "",
    vidas: "",
    cnpj: "",
    operadora: "",
  })

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/)
    if (!match) return value
    const [, area, number, ext] = match
    if (ext) return `(${area}) ${number}-${ext}`
    if (number) return `(${area}) ${number}`
    if (area) return `(${area}`
    return ""
  }

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/)
    if (!match) return value
    const [, a, b, c, d, e] = match
    if (e) return `${a}.${b}.${c}/${d}-${e}`
    if (d) return `${a}.${b}.${c}/${d}`
    if (c) return `${a}.${b}.${c}`
    if (b) return `${a}.${b}`
    if (a) return a
    return ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    let formattedValue = value

    if (name === "telefone") {
      formattedValue = formatPhone(value)
    } else if (name === "cnpj") {
      formattedValue = formatCNPJ(value)
    } else if (name === "vidas") {
      const numValue = Number.parseInt(value) || 0
      formattedValue = Math.max(0, numValue).toString()
    }

    setFormData({
      ...formData,
      [name]: formattedValue,
    })
  }

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const PHP_ENDPOINT = "https://app.aquiplanos.com.br/send_lead.php"

    console.log("📤 Enviando dados do formulário:", formData)

    try {
      const response = await fetch(PHP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), 
      })

      console.log("📥 Resposta recebida:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("❌ Resposta não é JSON:", text)
        alert(
          `Erro: O servidor retornou uma resposta inválida. Verifique o console para detalhes.`
        )
        return
      }

      const result = await response.json()
      console.log("📋 Resultado parseado:", result)

      if (response.ok && result.success) {
        trackConversion("form_submit_success", {
          category: "conversion",
          label: "form_submit",
          value: 1,
        })

        router.push("/obrigado?source=form")
      } else {
        console.error("❌ Erro na resposta:", result)
        alert(
          `Erro ao enviar a cotação: ${result.message || "Erro desconhecido. Tente novamente mais tarde."}`
        )
      }
    } catch (error) {
      console.error("❌ Erro de rede/script:", error)
      if (error instanceof TypeError) {
        alert(
          "Erro de conexão: Não foi possível conectar ao servidor. Verifique se o endpoint está correto."
        )
      } else if (error instanceof SyntaxError) {
        alert(
          "Erro: Resposta inválida do servidor. Verifique o console para detalhes."
        )
      } else {
        alert(
          "Erro de conexão. Por favor, verifique sua rede ou tente novamente mais tarde."
        )
      }
    }
  }

  return (
    <section id="formulario" className="py-20 px-4 sm:px-6 lg:px-8 gradient-primary">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-2 text-balance">
          Solicite sua cotação empresarial
        </h2>

        <p className="text-white/80 text-center mb-12">
          Em até 2h, nossa equipe envia as melhores opções para o seu CNPJ.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 shadow-2xl space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #06b28c")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            />
            <input
              type="text"
              name="empresa"
              placeholder="Nome da empresa"
              value={formData.empresa}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #06b28c")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="cargo"
              placeholder="Cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #06b28c")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail corporativo"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #06b28c")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="tel"
              name="telefone"
              placeholder="Numero de telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #06b28c")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            />
            <input
              type="number"
              name="vidas"
              placeholder="Quantas vidas (colaboradores)"
              value={formData.vidas}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #06b28c")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="cnpj"
              placeholder="CNPJ"
              value={formData.cnpj}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #06b28c")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            />
            <input
              type="text"
              name="operadora"
              placeholder="Operadora atual (opcional)"
              value={formData.operadora}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #06b28c")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            />
          </div>

          <button
            type="submit"
            className="w-full text-white font-bold py-3 rounded-lg transition duration-300"
            style={{ background: "linear-gradient(to right, #004fd7, #06b28c)" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 15px rgba(0, 79, 215, 0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
          >
            Receber cotação agora
          </button>

          <p className="text-center text-sm text-gray-500">
            🔒 Seus dados estão seguros. Nenhuma informação será compartilhada.
          </p>
        </form>
      </div>
    </section>
  )
}
