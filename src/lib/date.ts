export function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export function addMonths(date: string, months: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCMonth(value.getUTCMonth() + months);
  return value.toISOString().slice(0, 10);
}

export function formatDate(date: string) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(date));
}
