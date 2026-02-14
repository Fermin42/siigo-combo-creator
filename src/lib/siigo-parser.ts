import * as XLSX from "xlsx";

export interface ProductRow {
  code: string;
  name: string;
  accountGroup: number;
  accountGroupName: string;
  unit: string;
  unitLabel: string;
  reference: string;
  taxCode: string;
  taxIncluded: boolean;
  prices: { position: number; value: number }[];
  stockControl: boolean;
}

export interface ComponentRow {
  parentCode: string;
  componentCode: string;
  quantity: number;
}

export interface ComboProduct {
  code: string;
  name: string;
  accountGroup: number;
  accountGroupName: string;
  unit: string;
  unitLabel: string;
  reference: string;
  taxCode: string;
  taxIncluded: boolean;
  prices: { position: number; value: number }[];
  components: { code: string; quantity: number }[];
  stockControl: boolean;
}

function parseAccountGroup(raw: string): { id: number; name: string } {
  // Format: "7 Producto Terminado - Cafeteria"
  const match = raw?.match(/^(\d+)\s+(.+)/);
  if (match) return { id: parseInt(match[1]), name: match[2] };
  return { id: 0, name: raw || "" };
}

function parsePrice(val: unknown): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return val;
  const str = String(val).replace(/[$\s]/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function parseProductsFile(data: ArrayBuffer): ProductRow[] {
  const wb = XLSX.read(data, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  return rows.map((row) => {
    const ag = parseAccountGroup(String(row["Categoría de Inventarios / Servicios (obligatorio)"] || ""));
    const prices: { position: number; value: number }[] = [];

    const priceColumns = [
      { key: "Precio de venta 1", pos: 1 },
      { key: "Precio de venta 2", pos: 2 },
      { key: "Precio de venta 3", pos: 3 },
    ];

    for (const pc of priceColumns) {
      const v = parsePrice(row[pc.key]);
      if (v > 0) prices.push({ position: pc.pos, value: v });
    }

    return {
      code: String(row["Código del Producto (obligatorio)"] || "").trim(),
      name: String(row["Nombre del Producto / Servicio (obligatorio)"] || "").trim(),
      accountGroup: ag.id,
      accountGroupName: ag.name,
      unit: String(row["Código Unidad de medida DIAN"] || "94").trim(),
      unitLabel: String(row["Unidad de Medida Impresión Factura"] || "").trim(),
      reference: String(row["Referencia de Fábrica"] || "").trim(),
      taxCode: String(row["Código Impuesto Cargo"] || "").trim(),
      taxIncluded: String(row["¿Incluye IVA en Precio de Venta?"] || "").toUpperCase() === "SI",
      prices,
      stockControl: String(row["¿Inventariable? (obligatorio)"] || "").toUpperCase() === "SI",
    };
  }).filter((p) => p.code);
}

export function parseComponentsFile(data: ArrayBuffer): ComponentRow[] {
  const wb = XLSX.read(data, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  
  // This file has a specific structure - parse it raw
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  const components: ComponentRow[] = [];
  let currentParent = "";

  for (let r = range.s.r; r <= range.e.r; r++) {
    // Read cells in the row
    const cells: string[] = [];
    for (let c = range.s.c; c <= Math.min(range.e.c, 10); c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      cells.push(cell ? String(cell.v || "") : "");
    }

    const rowText = cells.join(" ").trim();
    
    // Check if this row defines a parent product
    const parentMatch = rowText.match(/Código producto:\s*(PT\d+)/i);
    if (parentMatch) {
      currentParent = parentMatch[1];
      continue;
    }

    // Look for component rows - they have a product code and quantity
    if (currentParent) {
      // Search for component code (MP### or PT### pattern) and quantity
      for (let c = 0; c < cells.length; c++) {
        const code = cells[c].trim();
        if (/^(MP|PT)\d+$/i.test(code)) {
          // Look for quantity in nearby cells
          for (let q = c + 1; q < cells.length; q++) {
            const qty = parseFloat(String(cells[q]).replace(",", "."));
            if (!isNaN(qty) && qty > 0) {
              components.push({
                parentCode: currentParent,
                componentCode: code,
                quantity: qty,
              });
              break;
            }
          }
          break;
        }
      }
    }
  }

  return components;
}

export function buildCombos(
  products: ProductRow[],
  components: ComponentRow[],
  active: boolean
): ComboProduct[] {
  // Group components by parent code
  const componentMap = new Map<string, { code: string; quantity: number }[]>();
  for (const c of components) {
    const list = componentMap.get(c.parentCode) || [];
    list.push({ code: c.componentCode, quantity: c.quantity });
    componentMap.set(c.parentCode, list);
  }

  // Only products that have components
  const combos: ComboProduct[] = [];
  for (const p of products) {
    const comps = componentMap.get(p.code);
    if (comps && comps.length > 0) {
      combos.push({
        ...p,
        components: comps,
      });
    }
  }

  return combos;
}

export function comboToSiigoPayload(
  combo: ComboProduct,
  active: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    type: "Combo",
    code: combo.code,
    name: combo.name,
    account_group: combo.accountGroup,
    active,
    stock_control: combo.stockControl,
    unit: combo.unit || "94",
    components: combo.components.map((c) => ({
      code: c.code,
      quantity: c.quantity,
    })),
  };

  if (combo.unitLabel) payload.unit_label = combo.unitLabel;
  if (combo.reference) payload.reference = combo.reference;

  if (combo.prices.length > 0) {
    payload.prices = [
      {
        currency_code: "COP",
        price_list: combo.prices.map((p) => ({
          position: p.position,
          value: p.value,
        })),
      },
    ];
  }

  return payload;
}
