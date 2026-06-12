/**
 * sedes_nacionales.js
 * Módulo ES6 con universidades, sedes y carreras de Chile para ROOMEET.
 * Fuente: extracción y limpieza del directorio universidadeschile.cl (2026).
 * Coordenadas: aproximadas y realistas basadas en la comuna oficial de cada sede.
 */

// ─── Tabla de coordenadas por ciudad/comuna ────────────────────────────────────
const COORDS = {
  "Arica":               { lat: -18.4783, lng: -70.3126 },
  "Iquique":             { lat: -20.2133, lng: -70.1503 },
  "Calama":              { lat: -22.4562, lng: -68.9196 },
  "Antofagasta":         { lat: -23.6524, lng: -70.3954 },
  "Copiapó":             { lat: -27.3667, lng: -70.3320 },
  "Vallenar":            { lat: -28.5704, lng: -70.7577 },
  "Caldera":             { lat: -27.0657, lng: -70.8224 },
  "La Serena":           { lat: -29.9027, lng: -71.2520 },
  "Coquimbo":            { lat: -29.9533, lng: -71.3395 },
  "Ovalle":              { lat: -30.5983, lng: -71.1993 },
  "Valparaíso":          { lat: -33.0472, lng: -71.6127 },
  "Curauma":             { lat: -33.1306, lng: -71.5706 },
  "Viña del Mar":        { lat: -33.0245, lng: -71.5518 },
  "Quilpué":             { lat: -33.0501, lng: -71.4374 },
  "Quillota":            { lat: -32.8788, lng: -71.2484 },
  "San Felipe":          { lat: -32.7447, lng: -70.7257 },
  "Los Andes":           { lat: -32.8340, lng: -70.5982 },
  "Santiago":            { lat: -33.4569, lng: -70.6483 },
  "Graneros":            { lat: -34.0648, lng: -70.7297 },
  "Rancagua":            { lat: -34.1708, lng: -70.7444 },
  "San Fernando":        { lat: -34.5847, lng: -70.9882 },
  "Rengo":               { lat: -34.4138, lng: -70.8604 },
  "Machalí":             { lat: -34.1760, lng: -70.6625 },
  "Talca":               { lat: -35.4264, lng: -71.6553 },
  "Curicó":              { lat: -34.9853, lng: -71.2388 },
  "Linares":             { lat: -35.8458, lng: -71.5975 },
  "Santa Cruz":          { lat: -34.6425, lng: -71.3653 },
  "Chillán":             { lat: -36.6067, lng: -72.1034 },
  "Concepción":          { lat: -36.8201, lng: -73.0444 },
  "Talcahuano":          { lat: -36.7248, lng: -73.1146 },
  "Hualpén":             { lat: -36.7800, lng: -73.1200 },
  "Los Ángeles":         { lat: -37.4697, lng: -72.3539 },
  "San Pedro de la Paz": { lat: -36.8607, lng: -73.0975 },
  "Cañete":              { lat: -37.8032, lng: -73.4030 },
  "Temuco":              { lat: -38.7359, lng: -72.5904 },
  "Angol":               { lat: -37.7986, lng: -72.7088 },
  "Pucón":               { lat: -39.2722, lng: -71.9573 },
  "Victoria":            { lat: -38.2310, lng: -72.3256 },
  "Valdivia":            { lat: -39.8142, lng: -73.2459 },
  "Puerto Montt":        { lat: -41.4717, lng: -72.9360 },
  "Osorno":              { lat: -40.5736, lng: -73.1339 },
  "Puerto Varas":        { lat: -41.3194, lng: -72.9825 },
  "Ancud":               { lat: -41.8707, lng: -73.8270 },
  "Coyhaique":           { lat: -45.5712, lng: -72.0668 },
  "Punta Arenas":        { lat: -53.1638, lng: -70.9171 },
  "Puerto Natales":      { lat: -51.7236, lng: -72.4903 },
  "Porvenir":            { lat: -53.2905, lng: -70.3719 },
  "Puerto Williams":     { lat: -54.9338, lng: -67.6108 },
  "Villarrica":          { lat: -39.2804, lng: -72.2296 },
};

/**
 * Construye el arreglo de sedes a partir de la ciudad principal y campus adicionales.
 * @param {string} ciudadPrincipal
 * @param {string} nombreCampusPrincipal
 * @param {Array<{ciudad: string, nombre: string}>} externas
 * @returns {Array<{nombre: string, comuna: string, lat: number, lng: number}>}
 */
function buildSedes(ciudadPrincipal, nombreCampusPrincipal, externas) {
  const sedesMap = new Map();

  const coordsPrincipal = COORDS[ciudadPrincipal] || { lat: -33.4569, lng: -70.6483 };
  sedesMap.set(ciudadPrincipal.toLowerCase(), {
    nombre: nombreCampusPrincipal,
    comuna: ciudadPrincipal,
    lat:    coordsPrincipal.lat,
    lng:    coordsPrincipal.lng,
  });

  for (const externa of externas) {
    const key = externa.ciudad.toLowerCase();
    if (sedesMap.has(key)) {
      continue;
    }
    const coordsExterna = COORDS[externa.ciudad] || { lat: -33.4569, lng: -70.6483 };
    sedesMap.set(key, {
      nombre: externa.nombre,
      comuna: externa.ciudad,
      lat:    coordsExterna.lat,
      lng:    coordsExterna.lng,
    });
  }

  return Array.from(sedesMap.values());
}

