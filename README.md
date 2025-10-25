# Claude - The Craft Brewer's Ledger

**Registro de Cervecería Artesanal para Molina Cerveza Artesanal**

Una aplicación web estática y autónoma para el seguimiento financiero y de producción de cervecerías artesanales pequeñas, con cálculo preciso del Costo Por Pinta (CPP) y precios recomendados.

## 🍺 Características

### Gestión de Producción
- Registro de lotes de producción por tipo de cerveza
- Seguimiento de volumen producido (pintas)
- Registro de horas laborales
- Control de costos de ingredientes

### Gestión Financiera
- Registro de transacciones (ingresos y gastos)
- Categorización de gastos
- Registro de ventas
- Cálculo automático de ganancia/pérdida

### Análisis y Reportes
- **Cálculo de Costo Por Pinta (CPP)** preciso por periodo
- **Precios Recomendados** por tipo de cerveza (basado en CPP + margen)
- Tablero con KPIs principales
- Gráficas interactivas:
  - Ingresos vs Gastos Mensuales
  - Desglose de Gastos
  - Producción Mensual
  - Tendencia de Costo por Pinta
- Estado de Pérdidas y Ganancias (PyG) con filtros
- Análisis por tipo de cerveza

### Gestión de Datos
- Almacenamiento local (localStorage)
- Exportación de datos en JSON
- Importación de datos desde JSON
- No requiere servidor ni internet

## 🚀 Inicio Rápido

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere instalación de software adicional

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/dorianguzman/cerveza-molina.git
   cd cerveza-molina
   ```

2. **Abrir la aplicación:**
   - Simplemente abre `index.html` en tu navegador
   - O usa un servidor local:
     ```bash
     # Con Python 3
     python -m http.server 8000

     # Con Node.js (si tienes http-server instalado)
     npx http-server
     ```

3. **¡Listo!** La aplicación está funcionando completamente en tu navegador.

### Despliegue en GitHub Pages

1. Ve a Settings → Pages en GitHub
2. Selecciona la rama `main` como fuente
3. La aplicación estará disponible en: `https://dorianguzman.github.io/cerveza-molina/`

## 📊 Cálculo del Costo Por Pinta (CPP)

La aplicación implementa un cálculo preciso del CPP usando la fórmula:

```
CPP = (Costo Variable Total + Costo Fijo Amortizado + Costo de Mano de Obra Directa) / Total de Pintas Producidas
```

Donde:
- **Costo Variable (VC):** Ingredientes y empaque consumidos
- **Costo Fijo Amortizado (FCA):** Porción asignada de costos fijos mensuales (alquiler, salarios, servicios)
- **Costo de Mano de Obra Directa (DLC):** Horas laborales × tarifa por hora

### Precios Recomendados

La aplicación calcula automáticamente precios recomendados para cada tipo de cerveza:

```
Precio Recomendado = CPP × Multiplicador de Margen
```

- Multiplicador predeterminado: **3x** (configurable)
- Calculado individualmente por tipo de cerveza
- Visible en los reportes de producción

## 🎨 Diseño

Basado en la identidad visual de Molina Cerveza Artesanal:
- **Colores principales:** Rojo artesanal (#802A2A) y tonos cálidos
- **Tipografía:** Playfair Display (títulos) y Source Sans Pro (cuerpo)
- **Estética:** Cálida, sofisticada, artesanal

## 📁 Estructura del Proyecto

```
cerveza-molina/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos Molina
├── js/
│   ├── data.js             # Gestión de datos y localStorage
│   ├── calculations.js     # Motor de cálculos financieros
│   ├── dashboard.js        # Renderizado de tablero y gráficas
│   └── app.js              # Lógica principal de la app
├── assets/
│   └── logo-molina.png     # Logo de Molina
└── README.md
```

## 🛠️ Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos (custom, sin frameworks)
- **Vanilla JavaScript** - Lógica (ES6+)
- **Chart.js** - Visualizaciones
- **localStorage** - Persistencia de datos

**Sin dependencias de servidor. 100% cliente.**

## 📖 Uso

### 1. Registrar Producción
1. Ve a la sección "Producción"
2. Ingresa los datos del lote:
   - Fecha
   - Nombre de la cerveza
   - Volumen producido (pintas)
   - Horas laborales
   - Costo de ingredientes
3. Click en "Registrar Lote"

### 2. Registrar Transacciones
1. Ve a "Transacciones"
2. Ingresa:
   - Fecha
   - Descripción
   - Monto
   - Tipo (Ingreso/Gasto)
   - Categoría
3. Click en "Registrar Transacción"

### 3. Registrar Ventas
1. Ve a "Ventas"
2. Ingresa:
   - Fecha
   - Ingreso total
   - Volumen vendido (pintas)
3. Click en "Registrar Ventas"

### 4. Ver Tablero
- El tablero se actualiza automáticamente
- Filtra por mes/año usando los controles
- Visualiza KPIs y gráficas

### 5. Generar Reportes
1. Ve a "Reportes"
2. Selecciona mes y año
3. Click en "Generar Reporte"
4. Ve el Estado de PyG completo con análisis por cerveza

### 6. Exportar/Importar Datos
1. Ve a "Datos"
2. Para exportar: Click en "Exportar Datos (JSON)"
3. Para importar: Selecciona archivo JSON y click en "Importar"

## 💡 Consejos

- **Respaldos regulares:** Exporta tus datos semanalmente
- **Múltiples años:** La aplicación soporta datos de múltiples años
- **Análisis por cerveza:** Usa los reportes para ver el CPP de cada tipo
- **Margen de ganancia:** El multiplicador 3x es estándar para craft beer, pero puedes ajustarlo según tu mercado

## 🔒 Privacidad y Seguridad

- Todos los datos se almacenan localmente en tu navegador
- No hay servidor externo
- No se envían datos a internet
- Tus datos financieros permanecen privados
- **Importante:** Haz respaldos regulares (exportar JSON)

## 📱 Compatibilidad

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Responsive (móvil y tablet)

## 🤝 Contribuciones

Este proyecto fue desarrollado específicamente para Molina Cerveza Artesanal.

## 📄 Licencia

Propietario: Molina Cerveza Artesanal

## 👨‍💻 Desarrollo

**Versión:** 1.0 MVP
**Desarrollado con:** Claude Code
**Fecha:** Octubre 2023

## 🐛 Soporte

Para reportar problemas o sugerencias, contacta al equipo de Molina Cerveza Artesanal.

---

**🍺 ¡Salud! Hecho con ❤️ para la comunidad cervecera artesanal.**
