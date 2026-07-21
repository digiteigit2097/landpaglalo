"use client";

import { useEffect } from "react";

export default function AutoPrint() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 300);
    const fechar = () => {
      try {
        window.close();
      } catch {
        // se o navegador não deixar fechar (aba não veio de window.open),
        // não tem problema, só fica aberta
      }
    };
    window.addEventListener("afterprint", fechar);
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", fechar);
    };
  }, []);

  return null;
}
