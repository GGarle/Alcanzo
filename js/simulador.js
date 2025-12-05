// ============================================
// ALCANZO - SIMULADOR
// Versión: cálculo en vivo + resumen + colapsables
// ============================================

// 1) LISTENERS BÁSICOS

const simInputs = document.querySelectorAll(".sim-input");
simInputs.forEach((input) => {
  input.addEventListener("input", calcular);
  input.addEventListener("change", calcular);
});

const btnCalcular = document.getElementById("btn_calcular");
if (btnCalcular) {
  btnCalcular.addEventListener("click", (ev) => {
    ev.preventDefault();
    calcular();
  });
}

// 2) SECCIONES COLAPSABLES

const blockHeaders = document.querySelectorAll(".sim-block-header");
blockHeaders.forEach((header) => {
  header.style.cursor = "pointer";
  header.addEventListener("click", () => {
    const block = header.closest(".sim-block");
    if (!block) return;
    block.classList.toggle("sim-block-collapsed");
  });
});

// 3) PREFERENCIAS (MARGEN + % AHORRO)

const inputMargenSeguridad = document.getElementById("prefMargenSeguridad");
const inputAhorroPct =
  document.getElementById("ahorro_pct") ||
  document.getElementById("prefAhorroPct");

const STORAGE_PREFS_KEY = "alcanzoPrefsSimulador";

function cargarPreferencias() {
  if (!window.localStorage) return;

  try {
    const raw = localStorage.getItem(STORAGE_PREFS_KEY);
    if (!raw) return;

    const prefs = JSON.parse(raw);

    if (inputMargenSeguridad && typeof prefs.margenSeguridadPct === "number") {
      inputMargenSeguridad.value = prefs.margenSeguridadPct;
    }
    if (inputAhorroPct && typeof prefs.ahorroPct === "number") {
      inputAhorroPct.value = prefs.ahorroPct;
    }
  } catch (e) {
    console.warn("No se pudieron cargar preferencias del simulador:", e);
  }
}

function guardarPreferencias() {
  if (!window.localStorage) return;

  const prefs = {
    margenSeguridadPct: inputMargenSeguridad
      ? Number(inputMargenSeguridad.value) || 0
      : 0,
    ahorroPct: inputAhorroPct ? Number(inputAhorroPct.value) || 0 : 0,
  };

  try {
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn("No se pudieron guardar preferencias del simulador:", e);
  }
}

if (inputMargenSeguridad) {
  inputMargenSeguridad.addEventListener("input", () => {
    guardarPreferencias();
    calcular();
  });
}
if (inputAhorroPct) {
  inputAhorroPct.addEventListener("input", () => {
    guardarPreferencias();
    calcular();
  });
}

// 4) UTILIDADES

function val(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const raw = el.value;
  if (raw === "" || raw === null || raw === undefined) return 0;

  const limpio = raw
    .replace(/\$/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/\s+/g, "");

  const num = parseFloat(limpio);
  return isNaN(num) ? 0 : num;
}

