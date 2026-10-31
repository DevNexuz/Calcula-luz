import { Info, ShieldCheck, Zap } from 'lucide-react'

export function ReceiptGuide() {
  return <aside className="receipt-aside">
    <div className="guide-heading"><span className="icon-tile"><Info size={19} /></span><div><h3>Tu recibo, sin misterio</h3><p>Te ayudamos a encontrar lo importante.</p></div></div>
    <div className="receipt-scene">
      <div className="sample-receipt" aria-label="Ejemplo ilustrativo: busca Tarifa 1C en la parte superior del recibo">
        <div className="receipt-top"><Zap size={25} /><span>RECIBO DE ENERGÍA<br /><small>Ejemplo ilustrativo · sin validez</small></span></div>
        <div className="receipt-lines"><i /><i /><i /></div>
        <div className="receipt-meta"><span>USO<br /><b>Doméstico</b></span><span className="receipt-highlight">TARIFA<br /><b>1C</b></span><span>MEDIDOR<br /><b>••••••</b></span></div>
        <div className="receipt-period">PERIODO FACTURADO<div className="receipt-line" /></div>
        <div className="receipt-table"><span>Concepto</span><span>Consumo</span><span>Básico</span><span>— kWh</span><span>Intermedio</span><span>— kWh</span><span>Excedente</span><span>— kWh</span></div>
        <div className="receipt-total"><span>Consumo total</span><b>— kWh</b></div>
        <div className="barcode" aria-hidden="true" />
      </div>
      <div className="receipt-caption"><span className="small-dot" /> Busca «Tarifa» en la parte superior</div>
    </div>
    <p className="guide-note">El diseño de tu recibo puede variar. Lo importante es que en el campo <strong>Tarifa</strong> aparezca <strong>1C</strong>.</p>
    <div className="privacy-note"><ShieldCheck size={22} /><div><strong>Tu información se queda contigo.</strong><p>No subas tu recibo. No necesitamos tu nombre, domicilio ni número de servicio.</p></div></div>
  </aside>
}
