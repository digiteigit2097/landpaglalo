"use client";

// Preferência por dispositivo (cada computador/tablet do balcão decide o
// próprio jeito de tocar o alerta), por isso fica no localStorage e não no
// banco.
const CHAVE_VOZ_ALERTA = "dogao-admin-voz-alerta";

export function vozAlertaAtiva(): boolean {
  if (typeof window === "undefined") return true;
  const valor = localStorage.getItem(CHAVE_VOZ_ALERTA);
  return valor === null ? true : valor === "1";
}

export function definirVozAlerta(ativa: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAVE_VOZ_ALERTA, ativa ? "1" : "0");
}
