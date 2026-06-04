"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setCarregando(true);

    // O client é criado aqui (no browser, no clique) e não na renderização,
    // para que a página /login possa ser prerenderizada no build sem depender
    // das variáveis NEXT_PUBLIC_SUPABASE_* estarem presentes naquele momento.
    const supabase = createClient();

    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) {
        setErro("E-mail ou senha inválidos.");
        setCarregando(false);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      });
      if (error) {
        setErro(error.message);
        setCarregando(false);
        return;
      }
      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setMensagem(
          "Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login.",
        );
        setModo("entrar");
        setCarregando(false);
      }
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">NovoAprov</h1>
          <p className="mt-1 text-sm text-slate-500">
            Follow Up de Pedidos de Compra
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {modo === "criar" && (
            <Campo
              label="Nome"
              value={nome}
              onChange={setNome}
              type="text"
              required
            />
          )}
          <Campo
            label="E-mail"
            value={email}
            onChange={setEmail}
            type="email"
            required
          />
          <Campo
            label="Senha"
            value={senha}
            onChange={setSenha}
            type="password"
            required
          />

          {erro && <p className="text-sm text-red-600">{erro}</p>}
          {mensagem && <p className="text-sm text-emerald-600">{mensagem}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {carregando
              ? "Aguarde..."
              : modo === "entrar"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => {
            setModo(modo === "entrar" ? "criar" : "entrar");
            setErro(null);
            setMensagem(null);
          }}
          className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-700"
        >
          {modo === "entrar"
            ? "Não tem conta? Criar conta"
            : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      />
    </label>
  );
}