function formatCurrency(num) {
  return num.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// 5) CÁLCULO PRINCIPAL

function calcular() {
  // Ingresos
  const salario = val("ingreso_sueldo");
  const otrosIngresos = val("ingreso_otros");
  const totalIngresos = salario + otrosIngresos;

  // Gastos
  const gastoAlquiler = val("gasto_alquiler");
  const gastoServicios = val("gasto_servicios");
  const gastoPrestamos = val("gasto_prestamos");
  const gastoTarjetas = val("gasto_tarjetas");
  const gastoImpuestos = val("gasto_impuestos");
  const gastoOtros = val("gasto_otros");

  const totalGastos =
    gastoAlquiler +
    gastoServicios +
    gastoPrestamos +
    gastoTarjetas +
    gastoImpuestos +
    gastoOtros;

  // Ahorro
  let ahorroDeseado = val("ahorro_mensual");
  let ahorroPctValue = 0;

  if (inputAhorroPct) {
    ahorroPctValue = Number(inputAhorroPct.value) || 0;
    if (ahorroPctValue > 0 && totalIngresos > 0) {
      ahorroDeseado = (totalIngresos * ahorroPctValue) / 100;

      const inputAhorroMonto = document.getElementById("ahorro_mensual");
      if (inputAhorroMonto) {
        inputAhorroMonto.value = Math.round(ahorroDeseado);
      }
    }
  }

  // Compra
  const compraMonto = val("compra_monto");
  const compraCuotas = val("compra_cuotas") || 1;
  const compraTasa = val("compra_tasa");

  const cuotasValidas = Math.max(compraCuotas, 1);
  const cuotaBase = compraMonto / cuotasValidas;
  const cuotaInteres = cuotaBase * (compraTasa / 100);
  const cuotaTotal = cuotaBase + cuotaInteres;

  // Resultado mensual
  const ingresoDisponible = totalIngresos - totalGastos - ahorroDeseado;
  const sobra = ingresoDisponible - cuotaTotal;

  // Ratios
  const ratioCuotaIngreso =
    totalIngresos > 0 ? (cuotaTotal / totalIngresos) * 100 : 0;

  let ratioCompromisoDisponible = 0;
  if (ingresoDisponible > 0 && cuotaTotal > 0) {
    ratioCompromisoDisponible = (cuotaTotal / ingresoDisponible) * 100;
  }

  actualizarStats({
    totalIngresos,
    totalGastos,
    ahorroDeseado,
    ingresoDisponible,
    cuotaTotal,
    sobra,
    ratioCuotaIngreso,
    ratioCompromisoDisponible,
  });

  actualizarSemaforo({
    totalIngresos,
    totalGastos,
    ahorroDeseado,
    ingresoDisponible,
    cuotaTotal,
    sobra,
    ratioCuotaIngreso,
    ratioCompromisoDisponible,
  });
}

// 6) ACTUALIZAR TOTALES / MÉTRICAS

function actualizarStats({
  totalIngresos,
  totalGastos,
  ahorroDeseado,
  ingresoDisponible,
  cuotaTotal,
  sobra,
  ratioCuotaIngreso,
  ratioCompromisoDisponible,
}) {
  const elTotalIngresosFooter = document.getElementById("total_ingresos_label");
  const elTotalGastosFooter = document.getElementById("total_gastos_label");
  const elTotalAhorroFooter = document.getElementById("total_ahorro_label");

  if (elTotalIngresosFooter)
    elTotalIngresosFooter.textContent = formatCurrency(totalIngresos);
  if (elTotalGastosFooter)
    elTotalGastosFooter.textContent = formatCurrency(totalGastos);
  if (elTotalAhorroFooter)
    elTotalAhorroFooter.textContent = formatCurrency(ahorroDeseado);

  const elCuota = document.getElementById("statCuota");
  const elSobra = document.getElementById("statSobra");
  const elCompromiso = document.getElementById("statCompromiso");

  if (elCuota) elCuota.textContent = formatCurrency(cuotaTotal);
  if (elSobra) elSobra.textContent = formatCurrency(sobra);
  if (elCompromiso) {
    if (ratioCompromisoDisponible > 0) {
      elCompromiso.textContent =
        ratioCompromisoDisponible.toFixed(1).replace(".", ",") + "%";
    } else {
      elCompromiso.textContent = "0%";
    }
  }

  const elIngMini = document.getElementById("statIngresosMini");
  const elGastosMini = document.getElementById("statGastosMini");
  const elAhorroMini = document.getElementById("statAhorroMini");
  const elDispMini = document.getElementById("statDisponibleMini");

  if (elIngMini) elIngMini.textContent = formatCurrency(totalIngresos);
  if (elGastosMini) elGastosMini.textContent = formatCurrency(totalGastos);
  if (elAhorroMini) elAhorroMini.textContent = formatCurrency(ahorroDeseado);
  if (elDispMini) elDispMini.textContent = formatCurrency(ingresoDisponible);
}

// 7) PANEL DERECHO / SEMÁFORO

function actualizarSemaforo({
  totalIngresos,
  totalGastos,
  ahorroDeseado,
  ingresoDisponible,
  cuotaTotal,
  sobra,
  ratioCuotaIngreso,
  ratioCompromisoDisponible,
}) {
  const card = document.getElementById("seccionResultado");
  const icono = document.getElementById("iconoResultado");
  const titulo = document.getElementById("resultadoTitulo");
  const subtitulo = document.getElementById("resultadoSubtitulo");
  const consejo = document.getElementById("resultadoConsejo");

  if (!card || !icono || !titulo || !subtitulo || !consejo) return;

  let margenSeguridadPct = 10;
  if (inputMargenSeguridad) {
    const v = Number(inputMargenSeguridad.value);
    if (!isNaN(v) && v >= 0 && v <= 50) margenSeguridadPct = v;
  }
  const margenSeguridad = (totalIngresos * margenSeguridadPct) / 100;

  let nivel = "neutro";

  if (totalIngresos <= 0 && cuotaTotal <= 0) {
    nivel = "neutro";
  } else if (
    sobra < 0 ||
    ratioCuotaIngreso > 35 ||
    ratioCompromisoDisponible > 80
  ) {
    nivel = "mal";
  } else if (
    sobra < margenSeguridad ||
    ratioCuotaIngreso > 25 ||
    ratioCompromisoDisponible > 50
  ) {
    nivel = "medio";
  } else {
    nivel = "ok";
  }

  card.classList.remove("nivel-ok", "nivel-medio", "nivel-mal", "nivel-neutro");
  card.classList.add(`nivel-${nivel}`);

  if (nivel === "neutro") {
    icono.textContent = "📈";
    titulo.textContent = "Completá tus datos";
    subtitulo.textContent =
      "Poné tus ingresos, gastos, ahorro y lo que querés comprar. Te mostramos acá si te alcanza y qué tan ajustado queda tu mes.";
    consejo.textContent =
      "Arrancá por tus ingresos mensuales y después sumá tus gastos fijos. Con eso ya podemos darte una idea más clara.";
  } else if (nivel === "ok") {
    icono.textContent = "✅";
    titulo.textContent = "¡Dale para adelante!";
    subtitulo.textContent =
      "Podés hacer la compra sin problemas. Te va a sobrar plata para imprevistos.";
    consejo.textContent =
      "Si querés, aprovechá el margen que te queda para acelerar alguna deuda cara o aumentar un poco tu ahorro.";
  } else if (nivel === "medio") {
    icono.textContent = "⚠️";
    titulo.textContent = "Andá con cuidado";
    subtitulo.textContent =
      "La compra entra, pero quedás bastante justo. Un imprevisto te puede desacomodar.";
    consejo.textContent =
      "Probá bajar un poco el monto, estirar el plazo o revisar si hay algún gasto fijo que puedas reducir.";
  } else if (nivel === "mal") {
    icono.textContent = "⛔";
    titulo.textContent = "Mejor no";
    subtitulo.textContent =
      "Con esta compra quedás en rojo o muy por encima de un nivel saludable.";
    consejo.textContent =
      "Antes de avanzar, sería mejor cancelar deudas caras o mejorar tus ingresos. Podés guardar esta compra como objetivo para más adelante.";
  }
}

// 8) INIT

cargarPreferencias();
calcular();
