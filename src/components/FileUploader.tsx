import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, CheckCircle2 } from "lucide-react";

interface Props {
  onFilesLoaded: (products: ArrayBuffer, components: ArrayBuffer) => void;
}

export function FileUploader({ onFilesLoaded }: Props) {
  const productsRef = useRef<HTMLInputElement>(null);
  const componentsRef = useRef<HTMLInputElement>(null);
  const [productsFile, setProductsFile] = useState<File | null>(null);
  const [componentsFile, setComponentsFile] = useState<File | null>(null);

  const handleProcess = useCallback(async () => {
    if (!productsFile || !componentsFile) return;
    const [pBuf, cBuf] = await Promise.all([
      productsFile.arrayBuffer(),
      componentsFile.arrayBuffer(),
    ]);
    onFilesLoaded(pBuf, cBuf);
  }, [productsFile, componentsFile, onFilesLoaded]);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-display font-semibold">2. Cargar Archivos Excel</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Products file */}
        <div
          onClick={() => productsRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <input
            ref={productsRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setProductsFile(e.target.files?.[0] || null)}
          />
          {productsFile ? (
            <div className="flex items-center justify-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">{productsFile.name}</span>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Modelo Personalizado de Importación</p>
              <p className="text-xs text-muted-foreground mt-1">Archivo de productos (.xlsx)</p>
            </>
          )}
        </div>

        {/* Components file */}
        <div
          onClick={() => componentsRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <input
            ref={componentsRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setComponentsFile(e.target.files?.[0] || null)}
          />
          {componentsFile ? (
            <div className="flex items-center justify-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">{componentsFile.name}</span>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Ensamble Producto Proceso</p>
              <p className="text-xs text-muted-foreground mt-1">Archivo de componentes (.xlsx)</p>
            </>
          )}
        </div>
      </div>

      <Button
        onClick={handleProcess}
        disabled={!productsFile || !componentsFile}
        className="mt-4 gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Procesar Archivos
      </Button>
    </div>
  );
}
