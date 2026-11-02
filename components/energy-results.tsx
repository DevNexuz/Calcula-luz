'use client'
import { useState } from 'react'
import { Lightbulb, Printer, ArrowDownRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { type Appliance, estimate, formatEnergy as fmt, assumedWatts } from '@/lib/energy-model'

export function EnergyResults({ items, days, billed, changes }: { items: Appliance[]; days: number; billed: number | null; changes: string[] }) {
 const [target, setTarget] = useState(items[0]?.id || '')
 const [reduction, setReduction] = useState(25)
 const [ledWatts, setLedWatts] = useState('9')
 const [scenario, setScenario] = useState('time')
 const rows = items.map(item => ({ item, ...estimate(item) })).sort((a,b) => b.central - a.central)
 const total = rows.reduce((s,r) => s+r.central,0), low = rows.reduce((s,r) => s+r.low,0), high = rows.reduce((s,r) => s+r.high,0)
 const selected = rows.find(r => r.item.id === target) || rows[0]
 const led = scenario === 'led' && selected.item.kind === 'lights'
 const validLed = ledWatts !== '' && Number.isFinite(Number(ledWatts)) && Number(ledWatts) >= 1 && Number(ledWatts) <= 200
 const saved = led ? validLed ? selected.central * (1 - Number(ledWatts)/assumedWatts(selected.item)) : 0 : selected.central * reduction/100
 const saveSummary = () => {
  const date = new Date()
  const lines = [
   'CALCULA-LUZ · Entiende tu recibo con claridad',
   `Resumen guardado el ${date.toLocaleDateString('es-MX', { dateStyle: 'long' })}`,
   '',
   `Periodo: ${days} días`,
   `Consumo estimado con tus aparatos: ${fmt(total)} kWh (escenarios orientativos: ${fmt(low)}–${fmt(high)} kWh)`,
   ...(billed !== null ? [`Consumo facturado que ingresaste: ${fmt(billed)} kWh`, `${billed >= total ? 'Diferencia sin explicar' : 'La estimación supera al recibo'}: ${fmt(Math.abs(billed - total))} kWh`] : []),
   '',
   'DÓNDE SE ESTÁ USANDO LA ENERGÍA',
   ...rows.map(r => `- ${r.item.name} × ${r.item.quantity}: ${fmt(r.central)} kWh`),
   ...(changes.length > 0 ? ['', 'LO QUE CAMBIÓ EN ESTE PERIODO', ...changes.map(c => `- ${c}`)] : []),
   '',
   'AVISO',
   'Cálculo aproximado con fines informativos. No es una auditoría ni un documento de CFE.',
   'Para aclaraciones sobre tu recibo, consulta directamente a CFE (071 o cfe.mx).',
   'Herramienta independiente, no avalada por CFE. Un proyecto de MykuzNexuz.',
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `calcula-luz-resumen-${date.toISOString().slice(0, 10)}.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Safari and Firefox can cancel the download if the URL is revoked synchronously.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
 }
 return <div className="results-stack">
  <div className="diagnosis-total"><span>Tu hogar · {days} días · estimación</span><strong>{fmt(total)} <small>kWh</small></strong><p>Escenarios orientativos: {fmt(low)}–{fmt(high)} kWh</p><p>No es una medición ni un rango garantizado.</p></div>
  {billed !== null && <section className="comparison"><h3>¿Cómo se compara con tu recibo?</h3><dl><div><dt>Lo facturado que ingresaste</dt><dd>{fmt(billed)} kWh</dd></div><div><dt>Lo estimado con tus aparatos</dt><dd>{fmt(total)} kWh</dd></div><div><dt>{billed >= total ? 'Diferencia sin explicar' : 'La estimación supera al recibo'}</dt><dd>{fmt(Math.abs(billed-total))} kWh</dd></div></dl><p className="helper">Comparamos el mismo periodo, sin forzar una coincidencia. Una diferencia no demuestra un cobro incorrecto: revisa hábitos, potencias y equipos que falten.</p></section>}
  <section><h3>¿Dónde se está usando la energía?</h3><p className="helper">Ordenado por el consumo estimado de los equipos que incluiste.</p><ul className="consumption-list">{rows.map(r => <li key={r.item.id}><div><strong>{r.item.name} × {r.item.quantity}</strong><span>{fmt(r.central)} kWh</span></div><p>{r.item.kind === 'fridge' ? `${r.item.daily || '1.44'} kWh/día` : `${assumedWatts(r.item)} W`} · {r.item.days} días {r.item.kind !== 'fridge' && `· ${r.item.hours} h${r.item.kind === 'washer' || r.item.kind === 'dryer' ? `/carga · ${r.item.cycles} cargas/semana` : '/día'}`} · {r.item.kind === 'fridge' ? r.item.daily ? 'Dato ingresado' : 'Referencia orientativa' : r.item.watts ? 'Potencia ingresada' : 'Potencia orientativa'}</p></li>)}</ul></section>
  {total > 0 && <p className="finding"><Lightbulb size={22}/><span><strong>{rows[0].item.name}</strong> es el mayor contribuyente estimado entre tus equipos. Afina sus datos antes de decidir una compra.</span></p>}
  {changes.length > 0 && <section><h3>Lo que cambió en este periodo</h3><p>{changes.join(' · ')}.</p><p className="helper">Son pistas, no causas demostradas. Ya deben estar reflejadas en las horas y días ingresados; no añadimos consumo por marcarlas.</p></section>}
  <section className="what-if"><span className="section-kicker">PRUEBA UN CAMBIO</span><h3>¿Y si…?</h3><FieldGroup><Field><FieldLabel htmlFor="target">Equipo que quieres ajustar</FieldLabel><select id="target" value={selected.item.id} onChange={e => {setTarget(e.target.value);setScenario('time')}}>{rows.map(r => <option key={r.item.id} value={r.item.id}>{r.item.name}</option>)}</select></Field>{selected.item.kind === 'lights' && <Field><FieldLabel htmlFor="scenario">Qué quieres cambiar</FieldLabel><select id="scenario" value={scenario} onChange={e => setScenario(e.target.value)}><option value="time">Reducir horas de encendido</option><option value="led">Cambiar a focos LED</option></select></Field>}{led ? <Field data-invalid={!validLed}><FieldLabel htmlFor="led-watts">Watts de cada foco nuevo</FieldLabel><Input id="led-watts" type="number" min="1" max="200" value={ledWatts} aria-invalid={!validLed} onChange={e => setLedWatts(e.target.value)}/><p className="helper">Compara focos de luminosidad equivalente (lúmenes). No recomendamos comprar solo por este cálculo.</p>{!validLed && <p role="alert">Ingresa de 1 a 200 watts.</p>}</Field> : <Field><FieldLabel htmlFor="reduction">{selected.item.kind === 'fridge' ? 'Reducir energía diaria' : selected.item.kind === 'washer' || selected.item.kind === 'dryer' ? 'Reducir cargas' : 'Reducir horas de uso'}: {reduction}%</FieldLabel><input id="reduction" type="range" min="0" max="50" step="5" value={reduction} onChange={e => setReduction(Number(e.target.value))}/>{selected.item.kind === 'fridge' && <p className="helper">Meta hipotética de eficiencia, no una recomendación de desconectar el refrigerador ni comprometer alimentos.</p>}</Field>}</FieldGroup><div className="savings"><ArrowDownRight size={24}/><div><strong>{fmt(Math.abs(saved))} kWh {saved < 0 ? 'más' : 'menos'}</strong><p>Tu hogar pasaría a {fmt(total-saved)} kWh estimados en {days} días.</p></div></div><p className="helper">Simulación manteniendo lo demás igual. En climatización, reducir horas no garantiza una reducción proporcional. No es una promesa de ahorro.</p></section>
  <details className="refine"><summary>¿Y cuánto es en pesos? ¿Estoy en DAC?</summary><div className="refine-body"><p><strong>Por qué no lo pasamos a pesos.</strong> Calcula-Luz te dice cuánta energía usas y en qué, no cuánto pagas. El importe depende de cuotas que CFE actualiza con frecuencia, de la temporada (verano o fuera de verano), del IVA y de otros cargos como el alumbrado público. Si mostráramos pesos sin cuotas verificadas, podríamos darte una cifra equivocada.</p><p><strong>Por qué hay distintas tarifas.</strong> CFE asigna a cada localidad una tarifa doméstica (1, 1A, 1B, 1C, 1D, 1E o 1F) según qué tan caluroso es su verano. En las zonas más calurosas, como Monterrey con la 1C, el consumo con precio subsidiado es mayor porque se necesita más aire acondicionado. Por eso dos casas con el mismo consumo pueden pagar distinto en ciudades diferentes. El diagnóstico de consumo funciona igual con cualquier tarifa doméstica.</p><p><strong>Qué es DAC.</strong> Significa «Doméstica de Alto Consumo». Es una tarifa sin subsidio que CFE aplica cuando tu consumo promedio de los últimos 12 meses supera el límite de alto consumo de tu tarifa. En DAC, cada kWh cuesta bastante más.</p><p><strong>El bloque excedente no es DAC.</strong> Que parte de tu consumo caiga en el bloque excedente solo significa que esos kWh se cobran al precio más alto dentro de tu tarifa. Un solo recibo no determina si estás en DAC; cuenta el promedio de todo el año.</p><p><strong>Cómo salir de dudas.</strong> Busca en tu recibo la tarifa que tienes asignada (aparece como «Tarifa» junto a tus datos de servicio). Si aparece «DAC» o tienes dudas sobre tu cobro, consulta a CFE directamente en el 071 o en cfe.mx.</p><a href="https://app.cfe.mx/Aplicaciones/CCFE/Tarifas/TarifasCRECasa/Casa.aspx" target="_blank" rel="noreferrer">Ver todas las tarifas para casa en CFE ↗</a></div></details>
  <p className="estimate-notice"><strong>Antes de sacar conclusiones:</strong> esto es una guía, no una auditoría de CFE. Los escenarios no incluyen automáticamente todos tus aparatos. Para comprobar consumos se requiere medición adecuada. No manipules el medidor, tablero ni cableado; solicita personal calificado si sospechas una falla.</p>
  <p className="helper">Método v1 · octubre de 2026. Potencia × tiempo × cantidad; lavado por cargas y refrigeración por energía diaria. Escenarios generales: 60%–140% del centro; climas: 40%–100% de operación equivalente, centro 65%. Son supuestos exploratorios, no límites de consumo ni intervalos estadísticos. Herramienta independiente, no avalada por CFE.</p>
  <div className="flex flex-col gap-3 sm:flex-row print:hidden">
   <Button type="button" onClick={saveSummary}><Download data-icon="inline-start"/> Guardar resumen</Button>
   <Button type="button" variant="outline" onClick={() => window.print()}><Printer data-icon="inline-start"/> Imprimir resumen y supuestos</Button>
  </div>
  <p className="helper print:hidden">El archivo se crea en tu dispositivo y se descarga directamente. No se envía ni se guarda en ningún servidor.</p>
 </div>
}
