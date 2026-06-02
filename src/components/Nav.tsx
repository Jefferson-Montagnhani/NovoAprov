"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sair } from "@/app/actions/auth";

const LINKS = [
  { href: "/", label: "Painel" },
  { href: "/ordens", label: "Ordens de Serviço" },
  { href: "/pedidos", label: "Follow Up" },
  { href: "/entregas", label: "Entregas" },
];

export function Nav({ nome }: { nome: string }) {
  const pathname = usePathname();

  function ativo(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-bold text-slate-900">
            NovoAprov
          </Link>
          <nav className="flex gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  ativo(l.href)
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">
            {nome}
          </span>
          <form action={sair}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
