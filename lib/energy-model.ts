export const catalog = [
  { key: 'ac', name: 'Aire acondicionado', category: 'Climatización', hint: 'Climas y minisplits', watts: 1200, hours: 8 },
  { key: 'fan', name: 'Ventilador', category: 'Climatización', hint: 'De piso, techo o pared', watts: 60, hours: 8 },
  { key: 'fridge', name: 'Refrigerador', category: 'Cocina', hint: 'En funcionamiento todo el día', watts: 60, hours: 24 },
  { key: 'tv', name: 'Televisión', category: 'Entretenimiento', hint: 'Pantallas de cualquier tamaño', watts: 100, hours: 4 },
  { key: 'computer', name: 'Computadora', category: 'Trabajo', hint: 'Laptop o computadora de escritorio', watts: 150, hours: 6 },
  { key: 'washer', name: 'Lavadora', category: 'Lavado', hint: 'Cargas de ropa por semana', watts: 500, hours: 1 },
  { key: 'dryer', name: 'Secadora', category: 'Lavado', hint: 'Eléctrica o de gas', watts: 3000, hours: 1 },
  { key: 'lights', name: 'Focos', category: 'Iluminación', hint: 'LED, ahorradores o incandescentes', watts: 9, hours: 5 },
  { key: 'other', name: 'Otro aparato', category: 'Otros', hint: 'Microondas, bomba, boiler…', watts: 1000, hours: 1 },
] as const
export type Kind = typeof catalog[number]['key']
export type Appliance = { id: string; kind: Kind; name: string; quantity: string; hours: string; days: string; cycles: string; watts: string; tons: string; technology: string; daily: string }
export const definition = (kind: Kind) => catalog.find(d => d.key === kind)!
export const isCycle = (kind: Kind) => kind === 'washer' || kind === 'dryer'
export function createAppliance(kind: Kind, days: number, id: string): Appliance {
 const d = definition(kind)
 return { id, kind, name: d.name, quantity: '1', hours: String(d.hours), days: String(days), cycles: '3', watts: '', tons: '', technology: kind === 'lights' ? 'led' : kind === 'dryer' ? 'electric' : 'unknown', daily: '' }
}
export function assumedWatts(a: Appliance) {
 if (a.watts !== '') return Number(a.watts)
 if (a.kind === 'ac') return Number(a.tons || 1) * 1200
 if (a.kind === 'lights') return a.technology === 'incandescent' ? 60 : a.technology === 'cfl' ? 15 : 9
 if (a.kind === 'dryer' && a.technology === 'gas') return 300
 return definition(a.kind).watts
}
export function estimate(a: Appliance) {
 const q = Number(a.quantity), days = Number(a.days)
 const hours = isCycle(a.kind) ? Number(a.cycles) * days / 7 * Number(a.hours) : Number(a.hours) * days
 const base = a.kind === 'fridge' ? Number(a.daily || 1.44) * days * q : assumedWatts(a) / 1000 * hours * q
 // AC scenarios represent equivalent full-load operation, not measured duty cycles.
 const central = a.kind === 'ac' ? base * .65 : base
 const low = a.kind === 'ac' ? base * .4 : central * .6
 const high = a.kind === 'ac' ? base : central * 1.4
 return { central, low, high }
}
export function validateAppliance(a: Appliance, period: number): string | null {
 const valid = (v: string, min: number, max: number) => v.trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max
 if (!a.name.trim()) return 'Escribe un nombre para identificar este equipo.'
 if (!valid(a.quantity, 1, 100) || !Number.isInteger(Number(a.quantity))) return 'La cantidad debe ser un entero de 1 a 100.'
 if (!valid(a.days, 0, period) || !Number.isInteger(Number(a.days))) return `Los días de uso deben ser un entero de 0 a ${period}.`
 if (!valid(a.hours, 0, 24)) return 'Las horas deben estar entre 0 y 24.'
 if (isCycle(a.kind) && (!valid(a.cycles, 0, 100) || Number(a.cycles) * Number(a.hours) > 168)) return 'Revisa las cargas por semana: no pueden superar 168 horas de uso semanal por equipo.'
 if (a.watts !== '' && !valid(a.watts, 1, 30000)) return 'La potencia debe estar entre 1 y 30,000 watts.'
 if (a.daily !== '' && !valid(a.daily, .01, 100)) return 'El consumo diario debe estar entre 0.01 y 100 kWh.'
 if (a.kind === 'ac' && a.tons !== '' && !valid(a.tons, .5, 5)) return 'Selecciona una capacidad válida.'
 if (a.kind === 'other' && a.watts === '') return 'Para otros aparatos, necesitamos la potencia eléctrica en watts.'
 return null
}
export const formatEnergy = (n: number) => n.toLocaleString('es-MX', { maximumFractionDigits: 1 })
