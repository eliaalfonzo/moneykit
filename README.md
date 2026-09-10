# 💰 MoneyKit

Una mini "caja de herramientas" financiera: conversor de monedas, porcentajes, descuentos, planificación de ahorro y una calculadora rápida — todo en una sola web, rápida y sin backend.

No es un gestor de finanzas personales. No hay usuarios, no hay base de datos, no se guardan gastos ni presupuestos. Solo cálculos instantáneos.

![status](https://img.shields.io/badge/estado-listo_para_desarrollo-10B981) ![stack](https://img.shields.io/badge/stack-React_%2B_TypeScript_%2B_Vite-14B8A6)

<div align="center">

# 🔗 Proyecto

### 🚀 Demo en línea

<a href="https://moneykit-six.vercel.app">
  <strong>💰 Ver MoneyKit en Vercel →</strong>
</a>

<br><br>

*Aplicación desplegada en Vercel y disponible para probar desde cualquier dispositivo.*

</div>

---

## Tabla de contenidos

1. [¿Qué incluye?](#qué-incluye)
2. [Stack técnico](#stack-técnico)
3. [Arquitectura hexagonal](#arquitectura-hexagonal)
4. [Estructura de carpetas](#estructura-de-carpetas)
5. [Cómo se aplican los principios SOLID](#cómo-se-aplican-los-principios-solid)
6. [Puesta en marcha](#puesta-en-marcha)
7. [Scripts disponibles](#scripts-disponibles)
8. [API de tasas de cambio](#api-de-tasas-de-cambio)
9. [Persistencia local](#persistencia-local)
10. [Estados de la aplicación](#estados-de-la-aplicación)
11. [Sistema de diseño](#sistema-de-diseño)
12. [Pruebas](#pruebas)
13. [Decisiones de diseño y trade-offs](#decisiones-de-diseño-y-trade-offs)
14. [Posibles mejoras futuras](#posibles-mejoras-futuras)

---

## ¿Qué incluye?

| Herramienta | Qué resuelve |
|---|---|
| 💱 **Conversor de monedas** | Convierte entre 11 monedas (VES, USD, EUR, GBP, CAD, BRL, COP, MXN, ARS, JPY, CHF) usando tasas en vivo, con botón de intercambio, tasa unitaria visible y hora de la última actualización. |
| % **Porcentajes** | 4 operaciones: "¿cuánto es el X% de Y?", "¿qué % representa A de B?", aumentar un valor en X% y disminuirlo en X%. |
| 🏷️ **Descuentos** | Precio original, descuento e impuesto opcional, con desglose paso a paso (subtotal → impuesto → total) y ahorro obtenido. |
| 💰 **Ahorro** | Meta, ahorro actual y aporte periódico (semanal/quincenal/mensual) → progreso, tiempo estimado y una sugerencia de "qué pasaría si ahorras un poco más". |
| 🧮 **Calculadora rápida** | Calculadora tradicional con historial persistido en `localStorage`. |
| 🏠 **Dashboard** | Punto de entrada con accesos directos a cada herramienta y el pulso de la tasa USD → VES. |

La aplicación funciona **sin conexión** para todo excepto obtener una tasa nueva: si la API falla o no hay internet, se sigue calculando con la última tasa guardada localmente.

## Stack técnico

- **React 18 + TypeScript** (modo `strict`)
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para estilos, con tokens de diseño vía variables CSS (soporta modo oscuro)
- **React Router** para las rutas de cada herramienta
- **Lucide React** para toda la iconografía de navegación y controles
- **Vitest** para pruebas unitarias del dominio
- `fetch` nativo (sin librerías HTTP) para consultar la API de tasas
- `localStorage` (sin librerías) para caché de tasas, tema e historial

No hay backend propio, base de datos ni autenticación: todo corre en el navegador del usuario.

## Arquitectura hexagonal

El proyecto sigue **arquitectura hexagonal (puertos y adaptadores)**. La idea central: la lógica de negocio (cuánto es un 15% de 500, cómo se calcula una tasa cruzada, cuándo se alcanza una meta de ahorro) **no sabe que existe React, `fetch` o `localStorage`**. Esas son piezas intercambiables que se conectan por fuera.

```
                          ┌─────────────────────────────┐
                          │            UI (React)        │
                          │  páginas · componentes · hooks│
                          └───────────────┬──────────────┘
                                          │ usa
                                          ▼
                          ┌─────────────────────────────┐
                          │      composition root         │
                          │   (src/composition/container) │
                          │  instancia adaptadores y los   │
                          │  inyecta en los casos de uso   │
                          └───────┬───────────────┬───────┘
                                  │               │
                     implementa  │               │  implementa
                                  ▼               ▼
     ┌────────────────────────────────┐   ┌────────────────────────────┐
     │   CORE — dominio + aplicación   │   │      INFRAESTRUCTURA        │
     │                                  │   │                              │
     │  entidades · value objects       │◄──┤  FetchExchangeRateApi        │
     │  reglas de negocio puras         │   │  (implementa el puerto        │
     │  casos de uso                    │   │   ExchangeRateRepository)     │
     │  puertos (interfaces)            │   │                              │
     │                                  │◄──┤  LocalStorageRateCache        │
     │  0 dependencias de React,        │   │  LocalStorageCalculatorHistory│
     │  fetch o localStorage            │   │  (implementan puertos del     │
     │                                  │   │   dominio)                   │
     └──────────────────────────────────┘   └──────────────────────────────┘
```

- **Dominio** (`src/core/**/domain`): entidades, value objects y **puertos** (interfaces) — por ejemplo `ExchangeRateRepository`, que define "necesito poder pedir tasas de cambio" sin decir cómo.
- **Aplicación** (`src/core/**/application`): los **casos de uso** (`ConvertCurrencyUseCase`, `CalculateDiscountUseCase`, `CalculateSavingsPlanUseCase`, etc.) que orquestan el dominio. Son funciones/clases puras, testeables sin levantar React ni mockear `fetch`.
- **Infraestructura** (`src/infrastructure`): los **adaptadores** que implementan esos puertos con tecnología concreta: `FetchExchangeRateApi` (llama a la API real por `fetch`), `LocalStorageRateCache`, `LocalStorageCalculatorHistory`.
- **Composition root** (`src/composition/container.ts`): el único archivo que sabe qué adaptador concreto usar. Si mañana cambiamos la API de tasas o pasamos de `localStorage` a `IndexedDB`, **solo se toca este archivo**.
- **UI** (`src/ui`): componentes, páginas y hooks de React. Consumen los casos de uso a través del `container`, nunca importan `infrastructure` directamente.

Esto es justo la **inversión de dependencias**: el dominio define el contrato, la infraestructura lo cumple, y todo se conecta en un único punto.

## Estructura de carpetas

```
src/
├── core/                         # Dominio + aplicación (TypeScript puro, sin React)
│   ├── shared/                   # Result<T,E>, Money, DateProvider
│   ├── currency/
│   │   ├── domain/                # Currency, ExchangeRate, puertos
│   │   └── application/           # ConvertCurrencyUseCase, RefreshExchangeRatesUseCase
│   ├── percentage/
│   ├── discount/
│   ├── savings/
│   └── calculator/
│
├── infrastructure/                # Adaptadores concretos (detalles técnicos)
│   ├── http/FetchExchangeRateApi.ts
│   └── storage/                   # LocalStorageRateCache, LocalStorageCalculatorHistory, SafeLocalStorage
│
├── composition/
│   └── container.ts               # Composition root: cablea dominio + infraestructura
│
├── ui/
│   ├── hooks/                     # useExchangeRates, useOnlineStatus, useTheme
│   ├── context/                   # ToastProvider (reemplaza alert())
│   ├── components/
│   │   ├── layout/                # Sidebar, MobileDrawer, MobileHeader, FabMenu, AppLayout
│   │   └── ui/                    # Card, Button, Dropdown, Input, Skeleton, StatusBanner...
│   └── pages/                     # Dashboard, Converter, Percentage, Discount, Savings, Calculator
│
├── styles/globals.css             # Tokens de diseño (CSS vars) + estilos base
├── App.tsx                        # Definición de rutas
└── main.tsx                       # Punto de entrada

tests/core/                        # Pruebas unitarias del dominio (Vitest)
```

## Cómo se aplican los principios SOLID

| Principio | Dónde se ve en el código |
|---|---|
| **S** — Responsabilidad única | Cada caso de uso hace una sola cosa (`ConvertCurrencyUseCase` solo convierte; `RefreshExchangeRatesUseCase` solo decide API vs. caché). `Money` solo formatea/opera cantidades. `SafeLocalStorage` solo encapsula el `try/catch` de `localStorage`. |
| **O** — Abierto/cerrado | `CalculatePercentageUseCase` enruta por `mode` sin que agregar un quinto modo obligue a tocar los otros cuatro. Los componentes `Card`, `Button`, `Dropdown` se extienden por props, no editando su interior. |
| **L** — Sustitución de Liskov | Cualquier implementación de `ExchangeRateRepository` (la real por `fetch`, o una de prueba en memoria para tests) puede sustituir a otra sin romper `RefreshExchangeRatesUseCase`. |
| **I** — Segregación de interfaces | Puertos pequeños y específicos: `ExchangeRateRepository` (solo `fetchLatestRates`), `RateCacheRepository` (solo `save`/`load`), `CalculatorHistoryRepository` (solo historial). Nadie implementa métodos que no necesita. |
| **D** — Inversión de dependencias | Los casos de uso dependen de **interfaces** (`ports/*.ts`), nunca de `fetch` o `localStorage` directamente. Los adaptadores concretos se inyectan por constructor desde `composition/container.ts`. |

## Puesta en marcha

Requisitos: **Node.js 18+**.

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el entorno de desarrollo
npm run dev

# 3. Abrir el navegador en la URL que indique Vite (por defecto http://localhost:5173)
```

> Este proyecto se generó sin ejecutar `npm install` en el entorno donde fue creado (sin acceso a red), así que la primera instalación de dependencias la harás al descargarlo.

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Type-check (`tsc -b`) + build de producción con Vite. |
| `npm run preview` | Sirve localmente el build de producción. |
| `npm run lint` | ESLint sobre todo `src/`. |
| `npm run test` | Ejecuta las pruebas unitarias una vez. |
| `npm run test:watch` | Pruebas en modo watch. |

## API de tasas de cambio

Se usa [open.er-api.com](https://www.exchangerate-api.com/docs/free) (gratuita, sin API key) vía `fetch`:

```
GET https://open.er-api.com/v6/latest/USD
```

Toda la integración vive en `src/infrastructure/http/FetchExchangeRateApi.ts`. Si prefieres otro proveedor (por ejemplo uno con mejor cobertura para VES/ARS), **solo tienes que reescribir ese archivo** — el resto de la aplicación no cambia, porque depende del puerto `ExchangeRateRepository`, no de esta API en particular.

Manejo de fallos:
1. Se intenta `fetch` con un timeout de 8s.
2. Si falla (red caída, timeout, respuesta no-200, JSON inesperado), se devuelve un `Result` de error tipado — nunca se lanza una excepción sin controlar.
3. `RefreshExchangeRatesUseCase` recurre entonces a la última tabla de tasas guardada en `localStorage`.
4. Si tampoco hay caché (primer uso, sin conexión), se muestra el error real al usuario, sin bloquear el resto de calculadoras.

## Persistencia local

Todo vía `localStorage`, encapsulado en `SafeLocalStorage` (que absorbe errores de cuota, modo privado, etc.):

- `moneykit:rates:<BASE>` — última tabla de tasas conocida.
- `moneykit:calculator:history` — últimas operaciones de la calculadora rápida.
- `moneykit:theme` — preferencia de tema claro/oscuro.

## Estados de la aplicación

- **Cargando** → *skeletons* animados en vez de spinners genéricos.
- **Tasa actualizada** → aviso verde discreto.
- **Error de API** → aviso "⚠️ No se pudo actualizar la tasa", pero los cálculos siguen funcionando con la última tasa guardada.
- **Sin conexión** → banner naranja permanente indicando que se puede seguir calculando.
- **Resultado vacío / entrada inválida** → mensajes de error debajo del campo o un `EmptyState` ilustrado — **nunca `alert()`**.
- **Copiar resultado** → toast no bloqueante ("✓ Resultado copiado") en vez de un `alert`.

## Sistema de diseño

Paleta blanco + negro + verde + rosa (con toques pastel), implementada como variables CSS (`src/styles/globals.css`) para ofrecer modo claro/oscuro sin duplicar componentes:

| Token (clase Tailwind) | Claro | Oscuro | Uso |
|---|---|---|---|
| `bg-bg` (`--color-bg`) | `#FFFFFF` | `#050508` (negro) | Fondo general |
| `bg-surface` (`--color-surface`) | `#FFFFFF` | `#111116` | Tarjetas, header, sidebar |
| `text-ink` (`--color-ink`) | `#0A0A0F` (negro) | `#FAF5F8` (blanco cálido) | Texto principal |
| `text-muted` (`--color-muted`) | `#71717A` | `#A1A1AA` | Texto secundario |
| `border-border` (`--color-border`) | `#F4D4E6` (rosa muy suave) | `#281E26` | Bordes |
| `bg-brand-500` (`--color-brand`) | `#10B981` | `#34D399` | Verde — acciones primarias |
| `bg-accent-500` (`--color-pink`) | `#EC4899` | `#F472B6` | Rosa — acento secundario |
| `bg-brand-50` / `bg-accent-50` | pasteles | pasteles | Íconos, tips y resaltados puntuales |
| `bg-screen` (`--color-screen`) | `#18181B` | `#18181B` (fijo, no cambia) | Pantalla de la calculadora |
| `danger` | `#F43F5E` | — | Errores |
| `warning` | `#F59E0B` | — | Advertencias / sin conexión |

> **Nota técnica sobre `bg-screen`:** es un token deliberadamente *fijo* (mismo valor en claro y oscuro). La pantalla de la calculadora necesita texto blanco siempre legible; si usara `bg-ink` (que se invierte a un tono casi blanco en modo oscuro) el texto blanco quedaría invisible sobre un fondo también claro — ese era exactamente el bug reportado y ya corregido.

Principios seguidos: bordes visibles, sombras suaves (`shadow-soft`, `shadow-soft-lg`), esquinas redondeadas (`rounded-xl`/`2xl`), transiciones de ~150–220ms en hover/click, dropdowns con apertura animada y flecha que rota, toasts que entran desde abajo, y microinteracciones con `prefers-reduced-motion` respetado.

**Iconografía**: exclusivamente [Lucide React](https://lucide.dev) para navegación y controles; los emojis (🇻🇪, 👋, 🎉) se usan solo como acento decorativo puntual, nunca como icono funcional.

**Móvil**: header propio con menú hamburguesa, *drawer* animado desde la izquierda con fondo oscurecido, y un FAB en la esquina inferior derecha que despliega las 5 herramientas con animación en cascada (escala + fade + stagger) y rotación del ícono `+`.

**Escritorio**: además del sidebar fijo, la barra superior incluye un menú desplegable "Herramientas" (`src/ui/components/layout/ToolsMenu.tsx`) con el mismo patrón de apertura animada, cierre al hacer click fuera / `Escape`, y flecha que rota — pensado como acceso rápido equivalente al FAB móvil.

## Pruebas

El dominio puro (`src/core/**`) se testea sin mocks de React, `fetch` ni `localStorage`, porque no depende de ninguno:

```bash
npm run test
```

Cobertura incluida: casos de uso de porcentajes, descuentos, tasa cruzada/conversión de monedas y planificación de ahorro (progreso, meta alcanzada, aporte en cero).

## Decisiones de diseño y trade-offs

- **`Result<T, E>` en vez de excepciones** para errores esperables (validaciones, fallos de red): obliga a manejar el caso de error en cada punto de uso, en vez de depender de `try/catch` dispersos.
- **Un solo `container` (composition root)** en vez de un framework de inyección de dependencias: el proyecto es lo bastante pequeño para que una función que arma las dependencias a mano sea más clara que añadir una librería de DI.
- **`localStorage` en vez de IndexedDB**: los datos son pequeños (una tabla de tasas, un historial corto), así que no justifica la complejidad de IndexedDB. El puerto `RateCacheRepository` deja la puerta abierta a cambiarlo después.
- **Tasa promedio de semanas/quincenas por mes** (4.345 y 2.1725) en la calculadora de ahorro: es una aproximación consciente para dar una estimación en meses sin modelar calendarios reales; se documenta explícitamente en el código (`SavingsGoal.ts`).

---

# 📚 Aprendizajes del proyecto

MoneyKit fue desarrollado como un proyecto para practicar y consolidar conocimientos en:

* TypeScript.
* React.
* Arquitectura hexagonal.
* Principios SOLID.
* Separación de responsabilidades.
* Inyección de dependencias.
* Diseño de interfaces.
* Consumo de APIs.
* Manejo de errores.
* Persistencia local.
* Testing con Vitest.
* Diseño responsive.
* Organización de proyectos frontend.

Uno de los objetivos principales fue evitar que la aplicación terminara siendo simplemente un conjunto de componentes React con lógica mezclada.

La intención fue construir una estructura donde las **reglas de negocio puedan evolucionar independientemente de la interfaz y de las tecnologías externas**.

---

# 👩‍💻 Autora

**Elia Alfonzo**