// ─── Módulo exportable ─────────────────────────────────────────────────────────
export const universidadesChile = [

  // ── 1. Pontificia Universidad Católica de Chile ──────────────────────────────
  {
    nombre:      "Pontificia Universidad Católica de Chile",
    abreviacion: "PUC",
    sedes: buildSedes(
      "Santiago", "Casa Central Santiago",
      [
        { ciudad: "Villarrica", nombre: "Campus Villarrica" },
      ]
    ),
    carreras: [
      "Medicina", "Ingeniería Civil", "Derecho", "Arquitectura", "Psicología",
      "Ingeniería Comercial", "Odontología", "Pedagogía", "Construcción Civil",
      "Diseño", "Periodismo", "Enfermería", "Agronomía", "Ciencia Política",
    ],
  },

  // ── 2. Universidad de Chile ──────────────────────────────────────────────────
  {
    nombre:      "Universidad de Chile",
    abreviacion: "UCHILE",
    sedes: buildSedes(
      "Santiago", "Casa Central Santiago",
      []
    ),
    carreras: [
      "Medicina", "Derecho", "Ingeniería Civil", "Arquitectura", "Odontología",
      "Psicología", "Ingeniería Comercial", "Sociología", "Periodismo",
      "Enfermería", "Pedagogía", "Veterinaria", "Geología", "Diseño", "Música",
    ],
  },

  // ── 3. Universidad de Concepción ─────────────────────────────────────────────
  {
    nombre:      "Universidad de Concepción",
    abreviacion: "UDEC",
    sedes: buildSedes(
      "Concepción", "Campus Central Concepción",
      [
        { ciudad: "Chillán",     nombre: "Campus Chillán" },
        { ciudad: "Los Ángeles", nombre: "Campus Los Ángeles" },
      ]
    ),
    carreras: [
      "Medicina", "Ingeniería Civil", "Odontología", "Derecho", "Arquitectura",
      "Psicología", "Veterinaria", "Ingeniería Comercial", "Enfermería",
      "Pedagogía", "Agronomía", "Química", "Periodismo", "Biología",
    ],
  },

  // ── 4. Pontificia Universidad Católica de Valparaíso ─────────────────────────
  {
    nombre:      "Pontificia Universidad Católica de Valparaíso",
    abreviacion: "PUCV",
    sedes: [
      {
        nombre: "Facultad de Ingeniería (IBC Avenida Brasil)",
        comuna: "Valparaíso",
        lat:    -33.0386,
        lng:    -71.6295,
      },
      {
        nombre: "Casa Central (Avenida Brasil)",
        comuna: "Valparaíso",
        lat:    COORDS["Valparaíso"].lat,
        lng:    COORDS["Valparaíso"].lng,
      },
      {
        nombre: "Campus Curauma",
        comuna: "Valparaíso",
        lat:    COORDS["Curauma"].lat,
        lng:    COORDS["Curauma"].lng,
      },
      {
        nombre: "Campus Sausalito",
        comuna: "Viña del Mar",
        lat:    COORDS["Viña del Mar"].lat,
        lng:    COORDS["Viña del Mar"].lng,
      },
    ],
    carreras: [
      "Ingeniería Civil", "Ingeniería en Informática", "Ingeniería Civil en Informática", "Ingeniería en Ejecución Informática",
      "Derecho", "Pedagogía", "Arquitectura",
      "Ingeniería Comercial", "Psicología", "Kinesiología", "Nutrición",
      "Periodismo", "Diseño", "Trabajo Social", "Agronomía",
    ],
  },

  // ── 5. Universidad de Santiago de Chile ──────────────────────────────────────
  {
    nombre:      "Universidad de Santiago de Chile",
    abreviacion: "USACH",
    sedes: buildSedes(
      "Santiago", "Campus Central Santiago",
      []
    ),
    carreras: [
      "Ingeniería Civil", "Ingeniería Comercial", "Pedagogía", "Psicología",
      "Periodismo", "Bachillerato en Ciencias", "Arquitectura",
      "Contador Auditor", "Obstetricia", "Enfermería", "Química",
      "Tecnología Médica",
    ],
  },

  // ── 6. Universidad Austral de Chile ──────────────────────────────────────────
  {
    nombre:      "Universidad Austral de Chile",
    abreviacion: "UACH",
    sedes: buildSedes(
      "Valdivia", "Casa Central Valdivia",
      [
        { ciudad: "Puerto Montt", nombre: "Sede Puerto Montt" },
        { ciudad: "Osorno",       nombre: "Sede Osorno" },
        { ciudad: "Coyhaique",    nombre: "Sede Coyhaique" },
      ]
    ),
    carreras: [
      "Medicina", "Veterinaria", "Ingeniería Forestal", "Agronomía",
      "Enfermería", "Pedagogía", "Derecho", "Arquitectura", "Psicología",
      "Kinesiología", "Odontología", "Ingeniería Civil",
    ],
  },

  // ── 7. Universidad Técnica Federico Santa María ──────────────────────────────
  {
    nombre:      "Universidad Técnica Federico Santa María",
    abreviacion: "USM",
    sedes: buildSedes(
      "Valparaíso", "Casa Central Valparaíso",
      [
        { ciudad: "Viña del Mar", nombre: "Campus Vitacura / Viña del Mar" },
        { ciudad: "Hualpén",      nombre: "Campus San Joaquín - Hualpén" },
        { ciudad: "Rancagua",     nombre: "Sede Rancagua" },
        { ciudad: "Santiago",     nombre: "Sede Santiago" },
      ]
    ),
    carreras: [
      "Ingeniería Civil Industrial", "Ingeniería Civil Informática",
      "Ingeniería Civil Mecánica", "Ingeniería Civil Eléctrica",
      "Ingeniería Civil Química", "Ingeniería Comercial",
      "Arquitectura", "Ingeniería Civil Electrónica",
      "Ingeniería en Construcción",
    ],
  },

  // ── 8. Universidad Andrés Bello ──────────────────────────────────────────────
  {
    nombre:      "Universidad Andrés Bello",
    abreviacion: "UNAB",
    sedes: buildSedes(
      "Santiago", "Campus República - Santiago",
      [
        { ciudad: "Viña del Mar",  nombre: "Campus Viña del Mar" },
        { ciudad: "Talcahuano",    nombre: "Campus Concepción - Talcahuano" },
      ]
    ),
    carreras: [
      "Medicina", "Odontología", "Derecho", "Psicología", "Ingeniería Civil",
      "Enfermería", "Ingeniería Comercial", "Arquitectura", "Veterinaria",
      "Kinesiología", "Pedagogía", "Periodismo", "Nutrición",
    ],
  },

  // ── 9. Universidad de Talca ──────────────────────────────────────────────────
  {
    nombre:      "Universidad de Talca",
    abreviacion: "UTALCA",
    sedes: buildSedes(
      "Talca", "Campus Talca",
      [
        { ciudad: "Curicó",      nombre: "Campus Curicó" },
        { ciudad: "Santiago",    nombre: "Sede Santiago" },
        { ciudad: "Santa Cruz",  nombre: "Sede Santa Cruz" },
        { ciudad: "Linares",     nombre: "Sede Linares" },
      ]
    ),
    carreras: [
      "Medicina", "Derecho", "Ingeniería Civil", "Ingeniería Comercial",
      "Pedagogía", "Agronomía", "Odontología", "Arquitectura", "Psicología",
      "Enfermería", "Kinesiología", "Tecnología Médica",
    ],
  },

  // ── 10. Universidad de Valparaíso ─────────────────────────────────────────────
  {
    nombre:      "Universidad de Valparaíso",
    abreviacion: "UV",
    sedes: buildSedes(
      "Valparaíso", "Casa Central Valparaíso",
      [
        { ciudad: "Viña del Mar", nombre: "Sede Viña del Mar" },
        { ciudad: "Santiago",     nombre: "Sede Santiago" },
        { ciudad: "San Felipe",   nombre: "Sede San Felipe" },
      ]
    ),
    carreras: [
      "Medicina", "Derecho", "Odontología", "Psicología", "Enfermería",
      "Arquitectura", "Ingeniería Civil", "Ingeniería Comercial", "Pedagogía",
      "Periodismo", "Diseño", "Música", "Cine",
    ],
  },

  // ── 11. Universidad del Desarrollo ───────────────────────────────────────────
  {
    nombre:      "Universidad del Desarrollo",
    abreviacion: "UDD",
    sedes: buildSedes(
      "Concepción", "Campus Concepción",
      [
        { ciudad: "Santiago", nombre: "Campus Las Condes - Santiago" },
      ]
    ),
    carreras: [
      "Medicina", "Odontología", "Ingeniería Comercial", "Ingeniería Civil",
      "Derecho", "Psicología", "Arquitectura", "Periodismo", "Diseño",
      "Publicidad", "Kinesiología", "Nutrición",
    ],
  },

  // ── 12. Universidad Diego Portales ────────────────────────────────────────────
  {
    nombre:      "Universidad Diego Portales",
    abreviacion: "UDP",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      []
    ),
    carreras: [
      "Derecho", "Periodismo", "Psicología", "Ingeniería Comercial",
      "Publicidad", "Arquitectura", "Diseño", "Cine", "Sociología",
      "Ciencia Política", "Historia", "Ingeniería Civil",
    ],
  },

  // ── 13. Universidad de La Frontera ────────────────────────────────────────────
  {
    nombre:      "Universidad de La Frontera",
    abreviacion: "UFRO",
    sedes: buildSedes(
      "Temuco", "Campus Temuco",
      [
        { ciudad: "Angol", nombre: "Sede Angol" },
        { ciudad: "Pucón", nombre: "Sede Pucón" },
      ]
    ),
    carreras: [
      "Medicina", "Odontología", "Ingeniería Civil", "Agronomía", "Psicología",
      "Enfermería", "Pedagogía", "Derecho", "Kinesiología",
      "Tecnología Médica", "Trabajo Social",
    ],
  },

  // ── 14. Universidad de los Andes ──────────────────────────────────────────────
  {
    nombre:      "Universidad de los Andes",
    abreviacion: "UANDES",
    sedes: buildSedes(
      "Santiago", "Campus San Carlos de Apoquindo - Santiago",
      []
    ),
    carreras: [
      "Medicina", "Derecho", "Odontología", "Ingeniería Civil",
      "Ingeniería Comercial", "Psicología", "Arquitectura", "Enfermería",
      "Pedagogía", "Periodismo", "Kinesiología",
    ],
  },

  // ── 15. Universidad Católica del Norte ───────────────────────────────────────
  {
    nombre:      "Universidad Católica del Norte",
    abreviacion: "UCN",
    sedes: buildSedes(
      "Antofagasta", "Campus Antofagasta",
      [
        { ciudad: "Coquimbo", nombre: "Sede Coquimbo" },
      ]
    ),
    carreras: [
      "Ingeniería Civil", "Medicina", "Derecho", "Arquitectura", "Pedagogía",
      "Psicología", "Enfermería", "Ingeniería Comercial", "Biología Marina",
      "Geología", "Kinesiología",
    ],
  },

  // ── 16. Universidad Adolfo Ibáñez ─────────────────────────────────────────────
  {
    nombre:      "Universidad Adolfo Ibáñez",
    abreviacion: "UAI",
    sedes: buildSedes(
      "Santiago", "Campus Peñalolén - Santiago",
      [
        { ciudad: "Viña del Mar", nombre: "Campus Viña del Mar" },
      ]
    ),
    carreras: [
      "Ingeniería Comercial", "Derecho", "Ingeniería Civil", "Psicología",
      "Periodismo", "Diseño", "Ciencia Política", "Historia",
      "Administración Pública",
    ],
  },

  // ── 17. Universidad Autónoma de Chile ─────────────────────────────────────────
  {
    nombre:      "Universidad Autónoma de Chile",
    abreviacion: "UA",
    sedes: buildSedes(
      "Temuco", "Sede Temuco",
      [
        { ciudad: "Talca",    nombre: "Sede Talca" },
        { ciudad: "Santiago", nombre: "Sede Santiago" },
      ]
    ),
    carreras: [
      "Medicina", "Derecho", "Psicología", "Ingeniería Civil",
      "Ingeniería Comercial", "Arquitectura", "Pedagogía", "Enfermería",
      "Odontología", "Kinesiología", "Nutrición", "Periodismo",
    ],
  },

  // ── 18. Universidad del Bío-Bío ───────────────────────────────────────────────
  {
    nombre:      "Universidad del Bío-Bío",
    abreviacion: "UBB",
    sedes: buildSedes(
      "Concepción", "Campus Concepción",
      [
        { ciudad: "Chillán", nombre: "Campus Chillán" },
      ]
    ),
    carreras: [
      "Arquitectura", "Ingeniería Civil", "Ingeniería Comercial", "Diseño",
      "Pedagogía", "Trabajo Social", "Enfermería", "Nutrición",
      "Contador Público y Auditor", "Periodismo",
    ],
  },

  // ── 19. Universidad de Tarapacá ───────────────────────────────────────────────
  {
    nombre:      "Universidad de Tarapacá",
    abreviacion: "UTA",
    sedes: buildSedes(
      "Arica", "Campus Arica",
      [
        { ciudad: "Iquique", nombre: "Sede Iquique" },
      ]
    ),
    carreras: [
      "Pedagogía", "Derecho", "Ingeniería Civil", "Ingeniería Comercial",
      "Enfermería", "Arquitectura", "Kinesiología", "Obstetricia",
      "Tecnología Médica", "Trabajo Social",
    ],
  },

  // ── 20. Universidad San Sebastián ─────────────────────────────────────────────
  {
    nombre:      "Universidad San Sebastián",
    abreviacion: "USS",
    sedes: buildSedes(
      "Santiago", "Sede Santiago",
      [
        { ciudad: "Puerto Montt", nombre: "Sede Puerto Montt" },
        { ciudad: "Valdivia",     nombre: "Sede Valdivia" },
        { ciudad: "Concepción",   nombre: "Sede Concepción" },
      ]
    ),
    carreras: [
      "Medicina", "Odontología", "Derecho", "Psicología", "Ingeniería Civil",
      "Ingeniería Comercial", "Enfermería", "Pedagogía", "Kinesiología",
      "Arquitectura", "Periodismo",
    ],
  },

  // ── 21. Universidad de La Serena ──────────────────────────────────────────────
  {
    nombre:      "Universidad de La Serena",
    abreviacion: "ULS",
    sedes: buildSedes(
      "La Serena", "Campus La Serena",
      [
        { ciudad: "Coquimbo", nombre: "Campus Coquimbo" },
        { ciudad: "Ovalle",   nombre: "Sede Ovalle" },
      ]
    ),
    carreras: [
      "Pedagogía", "Ingeniería Civil", "Enfermería", "Derecho",
      "Ingeniería Comercial", "Arquitectura", "Kinesiología", "Psicología",
      "Agronomía", "Periodismo",
    ],
  },

  // ── 22. Universidad Católica de la Santísima Concepción ──────────────────────
  {
    nombre:      "Universidad Católica de la Santísima Concepción",
    abreviacion: "UCSC",
    sedes: buildSedes(
      "Concepción", "Campus Concepción",
      [
        { ciudad: "Talcahuano", nombre: "Campus Talcahuano" },
        { ciudad: "Los Ángeles", nombre: "Sede Los Ángeles" },
        { ciudad: "Chillán",    nombre: "Sede Chillán" },
        { ciudad: "Cañete",     nombre: "Sede Cañete" },
      ]
    ),
    carreras: [
      "Medicina", "Derecho", "Pedagogía", "Enfermería", "Ingeniería Civil",
      "Ingeniería Comercial", "Psicología", "Kinesiología",
      "Trabajo Social", "Periodismo",
    ],
  },

  // ── 23. Universidad de Antofagasta ───────────────────────────────────────────
  {
    nombre:      "Universidad de Antofagasta",
    abreviacion: "UANTOF",
    sedes: buildSedes(
      "Antofagasta", "Campus Angamos - Antofagasta",
      []
    ),
    carreras: [
      "Ingeniería Civil", "Medicina", "Enfermería", "Pedagogía", "Derecho",
      "Kinesiología", "Tecnología Médica", "Psicología", "Nutrición",
      "Obstetricia",
    ],
  },

  // ── 24. Universidad Bernardo O'Higgins ────────────────────────────────────────
  {
    nombre:      "Universidad Bernardo O'Higgins",
    abreviacion: "UBO",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      []
    ),
    carreras: [
      "Derecho", "Ingeniería Civil", "Ingeniería Comercial", "Psicología",
      "Pedagogía", "Periodismo", "Enfermería", "Kinesiología", "Arquitectura",
    ],
  },

  // ── 25. Universidad Central de Chile ─────────────────────────────────────────
  {
    nombre:      "Universidad Central de Chile",
    abreviacion: "UCEN",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      [
        { ciudad: "Antofagasta", nombre: "Sede Antofagasta" },
        { ciudad: "La Serena",   nombre: "Sede La Serena" },
      ]
    ),
    carreras: [
      "Derecho", "Arquitectura", "Ingeniería Civil", "Ingeniería Comercial",
      "Psicología", "Pedagogía", "Trabajo Social", "Enfermería",
      "Periodismo", "Diseño",
    ],
  },

  // ── 26. Universidad Mayor ─────────────────────────────────────────────────────
  {
    nombre:      "Universidad Mayor",
    abreviacion: "UMAYOR",
    sedes: buildSedes(
      "Santiago", "Campus Providencia - Santiago",
      [
        { ciudad: "Temuco", nombre: "Campus Temuco" },
      ]
    ),
    carreras: [
      "Medicina", "Odontología", "Veterinaria", "Derecho", "Ingeniería Civil",
      "Psicología", "Arquitectura", "Cine", "Diseño", "Enfermería", "Pedagogía",
    ],
  },

  // ── 27. Universidad Alberto Hurtado ──────────────────────────────────────────
  {
    nombre:      "Universidad Alberto Hurtado",
    abreviacion: "UAH",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      []
    ),
    carreras: [
      "Derecho", "Psicología", "Sociología", "Periodismo", "Trabajo Social",
      "Pedagogía", "Ingeniería Comercial", "Filosofía", "Historia",
      "Antropología",
    ],
  },

  // ── 28. Universidad Católica del Maule ───────────────────────────────────────
  {
    nombre:      "Universidad Católica del Maule",
    abreviacion: "UCM",
    sedes: buildSedes(
      "Talca", "Campus San Miguel - Talca",
      [
        { ciudad: "Curicó", nombre: "Sede Curicó" },
      ]
    ),
    carreras: [
      "Medicina", "Pedagogía", "Derecho", "Enfermería", "Ingeniería Civil",
      "Ingeniería Comercial", "Psicología", "Kinesiología",
      "Trabajo Social", "Agronomía",
    ],
  },

  // ── 30. Universidad de Playa Ancha ────────────────────────────────────────────
  {
    nombre:      "Universidad de Playa Ancha",
    abreviacion: "UPLA",
    sedes: buildSedes(
      "Valparaíso", "Campus Playa Ancha - Valparaíso",
      [
        { ciudad: "San Felipe", nombre: "Sede San Felipe" },
      ]
    ),
    carreras: [
      "Pedagogía en Educación Física", "Pedagogía en Historia",
      "Pedagogía en Inglés", "Pedagogía Básica", "Pedagogía en Castellano",
      "Educación Parvularia", "Bibliotecología", "Diseño",
      "Periodismo", "Trabajo Social",
    ],
  },

  // ── 31. Universidad Arturo Prat ───────────────────────────────────────────────
  {
    nombre:      "Universidad Arturo Prat",
    abreviacion: "UNAP",
    sedes: buildSedes(
      "Iquique", "Campus Iquique",
      [
        { ciudad: "Arica",        nombre: "Sede Arica" },
        { ciudad: "Calama",       nombre: "Sede Calama" },
        { ciudad: "Antofagasta",  nombre: "Sede Antofagasta" },
        { ciudad: "Santiago",     nombre: "Sede Santiago" },
        { ciudad: "Victoria",     nombre: "Sede Victoria" },
      ]
    ),
    carreras: [
      "Pedagogía", "Ingeniería Civil", "Derecho", "Enfermería", "Psicología",
      "Trabajo Social", "Kinesiología", "Ingeniería Comercial", "Arquitectura",
    ],
  },

  // ── 32. Universidad Tecnológica Metropolitana ─────────────────────────────────
  {
    nombre:      "Universidad Tecnológica Metropolitana",
    abreviacion: "UTEM",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      []
    ),
    carreras: [
      "Ingeniería Civil Industrial", "Ingeniería Civil en Informática",
      "Ingeniería en Construcción", "Arquitectura", "Diseño",
      "Bibliotecología", "Trabajo Social", "Cartografía",
    ],
  },

  // ── 33. Universidad Finis Terrae ──────────────────────────────────────────────
  {
    nombre:      "Universidad Finis Terrae",
    abreviacion: "UFT",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      []
    ),
    carreras: [
      "Medicina", "Odontología", "Derecho", "Arquitectura", "Psicología",
      "Ingeniería Comercial", "Diseño", "Periodismo", "Cine", "Enfermería",
    ],
  },

  // ── 34. Universidad de Los Lagos ──────────────────────────────────────────────
  {
    nombre:      "Universidad de Los Lagos",
    abreviacion: "ULAGOS",
    sedes: buildSedes(
      "Osorno", "Campus Osorno",
      [
        { ciudad: "Puerto Montt", nombre: "Sede Puerto Montt" },
        { ciudad: "Santiago",     nombre: "Sede Santiago" },
      ]
    ),
    carreras: [
      "Pedagogía", "Enfermería", "Derecho", "Ingeniería Comercial",
      "Psicología", "Acuicultura", "Trabajo Social",
      "Contador Auditor", "Agronomía",
    ],
  },

  // ── 35. Universidad de Magallanes ─────────────────────────────────────────────
  {
    nombre:      "Universidad de Magallanes",
    abreviacion: "UMAG",
    sedes: buildSedes(
      "Punta Arenas", "Campus Punta Arenas",
      [
        { ciudad: "Puerto Natales",  nombre: "Sede Puerto Natales" },
        { ciudad: "Porvenir",        nombre: "Sede Porvenir" },
        { ciudad: "Puerto Williams", nombre: "Sede Puerto Williams" },
        { ciudad: "Coyhaique",       nombre: "Sede Coyhaique" },
      ]
    ),
    carreras: [
      "Ingeniería Civil", "Medicina", "Enfermería", "Pedagogía", "Derecho",
      "Kinesiología", "Psicología", "Trabajo Social", "Biología Marina",
    ],
  },

  // ── 36. Universidad de Atacama ────────────────────────────────────────────────
  {
    nombre:      "Universidad de Atacama",
    abreviacion: "UDA",
    sedes: buildSedes(
      "Copiapó", "Campus Copiapó",
      [
        { ciudad: "Vallenar",  nombre: "Sede Vallenar" },
        { ciudad: "Caldera",   nombre: "Sede Caldera" },
        { ciudad: "Santiago",  nombre: "Sede Santiago" },
      ]
    ),
    carreras: [
      "Ingeniería Civil de Minas", "Geología", "Pedagogía", "Enfermería",
      "Kinesiología", "Obstetricia", "Ingeniería Civil", "Arquitectura",
    ],
  },

  // ── 37. Universidad Santo Tomás ───────────────────────────────────────────────
  {
    nombre:      "Universidad Santo Tomás",
    abreviacion: "UST",
    sedes: buildSedes(
      "Santiago", "Sede Santiago",
      [
        { ciudad: "Arica",        nombre: "Sede Arica" },
        { ciudad: "Iquique",      nombre: "Sede Iquique" },
        { ciudad: "Antofagasta",  nombre: "Sede Antofagasta" },
        { ciudad: "Copiapó",      nombre: "Sede Copiapó" },
        { ciudad: "La Serena",    nombre: "Sede La Serena" },
        { ciudad: "Viña del Mar", nombre: "Sede Viña del Mar" },
        { ciudad: "Talca",        nombre: "Sede Talca" },
        { ciudad: "Concepción",   nombre: "Sede Concepción" },
        { ciudad: "Los Ángeles",  nombre: "Sede Los Ángeles" },
        { ciudad: "Temuco",       nombre: "Sede Temuco" },
        { ciudad: "Valdivia",     nombre: "Sede Valdivia" },
        { ciudad: "Osorno",       nombre: "Sede Osorno" },
        { ciudad: "Puerto Montt", nombre: "Sede Puerto Montt" },
      ]
    ),
    carreras: [
      "Derecho", "Psicología", "Enfermería", "Ingeniería Civil", "Pedagogía",
      "Kinesiología", "Trabajo Social", "Periodismo",
      "Tecnología Médica", "Veterinaria",
    ],
  },

  // ── 38. Universidad de Las Américas ──────────────────────────────────────────
  {
    nombre:      "Universidad de Las Américas",
    abreviacion: "UDLA",
    sedes: buildSedes(
      "Santiago", "Sede Santiago",
      [
        { ciudad: "Viña del Mar", nombre: "Sede Viña del Mar" },
        { ciudad: "Concepción",   nombre: "Sede Concepción" },
      ]
    ),
    carreras: [
      "Derecho", "Psicología", "Ingeniería Civil", "Ingeniería Comercial",
      "Pedagogía", "Enfermería", "Kinesiología", "Arquitectura",
      "Veterinaria", "Periodismo",
    ],
  },

  // ── 39. Universidad Metropolitana de Ciencias de la Educación ────────────────
  {
    nombre:      "Universidad Metropolitana de Ciencias de la Educación",
    abreviacion: "UMCE",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      [
        { ciudad: "Graneros", nombre: "Sede Graneros" },
      ]
    ),
    carreras: [
      "Pedagogía en Educación Básica", "Pedagogía en Historia",
      "Pedagogía en Matemáticas", "Pedagogía en Inglés",
      "Pedagogía en Educación Física", "Pedagogía en Castellano",
      "Pedagogía en Biología", "Educación Parvularia",
      "Educación Diferencial",
    ],
  },

  // ── 40. Universidad de O'Higgins ──────────────────────────────────────────────
  {
    nombre:      "Universidad de O'Higgins",
    abreviacion: "UOH",
    sedes: buildSedes(
      "Rancagua", "Campus Rancagua",
      [
        { ciudad: "San Fernando", nombre: "Sede San Fernando" },
        { ciudad: "Rengo",        nombre: "Sede Rengo" },
      ]
    ),
    carreras: [
      "Medicina", "Enfermería", "Pedagogía", "Ingeniería Civil",
      "Agronomía", "Kinesiología", "Ingeniería Comercial",
      "Derecho", "Obstetricia",
    ],
  },

  // ── 41. Universidad Católica Silva Henríquez ──────────────────────────────────
  {
    nombre:      "Universidad Católica Silva Henríquez",
    abreviacion: "UCSH",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      []
    ),
    carreras: [
      "Pedagogía", "Trabajo Social", "Derecho", "Ingeniería Comercial",
      "Psicología", "Enfermería", "Educación Parvularia",
      "Educación Diferencial",
    ],
  },

  // ── 42. Universidad Gabriela Mistral ─────────────────────────────────────────
  {
    nombre:      "Universidad Gabriela Mistral",
    abreviacion: "UGM",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      [
        { ciudad: "Puerto Varas", nombre: "Sede Puerto Varas" },
      ]
    ),
    carreras: [
      "Derecho", "Ingeniería Comercial", "Periodismo",
      "Psicología", "Arquitectura", "Diseño",
    ],
  },

  // ── 43. Universidad de Aysén ──────────────────────────────────────────────────
  {
    nombre:      "Universidad de Aysén",
    abreviacion: "UAY",
    sedes: buildSedes(
      "Coyhaique", "Campus Coyhaique",
      []
    ),
    carreras: [
      "Enfermería", "Obstetricia", "Pedagogía", "Trabajo Social",
      "Ingeniería Civil", "Ingeniería Forestal", "Agronomía",
    ],
  },

  // ── 44. Universidad Tecnológica de Chile INACAP ───────────────────────────────
  {
    nombre:      "Universidad Tecnológica de Chile INACAP",
    abreviacion: "INACAP",
    sedes: buildSedes(
      "Santiago", "Sede Santiago - Maipú",
      [
        { ciudad: "Arica",                nombre: "Sede Arica" },
        { ciudad: "Iquique",              nombre: "Sede Iquique" },
        { ciudad: "Calama",               nombre: "Sede Calama" },
        { ciudad: "Antofagasta",          nombre: "Sede Antofagasta" },
        { ciudad: "Copiapó",              nombre: "Sede Copiapó" },
        { ciudad: "La Serena",            nombre: "Sede La Serena" },
        { ciudad: "Valparaíso",           nombre: "Sede Valparaíso" },
        { ciudad: "Rancagua",             nombre: "Sede Rancagua" },
        { ciudad: "Curicó",               nombre: "Sede Curicó" },
        { ciudad: "Talca",                nombre: "Sede Talca" },
        { ciudad: "Chillán",              nombre: "Sede Chillán" },
        { ciudad: "Talcahuano",           nombre: "Sede Talcahuano" },
        { ciudad: "San Pedro de la Paz",  nombre: "Sede Concepción - San Pedro" },
        { ciudad: "Los Ángeles",          nombre: "Sede Los Ángeles" },
        { ciudad: "Temuco",               nombre: "Sede Temuco" },
        { ciudad: "Valdivia",             nombre: "Sede Valdivia" },
        { ciudad: "Osorno",               nombre: "Sede Osorno" },
        { ciudad: "Puerto Montt",         nombre: "Sede Puerto Montt" },
        { ciudad: "Coyhaique",            nombre: "Sede Coyhaique" },
        { ciudad: "Punta Arenas",         nombre: "Sede Punta Arenas" },
      ]
    ),
    carreras: [
      "Técnico en Construcción", "Técnico en Enfermería",
      "Técnico en Mecánica Automotriz", "Técnico en Administración",
      "Ingeniería en Informática", "Ingeniería Industrial",
      "Gastronomía", "Diseño Gráfico", "Turismo",
      "Prevención de Riesgos",
    ],
  },

  // ── 45. Universidad Viña del Mar ──────────────────────────────────────────────
  {
    nombre:      "Universidad Viña del Mar",
    abreviacion: "UVM",
    sedes: buildSedes(
      "Viña del Mar", "Campus Viña del Mar",
      [
        { ciudad: "San Felipe", nombre: "Sede San Felipe" },
      ]
    ),
    carreras: [
      "Derecho", "Psicología", "Ingeniería Comercial", "Pedagogía",
      "Enfermería", "Kinesiología", "Arquitectura",
      "Periodismo", "Trabajo Social",
    ],
  },

  // ── 46. Universidad Adventista de Chile ───────────────────────────────────────
  {
    nombre:      "Universidad Adventista de Chile",
    abreviacion: "UNACH",
    sedes: buildSedes(
      "Chillán", "Campus Chillán",
      []
    ),
    carreras: [
      "Pedagogía", "Enfermería", "Teología", "Psicología",
      "Ingeniería Comercial", "Trabajo Social",
      "Educación Parvularia", "Nutrición",
    ],
  },

  // ── 47. Universidad Academia de Humanismo Cristiano ──────────────────────────
  {
    nombre:      "Universidad Academia de Humanismo Cristiano",
    abreviacion: "UAHC",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      []
    ),
    carreras: [
      "Antropología", "Sociología", "Historia", "Filosofía",
      "Trabajo Social", "Psicología", "Pedagogía",
      "Derecho", "Periodismo",
    ],
  },

  // ── 48. Universidad SEK ───────────────────────────────────────────────────────
  {
    nombre:      "Universidad SEK",
    abreviacion: "USEK",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      [
        { ciudad: "Valdivia", nombre: "Sede Valdivia" },
      ]
    ),
    carreras: [
      "Derecho", "Ingeniería Comercial", "Psicología", "Arquitectura",
      "Ingeniería Civil", "Pedagogía", "Diseño",
    ],
  },

  // ── 49. Universidad del Alba ──────────────────────────────────────────────────
  {
    nombre:      "Universidad del Alba",
    abreviacion: "UDALBA",
    sedes: buildSedes(
      "Santiago", "Sede Santiago",
      [
        { ciudad: "Chillán",     nombre: "Sede Chillán" },
        { ciudad: "La Serena",   nombre: "Sede La Serena" },
        { ciudad: "Antofagasta", nombre: "Sede Antofagasta" },
      ]
    ),
    carreras: [
      "Derecho", "Enfermería", "Psicología", "Ingeniería Comercial",
      "Pedagogía", "Kinesiología", "Trabajo Social", "Obstetricia",
    ],
  },

  // ── 50. Universidad UNIACC ────────────────────────────────────────────────────
  {
    nombre:      "Universidad UNIACC",
    abreviacion: "UNIACC",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      [
        { ciudad: "Valparaíso",   nombre: "Sede Valparaíso" },
        { ciudad: "Concepción",   nombre: "Sede Concepción" },
        { ciudad: "Punta Arenas", nombre: "Sede Punta Arenas" },
      ]
    ),
    carreras: [
      "Periodismo", "Publicidad", "Diseño", "Cine",
      "Comunicación Audiovisual", "Animación Digital",
      "Música", "Actuación", "Psicología",
    ],
  },

  // ── 51. Universidad Miguel de Cervantes ───────────────────────────────────────
  {
    nombre:      "Universidad Miguel de Cervantes",
    abreviacion: "UMC",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      []
    ),
    carreras: [
      "Derecho", "Ingeniería Comercial", "Psicología", "Trabajo Social",
      "Pedagogía", "Contador Auditor", "Periodismo",
    ],
  },

  // ── 52. Universidad de Aconcagua ──────────────────────────────────────────────
  {
    nombre:      "Universidad de Aconcagua",
    abreviacion: "UAC",
    sedes: buildSedes(
      "Santiago", "Sede Santiago",
      [
        { ciudad: "Calama",       nombre: "Sede Calama" },
        { ciudad: "La Serena",    nombre: "Sede La Serena" },
        { ciudad: "San Felipe",   nombre: "Sede San Felipe" },
        { ciudad: "Los Andes",    nombre: "Sede Los Andes" },
        { ciudad: "Quilpué",      nombre: "Sede Quilpué" },
        { ciudad: "Rancagua",     nombre: "Sede Rancagua" },
        { ciudad: "Machalí",      nombre: "Sede Machalí" },
        { ciudad: "Temuco",       nombre: "Sede Temuco" },
        { ciudad: "Puerto Montt", nombre: "Sede Puerto Montt" },
        { ciudad: "Ancud",        nombre: "Sede Ancud" },
      ]
    ),
    carreras: [
      "Derecho", "Enfermería", "Ingeniería Comercial", "Psicología",
      "Pedagogía", "Kinesiología", "Trabajo Social",
      "Técnico en Enfermería",
    ],
  },

  // ── 53. Universidad Bolivariana ───────────────────────────────────────────────
  {
    nombre:      "Universidad Bolivariana",
    abreviacion: "UB",
    sedes: buildSedes(
      "Santiago", "Sede Santiago",
      [
        { ciudad: "Iquique",     nombre: "Sede Iquique" },
        { ciudad: "La Serena",   nombre: "Sede La Serena" },
        { ciudad: "Ovalle",      nombre: "Sede Ovalle" },
        { ciudad: "Talca",       nombre: "Sede Talca" },
        { ciudad: "Chillán",     nombre: "Sede Chillán" },
        { ciudad: "Los Ángeles", nombre: "Sede Los Ángeles" },
        { ciudad: "Concepción",  nombre: "Sede Concepción" },
      ]
    ),
    carreras: [
      "Derecho", "Trabajo Social", "Psicología", "Pedagogía",
      "Ingeniería Comercial", "Educación Parvularia",
    ],
  },

  // ── 54. Universidad La República ─────────────────────────────────────────────
  {
    nombre:      "Universidad La República",
    abreviacion: "ULARE",
    sedes: buildSedes(
      "Santiago", "Sede Santiago",
      [
        { ciudad: "Arica",       nombre: "Sede Arica" },
        { ciudad: "Calama",      nombre: "Sede Calama" },
        { ciudad: "Antofagasta", nombre: "Sede Antofagasta" },
        { ciudad: "Coquimbo",    nombre: "Sede Coquimbo" },
        { ciudad: "Rancagua",    nombre: "Sede Rancagua" },
        { ciudad: "Talca",       nombre: "Sede Talca" },
        { ciudad: "Chillán",     nombre: "Sede Chillán" },
        { ciudad: "Concepción",  nombre: "Sede Concepción" },
        { ciudad: "Los Ángeles", nombre: "Sede Los Ángeles" },
        { ciudad: "Temuco",      nombre: "Sede Temuco" },
      ]
    ),
    carreras: [
      "Derecho", "Ingeniería Comercial", "Psicología", "Pedagogía",
      "Trabajo Social", "Ingeniería Civil Informática", "Contador Auditor",
    ],
  },

  // ── 55. Universidad Los Leones ────────────────────────────────────────────────
  {
    nombre:      "Universidad Los Leones",
    abreviacion: "ULL",
    sedes: buildSedes(
      "Santiago", "Campus Santiago",
      []
    ),
    carreras: [
      "Diseño Gráfico", "Publicidad", "Comunicación Audiovisual",
      "Periodismo", "Ingeniería Comercial", "Administración",
    ],
  },

];
