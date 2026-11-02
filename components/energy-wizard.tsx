'use client'

import { useRef, useState } from 'react'
import { ArrowRight, ArrowLeft, Check, FileText, Lightbulb, LockKeyhole, ShieldCheck, Zap, RotateCcw, Snowflake, Fan, Refrigerator, Tv, Laptop, WashingMachine, Wind, Plug, Plus, Trash2, House } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ApplianceForm } from './appliance-form'
import { EnergyResults } from './energy-results'
import { catalog, createAppliance, validateAppliance, type Appliance, type Kind } from '@/lib/energy-model'
import { cn } from '@/lib/utils'

const steps = ['Tu periodo', 'Tus aparatos', 'Tus hábitos', 'Tu diagnóstico']
const icons = { ac: Snowflake, fan: Fan, fridge: Refrigerator, tv: Tv, computer: Laptop, washer: WashingMachine, dryer: Wind, lights: Lightbulb, other: Plug }
const changeOptions = ['Usé más el clima', 'Hubo más personas en casa', 'Trabajé desde casa', 'Compré un aparato', 'Estuve fuera algunos días']

export function EnergyWizard() {
 const [step, setStep] = useState(0)
 const [mode, setMode] = useState('receipt')
 const [start, setStart] = useState('')
 const [end, setEnd] = useState('')
 const [duration, setDuration] = useState('30')
 const [usage, setUsage] = useState('')
 const [previousReading, setPreviousReading] = useState('')
 const [currentReading, setCurrentReading] = useState('')
 const [multiplier, setMultiplier] = useState('1')
 const [items, setItems] = useState<Appliance[]>([])
 const [active, setActive] = useState(0)
 const [changes, setChanges] = useState<string[]>([])
 const [error, setError] = useState('')
 const [info, setInfo] = useState(false)
 const heading = useRef<HTMLHeadingElement>(null)
 const days = mode === 'receipt' ? Math.round((Date.parse(end) - Date.parse(start))/86400000) : Number(duration)
 const readingsFilled = previousReading.trim() !== '' && currentReading.trim() !== '' && multiplier.trim() !== ''
 const factor = Number(multiplier)
 const readingDelta = Number(currentReading) - Number(previousReading)
 const validFactor = Number.isFinite(factor) && factor > 0 && factor <= 10000
 const meterUsage = readingsFilled && validFactor && Number.isFinite(readingDelta) && readingDelta >= 0 ? Math.round(readingDelta * factor * 100) / 100 : null
 function focusHeading() { requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }) }) }
 function go(next: number) { setStep(next);setError('');focusHeading() }
 function toggle(kind: Kind) {
  setItems(prev => prev.some(a => a.kind === kind) ? prev.filter(a => a.kind !== kind) : [...prev, createAppliance(kind, days, crypto.randomUUID())])
 }
 function next() {
  if (step === 0) {
   if (!Number.isFinite(days) || !Number.isInteger(days) || days < 1 || days > 366 || (mode === 'receipt' && (!start || !end || usage.trim() === '' || !Number.isFinite(Number(usage)) || Number(usage) < 0 || Number(usage) > 100000))) { setError('Ingresa un periodo de 1 a 366 días y, si tienes recibo, su consumo entre 0 y 100,000 kWh.'); return }
   setItems(prev => prev.map(a => ({...a, days: String(Math.min(Number(a.days), days))})))
  }
  if (step === 1) { if (!items.length) {setError('Selecciona al menos un aparato para estimar su consumo.');return} setActive(0) }
  if (step === 2) {
   const issue = validateAppliance(items[active], days)
   if (issue) {setError(issue);return}
   if (active < items.length-1) {setActive(active+1);setError('');focusHeading();return}
   const invalid = items.findIndex(a => validateAppliance(a, days))
   if (invalid >= 0) {setActive(invalid);setError(validateAppliance(items[invalid],days) || 'Revisa este equipo.');return}
  }
  go(Math.min(3,step+1))
 }
 function back() { if (step === 2 && active > 0) {setActive(active-1);setError('');focusHeading()} else go(step-1) }
 function reset() { setItems([]);setChanges([]);setStart('');setEnd('');setUsage('');setPreviousReading('');setCurrentReading('');setMultiplier('1');setDuration('30');setActive(0);setMode('receipt');go(0) }
 const progress = step === 2 ? (2 + active / Math.max(1,items.length))/4 * 100 : (step+1)*25
 const titles = ['¿Te llegó caro y no sabes por qué?', '¿Qué usas en casa?', `Hablemos de ${items[active]?.name.toLowerCase() || 'tus hábitos'}`, 'Esto podría explicar tu consumo']
 return <div className="home-diagnosis font-sans">
  <header className="diagnosis-header"><a href="/" className="brand" aria-label="Calcula-Luz, inicio"><span className="brand-symbol"><Zap size={23} fill="currentColor"/></span><span className="brand-text"><span className="brand-name">Calcula<span className="brand-light">-Luz</span></span><span className="brand-tagline">Entiende tu recibo con claridad</span></span></a><button type="button" onClick={() => setInfo(!info)} aria-expanded={info} aria-label="Privacidad y método"><ShieldCheck size={18}/><span>Privacidad y método</span></button></header>
  {info && <section className="method-panel"><h2>Transparente, desde el principio.</h2><p>Tus respuestas se procesan en este dispositivo, no se envían a nuestros servidores y no se guardan. Desaparecen al recargar o cerrar. El alojamiento puede generar registros técnicos de acceso; no incluimos analítica ni solicitamos datos personales.</p><p>Modelo orientativo v1 · octubre de 2026. Calculamos watts × horas × días × cantidad ÷ 1,000. Para lavado usamos cargas semanales y duración; para refrigeradores, energía diaria. Los valores iniciales son supuestos editables de diseño, no promedios oficiales ni mediciones de tu equipo.</p><p>Los escenarios generales aplican 60%–140% al cálculo central. Para climas usamos 40%–100% de operación equivalente y 65% como centro. No son intervalos estadísticos. Las toneladas orientan una suposición de 1,200 W por tonelada, no una conversión física; afina con potencia eléctrica del modelo.</p><p>Fuentes: la etiqueta del fabricante permite afinar potencia o energía. Las reglas de facturación se consultan en <a href="https://app.cfe.mx/Aplicaciones/CCFE/Tarifas/TarifasCRECasa/Tarifas/Tarifa1C.aspx" target="_blank" rel="noreferrer">CFE</a>. No calculamos pesos ni DAC automáticamente.</p><p>Herramienta independiente, no afiliada ni avalada por CFE. No sustituye una medición, el recibo oficial ni una aclaración con la compañía.</p><p>Multiplicador: al calcular con lecturas usamos (lectura actual − lectura anterior) × multiplicador. En servicios domésticos suele ser 1; puedes cambiarlo si tu recibo indica otro valor. El consumo impreso en el recibo ya lo incluye.</p><Button variant="outline" onClick={() => setInfo(false)}>Cerrar información</Button></section>}
  <div className="diagnosis-layout"><aside className="diagnosis-sidebar"><div><p className="section-kicker">TU CASA, CON MÁS CLARIDAD</p><h2>La luz no se va<br/>por arte de magia.</h2><p>Descubre qué aparatos pueden explicar tu consumo y qué cambios valen la pena explorar.</p></div><ol>{steps.map((label,i) => <li key={label} className={cn(i === step && 'current', i < step && 'finished')}><span>{i < step ? <Check size={17}/> : i+1}</span><strong>{label}</strong></li>)}</ol><div className="sidebar-trust"><LockKeyhole size={22}/><p>Sin cuentas. Sin subir recibos.<br/>Tus datos se quedan contigo.</p></div></aside>
  <main className="diagnosis-main"><div className="mobile-step"><span>PASO {step+1} DE 4 · {steps[step]}</span><span>{step === 2 ? `${active+1} de ${items.length} equipos` : 'A tu ritmo'}</span></div><div className="diagnosis-progress" role="progressbar" aria-label="Avance del diagnóstico" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${progress}%`}}/></div>
  <div className="diagnosis-heading"><span className="heading-icon">{step === 0 ? <House size={24}/> : step === 3 ? <Lightbulb size={24}/> : <Plug size={24}/>}</span><h1 ref={heading} tabIndex={-1}>{titles[step]}</h1><p>{['Vamos a buscar pistas en tus aparatos y hábitos, no en tus datos personales.', 'Selecciona los que tienes. Solo preguntaremos por los que elijas.', `Piensa en lo que ocurrió durante estos ${days} días, no en un día ideal.`, `Una estimación de tus equipos durante ${days} días. Tú decides qué cambiar.`][step]}</p></div>
  <section className="diagnosis-card"><form onSubmit={e => {e.preventDefault();next()}} onKeyDown={e => {if(e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()}}>
  {step === 0 && <div className="question-stack"><fieldset className="entry-options"><legend>¿Cómo quieres empezar?</legend>{[{value:'receipt',title:'Tengo mi recibo',copy:'Comparar con los kWh que me cobraron',icon:FileText},{value:'estimate',title:'Quiero estimar mi consumo',copy:'Explorar mis aparatos, sin recibo',icon:Lightbulb}].map(({value,title,copy,icon:Icon}) => <label key={value} className={cn('entry-option',mode === value && 'selected')}><input type="radio" name="mode" value={value} checked={mode === value} onChange={() => {setMode(value);setError('')}}/><Icon size={24}/><span><strong>{title}</strong><small>{copy}</small></span><span className="selection-circle">{mode === value && <Check size={14}/>}</span></label>)}</fieldset>
   <FieldGroup>{mode === 'receipt' ? <><div className="date-fields"><Field><FieldLabel htmlFor="start">Inicio del periodo</FieldLabel><Input id="start" type="date" required value={start} onChange={e => setStart(e.target.value)}/></Field><Field><FieldLabel htmlFor="end">Fin del periodo</FieldLabel><Input id="end" type="date" required value={end} onChange={e => setEnd(e.target.value)}/></Field></div><Field><FieldLabel htmlFor="usage">Consumo del recibo (kWh)</FieldLabel><Input id="usage" type="number" inputMode="decimal" required min="0" max="100000" step=".01" value={usage} placeholder="Por ejemplo, 600" onChange={e => setUsage(e.target.value)}/><p className="helper">Busca «Consumo» o «Energía (kWh)», no el total en pesos. Usamos los días transcurridos entre las fechas.</p></Field>
   <details className="meter-calc"><summary>¿No encuentras el consumo? Calcúlalo con las lecturas del medidor</summary><div className="meter-body"><p className="helper">Restamos la lectura anterior a la actual y la multiplicamos por el multiplicador de tu recibo. En casa casi siempre es 1.</p><div className="date-fields"><Field><FieldLabel htmlFor="previous-reading">Lectura anterior</FieldLabel><Input id="previous-reading" type="number" inputMode="decimal" min="0" step="any" value={previousReading} placeholder="Por ejemplo, 15200" onChange={e => setPreviousReading(e.target.value)}/></Field><Field><FieldLabel htmlFor="current-reading">Lectura actual</FieldLabel><Input id="current-reading" type="number" inputMode="decimal" min="0" step="any" value={currentReading} placeholder="Por ejemplo, 15800" onChange={e => setCurrentReading(e.target.value)}/></Field></div><Field data-invalid={multiplier.trim() !== '' && !validFactor ? true : undefined}><FieldLabel htmlFor="multiplier">Multiplicador</FieldLabel><Input id="multiplier" type="number" inputMode="decimal" min="0" max="10000" step="any" value={multiplier} aria-invalid={multiplier.trim() !== '' && !validFactor} aria-describedby="multiplier-help" onChange={e => setMultiplier(e.target.value)}/><p id="multiplier-help" className="helper">Déjalo en 1 salvo que tu recibo indique otro valor. Debe ser mayor que 0.</p></Field>
   {validFactor && factor !== 1 && <p className="estimate-notice" role="status"><strong>Tu multiplicador no es 1.</strong> Es común en negocios o servicios con transformadores de medición. Calcula-Luz está pensada para casas con Tarifa 1C, así que el resultado podría no reflejar tu tarifa. Confirma el dato con CFE.</p>}
   {readingsFilled && validFactor && readingDelta < 0 && <p className="estimate-notice" role="status"><strong>La lectura actual es menor que la anterior.</strong> Puede deberse a un cambio de medidor o a que el contador reinició. En ese caso, usa el consumo impreso en tu recibo.</p>}
   {meterUsage !== null && <div className="meter-result" role="status"><p><span>Consumo calculado</span><strong>{meterUsage.toLocaleString('es-MX')} kWh</strong><small>({readingDelta.toLocaleString('es-MX')} × {factor.toLocaleString('es-MX')})</small></p><Button type="button" variant="outline" onClick={() => {setUsage(String(meterUsage));setError('')}}><Check data-icon="inline-start"/> Usar este consumo</Button></div>}
   {meterUsage !== null && usage.trim() !== '' && Number(usage) !== meterUsage && <p className="helper">Si no coincide con tu recibo, puede ser una lectura estimada, otro periodo o ajustes de CFE. Prefiere el consumo impreso en el recibo.</p>}
   </div></details></> : <Field><FieldLabel htmlFor="duration">¿Cuántos días quieres analizar?</FieldLabel><Input id="duration" type="number" inputMode="numeric" min="1" max="366" required value={duration} onChange={e => setDuration(e.target.value)}/><p className="helper">Puedes comenzar con 30 días. No mostraremos una comparación con CFE sin tu consumo facturado.</p></Field>}</FieldGroup>
   <p className="estimate-notice"><strong>Una guía, no una medición.</strong> Estimamos a partir de tus respuestas. El resultado puede diferir del consumo real y de tu recibo.</p></div>}
  {step === 1 && <div className="question-stack"><fieldset><legend className="question-legend">Selecciona tus aparatos</legend><div className="appliance-grid">{catalog.map(d => {const Icon = icons[d.key];const checked = items.some(a => a.kind === d.key);return <label key={d.key} className={cn('appliance-option',checked && 'selected')}><input type="checkbox" checked={checked} onChange={() => toggle(d.key)}/><Icon size={25}/><strong>{d.name}</strong><small>{d.hint}</small><span className="selection-circle">{checked && <Check size={14}/>}</span></label>})}</div></fieldset><fieldset className="habit-changes"><legend className="question-legend">¿Cambió algo en este periodo? <span>Opcional</span></legend>{changeOptions.map(label => <label key={label}><input type="checkbox" checked={changes.includes(label)} onChange={e => setChanges(e.target.checked ? [...changes,label] : changes.filter(c => c !== label))}/>{label}</label>)}</fieldset><p className="helper">Lo que no incluyas no aparecerá en el cálculo. Más adelante puedes añadir equipos por habitación o con usos distintos.</p></div>}
  {step === 2 && items[active] && <div className="question-stack"><div className="equipment-position"><span>Equipo {active+1} de {items.length}</span>{items.length > 1 && <Button type="button" variant="ghost" onClick={() => {setItems(items.filter((_,i) => i !== active));setActive(Math.max(0,active-1));setError('')}}><Trash2 data-icon="inline-start"/> Quitar</Button>}</div><ApplianceForm item={items[active]} period={days} onChange={item => {setItems(items.map((a,i) => i === active ? item : a));setError('')}}/><Button type="button" variant="outline" onClick={() => {const a = items[active];setItems([...items,{...createAppliance(a.kind,days,crypto.randomUUID()), name:`Otro ${a.name.toLowerCase()}`}])}}><Plus data-icon="inline-start"/> Añadir otro con distinto uso</Button></div>}
  {step === 3 && <EnergyResults key={JSON.stringify(items)} items={items} days={days} billed={mode === 'receipt' ? Number(usage) : null} changes={changes}/>}
  {error && <p role="alert" className="estimate-notice">{error}</p>}
  <div className="diagnosis-actions">{step > 0 && <Button type="button" variant="outline" onClick={back}><ArrowLeft data-icon="inline-start"/> Atrás</Button>}{step < 3 ? <Button type="submit" size="lg">{step === 0 ? 'Empezar mi diagnóstico' : step === 2 && active === items.length-1 ? 'Ver mi diagnóstico' : 'Continuar'}<ArrowRight data-icon="inline-end"/></Button> : <Button type="button" variant="outline" onClick={reset}><RotateCcw data-icon="inline-start"/> Empezar de nuevo</Button>}</div>
  </form></section><p className="diagnosis-footnote"><LockKeyhole size={16}/> No guardamos tus respuestas ni las enviamos a servidores.</p></main></div>
  <footer className="diagnosis-footer"><p className="footer-disclaimer"><strong>Cálculo aproximado con fines informativos.</strong> Los resultados dependen de tus respuestas y pueden diferir de tu consumo real y de tu recibo. Para conocer el detalle oficial de tu consumo o hacer una aclaración, acude a <a href="https://www.cfe.mx" target="_blank" rel="noopener noreferrer">CFE<span className="sr-only"> (se abre en una pestaña nueva)</span></a> o llama al 071.</p><div className="footer-row"><span>Un proyecto de <strong className="text-foreground">MykuzNexuz</strong> · <a href="https://github.com/DevNexuz" target="_blank" rel="noopener noreferrer">Código en GitHub<span className="sr-only"> (se abre en una pestaña nueva)</span></a></span><span>Independiente. No afiliado ni avalado por CFE.</span><button onClick={() => {setInfo(true);window.scrollTo({top:0,behavior:'smooth'})}}>Método, límites y privacidad</button></div></footer>
 </div>
}
