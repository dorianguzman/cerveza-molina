<div align="center">

<a href="https://dorianguzman.github.io/cerveza-molina/">
  <img src="assets/small_logo.jpg" alt="Molina Logo" width="120">
</a>

# 🍺 Molina - Sistema de Gestión para Cervecería Artesanal

**Sistema completo de registro y análisis financiero para cervecerías artesanales**

**[🚀 Abrir Aplicación](https://dorianguzman.github.io/cerveza-molina/)** | **[📖 Manual de Usuario](MANUAL_USUARIO.md)**

</div>

---

## ¿Qué es Molina?

Una aplicación web completa para el control de producción, finanzas y cálculo del **Costo Por Chela (CPC)** de tu cervecería artesanal. 100% gratuita, sin servidor, funciona en tu navegador.

### Características Principales

- 📦 **Gestión de Producción** - Registra lotes, volumen, horas y costos
- 💰 **Control Financiero** - Transacciones categorizadas e ingresos por ventas
- 📊 **Análisis Completo** - Dashboard con KPIs y gráficas interactivas
- 🧮 **Costo Por Chela** - Cálculo preciso con fórmula estándar
- 💾 **Tus Datos, Tu Control** - Todo en tu navegador, exporta/importa JSON
- 🔄 **Sync GitHub** - Opcional, comparte datos entre dispositivos

---

## 🚀 Inicio Rápido

### Opción 1: Uso en Línea (Recomendado)

Simplemente abre: **https://dorianguzman.github.io/cerveza-molina/**

No requiere instalación. Funciona en cualquier navegador moderno.

### Opción 2: Instalación Local

```bash
git clone https://github.com/dorianguzman/cerveza-molina.git
cd cerveza-molina
open index.html  # o python -m http.server 8000
```

---

## 📖 Documentación

**Para usuarios:** Lee el **[Manual de Usuario completo](MANUAL_USUARIO.md)** con explicaciones detalladas, ejemplos y casos de uso.

Incluye:
- Cómo usar cada sección paso a paso
- Diferencias entre Transacciones y Ventas
- Explicación de cálculos y fórmulas
- Casos de uso prácticos
- Tips y mejores prácticas
- FAQ

---

## 🏗️ Estructura Técnica

```
cerveza-molina/
├── index.html              # Aplicación SPA
├── README.md               # Este archivo
├── MANUAL_USUARIO.md       # Manual completo para usuarios
├── css/styles.css          # Estilos Molina
├── js/
│   ├── data.js             # Persistencia localStorage
│   ├── calculations.js     # Fórmulas CPC
│   ├── dashboard.js        # Gráficas Chart.js
│   ├── github-sync.js      # Sync GitHub API
│   └── app.js              # Lógica principal
├── assets/                 # Logo e imágenes
└── data/                   # JSON para GitHub sync
```

---

## 🧮 Fórmula del Costo Por Chela

```
CPC = (Costo Variable + Costo Fijo Amortizado + Costo Mano de Obra) / Total Chelas
```

Donde:
- **Costo Variable:** Ingredientes por lote
- **Costo Fijo Amortizado:** Renta, salarios, servicios del periodo
- **Costo Mano de Obra:** Horas × Tarifa configurable

El sistema calcula automáticamente y recomienda precios con margen configurable (default: 3x).

---

## 🛠️ Tecnologías

- HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- Chart.js para visualizaciones
- localStorage para persistencia
- GitHub REST API para sincronización (opcional)

**Sin dependencias de servidor. 100% client-side.**

---

## 🔒 Privacidad

- Todos los datos se guardan localmente en tu navegador
- Sin tracking, sin analytics, sin servidores externos
- GitHub sync es opcional (requiere Personal Access Token)
- Haz backups regulares exportando tus datos

---

## 📄 Licencia

**Propietario:** Molina Cerveza Artesanal
**Desarrollado con:** Claude Code by Anthropic
**Versión:** 1.0 MVP

---

**🍺 ¡Salud! Hecho con ❤️ para la comunidad cervecera artesanal mexicana**
