# Calcula-Luz

**Entiende tu recibo con claridad.**

Calcula-Luz es una herramienta web gratuita que ayuda a entender el consumo eléctrico de una casa en México. Ayuda a responder **«¿por qué consumí tanto?»** a partir de los aparatos y hábitos del hogar, y lo compara con los kWh del recibo de CFE.

Hecho por **MykuzNexuz**.

## Qué hace

- Te pregunta paso a paso por tus aparatos (climas, refrigerador, lavadora, focos, televisiones y otros) y por cuántas horas los usas.
- Estima cuántos kWh consume cada aparato en el periodo y cuáles pesan más.
- Compara el estimado con el consumo de tu recibo, o lo calcula con las lecturas del medidor y el multiplicador.
- Simula cambios, como pasar a focos LED o usar menos el clima, para ver cuánto bajaría el consumo.
- Te deja guardar o imprimir un resumen en tu propio dispositivo.

Calcula-Luz trabaja en **kWh, no en pesos**. Explica los escalones de tarifa y la tarifa DAC, pero no calcula cuánto pagarás.

## Privacidad

- Todo funciona en el navegador. No hay cuentas, base de datos ni analítica.
- Tus respuestas no se envían a ningún servidor.
- El resumen guardado se descarga a tu dispositivo.

## Aviso

Calcula-Luz es una herramienta independiente, sin relación con la Comisión Federal de Electricidad (CFE) ni avalada por ella. Los resultados son aproximados y solo informativos. No es una auditoría ni sustituye a tu recibo. Para aclaraciones, comunícate con CFE al **071** o entra a [cfe.mx](https://www.cfe.mx).

Por ahora está pensada para servicios domésticos.

## Desarrollo

Hecho con Next.js, React, TypeScript y Tailwind CSS.

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:3000`.

Para la versión de producción:

```bash
pnpm build
pnpm start
```

## Licencia

[MIT](./LICENSE) © 2026 MykuzNexuz
