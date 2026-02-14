import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { generateProductsExample, generateComponentsExample } from "@/lib/generate-examples";

function download(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExampleDownloader() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-3">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-display font-semibold">Archivos de Ejemplo</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Descarga estos archivos para ver la estructura exacta que el sistema espera. 
        El producto <code className="text-xs bg-muted px-1 py-0.5 rounded">PT004</code> no tiene componentes, así que <strong>no se sube</strong> como combo.
      </p>
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => download(generateProductsExample(), "Ejemplo_Productos.xlsx")}
        >
          <Download className="h-4 w-4" />
          Productos (ejemplo)
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => download(generateComponentsExample(), "Ejemplo_Ensamble.xlsx")}
        >
          <Download className="h-4 w-4" />
          Ensamble (ejemplo)
        </Button>
      </div>
    </div>
  );
}
