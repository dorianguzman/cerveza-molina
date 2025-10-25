<div align="center">

<a href="https://dorianguzman.github.io/cerveza-molina/">
  <img src="assets/small_logo.jpg" alt="Molina Logo" width="120">
</a>

# 🍺 Molina - Sistema de Gestión para Cervecería Artesanal

**Sistema completo de registro y análisis financiero para cervecerías artesanales**

**[🚀 Abrir Aplicación](https://dorianguzman.github.io/cerveza-molina/)** | **[📖 Manual de Usuario](MANUAL_USUARIO.md)**

</div>

---

## ¿Qué es Molina app?

Una aplicación web completa para el control de producción, finanzas y cálculo del **Costo Por Chela (CPC)** de tu cervecería artesanal.

### Características Principales

- 📦 **Gestión de Producción** - Registra lotes, volumen, horas y costos
- 💰 **Control Financiero** - Transacciones categorizadas e ingresos por ventas
- 📊 **Análisis Completo** - Dashboard con KPIs y gráficas interactivas
- 🧮 **Costo Por Chela** - Cálculo preciso con fórmula estándar
- 🔐 **Autenticación Segura** - Acceso protegido con contraseña + GitHub PAT
- 💾 **Almacenamiento GitHub** - Todos tus datos sincronizados en GitHub

---

## 🚀 Inicio Rápido

### Opción 1: Uso en Línea (Recomendado)

Simplemente abre: **https://dorianguzman.github.io/cerveza-molina/**

Requiere autenticación con contraseña y GitHub Personal Access Token.

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
├── auth-hash.json          # Hash de contraseña
├── css/styles.css          # Estilos Molina
├── js/
│   ├── auth.js             # Sistema de autenticación
│   ├── data.js             # Gestión de datos (GitHub)
│   ├── calculations.js     # Fórmulas CPC
│   ├── dashboard.js        # Gráficas Chart.js
│   ├── github-sync.js      # API GitHub
│   └── app.js              # Lógica principal
└── assets/                 # Logo e imágenes
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
- GitHub REST API para almacenamiento
- SHA-256 para autenticación

**Sin dependencias de servidor. 100% client-side.**

---

## 🔒 Privacidad

- Todos los datos se almacenan en tu repositorio privado de GitHub
- Autenticación requerida: contraseña + GitHub Personal Access Token
- Sin tracking, sin analytics, sin bases de datos externas
- Tú controlas el repositorio y puedes hacer backups cuando quieras

---

## 📄 Licencia

**Propietario:** Molina Cerveza Artesanal
**Versión:** 1.0 MVP

---

**🍺 ¡Salud! Hecho con ❤️ para Cerveza Artesanal Molina**
