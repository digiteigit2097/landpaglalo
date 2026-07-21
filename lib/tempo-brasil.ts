// Utilitário simples de fuso horário: America/Sao_Paulo é UTC-3 o ano
// inteiro desde o fim do horário de verão em 2019. Evita depender de lib
// de timezone só pra isso.
const OFFSET_MS = -3 * 60 * 60 * 1000;

export function inicioDoDiaBrasil(data: Date = new Date()): Date {
  const localMs = data.getTime() + OFFSET_MS;
  const local = new Date(localMs);
  const inicioLocal = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
    0,
    0,
    0
  );
  return new Date(inicioLocal - OFFSET_MS);
}

export function fimDoDiaBrasil(data: Date = new Date()): Date {
  const inicio = inicioDoDiaBrasil(data);
  return new Date(inicio.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function dataBrasilISO(data: Date = new Date()): string {
  const localMs = data.getTime() + OFFSET_MS;
  const local = new Date(localMs);
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const d = String(local.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function inicioDoDiaBrasilPorData(diaISO: string): Date {
  const [y, m, d] = diaISO.split("-").map(Number);
  const inicioLocal = Date.UTC(y, m - 1, d, 0, 0, 0);
  return new Date(inicioLocal - OFFSET_MS);
}
