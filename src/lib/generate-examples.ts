import * as XLSX from "xlsx";

export function generateProductsExample(): ArrayBuffer {
  const data = [
    {
      "Tipo de Producto (obligatorio)": "P-Producto",
      "Categoría de Inventarios / Servicios (obligatorio)": "7 Producto Terminado - Cafeteria",
      "Código del Producto (obligatorio)": "PT001",
      "Nombre del Producto / Servicio (obligatorio)": "COMBO CAPPUCCINO + TORTA",
      "¿Inventariable? (obligatorio)": "SI",
      "Código Unidad de medida DIAN": "94",
      "Unidad de Medida Impresión Factura": "UNIDAD",
      "Referencia de Fábrica": "UNIDAD",
      "Código Impuesto Cargo": "16-Impoconsumo 8%",
      "¿Incluye IVA en Precio de Venta?": "SI",
      "Precio de venta 1": 20000,
      "Precio de venta 2": 24600,
      "Precio de venta 3": "",
    },
    {
      "Tipo de Producto (obligatorio)": "P-Producto",
      "Categoría de Inventarios / Servicios (obligatorio)": "7 Producto Terminado - Cafeteria",
      "Código del Producto (obligatorio)": "PT002",
      "Nombre del Producto / Servicio (obligatorio)": "AMERICANO SENCILLO",
      "¿Inventariable? (obligatorio)": "SI",
      "Código Unidad de medida DIAN": "94",
      "Unidad de Medida Impresión Factura": "UNIDAD",
      "Referencia de Fábrica": "UNIDAD",
      "Código Impuesto Cargo": "16-Impoconsumo 8%",
      "¿Incluye IVA en Precio de Venta?": "SI",
      "Precio de venta 1": 7000,
      "Precio de venta 2": 8610,
      "Precio de venta 3": "",
    },
    {
      "Tipo de Producto (obligatorio)": "P-Producto",
      "Categoría de Inventarios / Servicios (obligatorio)": "7 Producto Terminado - Cafeteria",
      "Código del Producto (obligatorio)": "PT003",
      "Nombre del Producto / Servicio (obligatorio)": "SHAKE DE FRESA",
      "¿Inventariable? (obligatorio)": "SI",
      "Código Unidad de medida DIAN": "94",
      "Unidad de Medida Impresión Factura": "UNIDAD",
      "Referencia de Fábrica": "",
      "Código Impuesto Cargo": "16-Impoconsumo 8%",
      "¿Incluye IVA en Precio de Venta?": "SI",
      "Precio de venta 1": 15000,
      "Precio de venta 2": 18450,
      "Precio de venta 3": "",
    },
    {
      "Tipo de Producto (obligatorio)": "P-Producto",
      "Categoría de Inventarios / Servicios (obligatorio)": "7 Producto Terminado - Cafeteria",
      "Código del Producto (obligatorio)": "PT004",
      "Nombre del Producto / Servicio (obligatorio)": "PRODUCTO SIN COMPONENTES",
      "¿Inventariable? (obligatorio)": "SI",
      "Código Unidad de medida DIAN": "94",
      "Unidad de Medida Impresión Factura": "UNIDAD",
      "Referencia de Fábrica": "",
      "Código Impuesto Cargo": "1-IVA 19%",
      "¿Incluye IVA en Precio de Venta?": "SI",
      "Precio de venta 1": 5000,
      "Precio de venta 2": "",
      "Precio de venta 3": "",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Productos");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}

export function generateComponentsExample(): ArrayBuffer {
  // The ensamble file has a very specific structure:
  // Row with "Código producto: PTXXX NOMBRE"
  // Then rows with: [parent_code_repeated, ..., component_code, ..., quantity]
  // We need to build this manually

  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};

  let row = 0;

  // Title
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "Ensamble producto proceso / terminado", t: "s" };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "EMPRESA EJEMPLO S.A.S", t: "s" };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "Producto", t: "s" };
  row++;

  // Headers
  const headers = ["Código", "Descripción", "Componente", "Nombre Componente", "Cantidad", "Unidad"];
  headers.forEach((h, c) => {
    ws[XLSX.utils.encode_cell({ r: row, c })] = { v: h, t: "s" };
  });
  row++;

  // === PT001 - has 3 components ===
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "Código producto: PT001 COMBO CAPPUCCINO + TORTA", t: "s" };
  row++;
  // Component 1
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "PT001", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: "MP101", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = { v: "Café molido", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = { v: 0.05, t: "n" };
  ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = { v: "KG", t: "s" };
  row++;
  // Component 2
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "PT001", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: "MP102", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = { v: "Leche entera", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = { v: 0.25, t: "n" };
  ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = { v: "LT", t: "s" };
  row++;
  // Component 3
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "PT001", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: "PT050", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = { v: "Porción torta chocolate", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = { v: 1, t: "n" };
  ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = { v: "UNIDAD", t: "s" };
  row++;

  // === PT002 - has 2 components ===
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "Código producto: PT002 AMERICANO SENCILLO", t: "s" };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "PT002", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: "MP101", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = { v: "Café molido", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = { v: 0.03, t: "n" };
  ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = { v: "KG", t: "s" };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "PT002", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: "MP200", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = { v: "Agua filtrada", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = { v: 0.3, t: "n" };
  ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = { v: "LT", t: "s" };
  row++;

  // === PT003 - has 4 components ===
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "Código producto: PT003 SHAKE DE FRESA", t: "s" };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "PT003", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: "MP300", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = { v: "Fresas congeladas", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = { v: 0.15, t: "n" };
  ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = { v: "KG", t: "s" };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "PT003", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: "MP102", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = { v: "Leche entera", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = { v: 0.3, t: "n" };
  ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = { v: "LT", t: "s" };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "PT003", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: "MP301", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = { v: "Helado vainilla", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = { v: 0.1, t: "n" };
  ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = { v: "KG", t: "s" };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: "PT003", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: "MP302", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = { v: "Crema chantilly", t: "s" };
  ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = { v: 0.05, t: "n" };
  ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = { v: "KG", t: "s" };
  row++;

  // Note: PT004 has NO components — so it won't appear as combo

  // Set range
  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row - 1, c: 5 } });

  XLSX.utils.book_append_sheet(wb, ws, "Ensamble");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}
