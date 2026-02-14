import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CredentialsForm } from "@/components/CredentialsForm";
import { FileUploader } from "@/components/FileUploader";
import { ComboPreview } from "@/components/ComboPreview";
import { UploadProgress } from "@/components/UploadProgress";
import {
  parseProductsFile,
  parseComponentsFile,
  buildCombos,
  comboToSiigoPayload,
  type ComboProduct,
} from "@/lib/siigo-parser";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, AlertCircle, Package } from "lucide-react";

interface UploadResult {
  code: string;
  success: boolean;
  error?: unknown;
}

const Index = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    access_key: "",
    partner_id: "",
  });
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  const [combos, setCombos] = useState<ComboProduct[]>([]);
  const [activeStatus, setActiveStatus] = useState(true);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAuth = useCallback(async () => {
    if (!credentials.username || !credentials.access_key) {
      toast({ title: "Error", description: "Username y Access Key son obligatorios", variant: "destructive" });
      return;
    }
    setAuthenticating(true);
    try {
      const { data, error } = await supabase.functions.invoke("siigo-proxy", {
        body: {
          action: "auth",
          username: credentials.username,
          access_key: credentials.access_key,
          partner_id: credentials.partner_id,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(JSON.stringify(data.error));
      setToken(`${data.token_type} ${data.access_token}`);
      setIsAuthenticated(true);
      toast({ title: "✅ Autenticado", description: "Token válido por 24 horas" });
    } catch (err) {
      toast({
        title: "Error de autenticación",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setAuthenticating(false);
    }
  }, [credentials]);

  const handleFilesLoaded = useCallback(
    (productsBuffer: ArrayBuffer, componentsBuffer: ArrayBuffer) => {
      try {
        const products = parseProductsFile(productsBuffer);
        const components = parseComponentsFile(componentsBuffer);
        const combosResult = buildCombos(products, components, activeStatus);
        setCombos(combosResult);
        setProductsLoaded(true);
        toast({
          title: "Archivos procesados",
          description: `${combosResult.length} combos encontrados con componentes`,
        });
      } catch (err) {
        toast({
          title: "Error al procesar archivos",
          description: err instanceof Error ? err.message : "Error desconocido",
          variant: "destructive",
        });
      }
    },
    [activeStatus]
  );

  const handleUpload = useCallback(async () => {
    if (!token || combos.length === 0) return;
    setUploading(true);
    setUploadResults([]);
    setUploadProgress(0);

    const payloads = combos.map((c) => comboToSiigoPayload(c, activeStatus));

    // Send in batches of 5
    const batchSize = 5;
    const allResults: UploadResult[] = [];

    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);
      try {
        const { data, error } = await supabase.functions.invoke("siigo-proxy", {
          body: {
            action: "create_products",
            token,
            partner_id: credentials.partner_id,
            products: batch,
          },
        });
        if (error) throw error;
        if (data.results) {
          allResults.push(...data.results);
        }
      } catch (err) {
        batch.forEach((p) =>
          allResults.push({
            code: String(p.code),
            success: false,
            error: err instanceof Error ? err.message : "Error",
          })
        );
      }
      setUploadProgress(Math.min(100, Math.round(((i + batchSize) / payloads.length) * 100)));
      setUploadResults([...allResults]);
    }

    setUploading(false);
    const successCount = allResults.filter((r) => r.success).length;
    toast({
      title: "Carga completada",
      description: `${successCount}/${allResults.length} combos creados exitosamente`,
    });
  }, [token, combos, activeStatus, credentials.partner_id]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Package className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Siigo Combo Uploader
            </h1>
            <p className="text-sm text-muted-foreground">
              Carga masiva de productos tipo Combo
            </p>
          </div>
          {isAuthenticated && (
            <span className="ml-auto flex items-center gap-1.5 text-sm text-success font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Conectado
            </span>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6 max-w-5xl">
        {/* Step 1: Credentials */}
        <CredentialsForm
          credentials={credentials}
          setCredentials={setCredentials}
          onAuth={handleAuth}
          isAuthenticated={isAuthenticated}
          loading={authenticating}
        />

        {/* Step 2: Files */}
        {isAuthenticated && (
          <FileUploader onFilesLoaded={handleFilesLoaded} />
        )}

        {/* Step 3: Preview & Upload */}
        {productsLoaded && combos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <Label htmlFor="active-toggle" className="text-sm font-medium">
                  Subir productos como:
                </Label>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${!activeStatus ? "text-foreground" : "text-muted-foreground"}`}>
                    Inactivos
                  </span>
                  <Switch
                    id="active-toggle"
                    checked={activeStatus}
                    onCheckedChange={setActiveStatus}
                  />
                  <span className={`text-sm font-medium ${activeStatus ? "text-foreground" : "text-muted-foreground"}`}>
                    Activos
                  </span>
                </div>
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Subiendo..." : `Subir ${combos.length} Combos`}
              </Button>
            </div>

            <ComboPreview combos={combos} />

            {uploadResults.length > 0 && (
              <UploadProgress results={uploadResults} progress={uploadProgress} />
            )}
          </div>
        )}

        {productsLoaded && combos.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <AlertCircle className="h-10 w-10 text-warning mx-auto mb-3" />
            <p className="text-foreground font-medium">No se encontraron combos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ningún producto del archivo de importación tiene componentes en el archivo de ensamble.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
