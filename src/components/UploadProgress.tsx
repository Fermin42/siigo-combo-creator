import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

interface UploadResult {
  code: string;
  success: boolean;
  error?: unknown;
}

interface Props {
  results: UploadResult[];
  progress: number;
}

export function UploadProgress({ results, progress }: Props) {
  const successCount = results.filter((r) => r.success).length;
  const errorCount = results.filter((r) => !r.success).length;

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">Progreso de Carga</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 className="h-4 w-4" /> {successCount} exitosos
          </span>
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="h-4 w-4" /> {errorCount} errores
            </span>
          )}
        </div>
      </div>
      <Progress value={progress} className="h-2" />
      
      {errorCount > 0 && (
        <div className="max-h-40 overflow-auto space-y-1">
          {results
            .filter((r) => !r.success)
            .map((r) => (
              <div key={r.code} className="text-sm text-destructive flex items-start gap-2">
                <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-mono font-medium">{r.code}</span>:{" "}
                  {typeof r.error === "string" ? r.error : JSON.stringify(r.error)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
