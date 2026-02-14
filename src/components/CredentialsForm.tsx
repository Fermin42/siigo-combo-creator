import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  credentials: { username: string; access_key: string; partner_id: string };
  setCredentials: (c: { username: string; access_key: string; partner_id: string }) => void;
  onAuth: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export function CredentialsForm({ credentials, setCredentials, onAuth, isAuthenticated, loading }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-display font-semibold">1. Credenciales Siigo</h2>
        {isAuthenticated && <CheckCircle2 className="h-5 w-5 text-success ml-auto" />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-sm">Username</Label>
          <Input
            id="username"
            placeholder="usuario@siigoapi.com"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            disabled={isAuthenticated}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="access_key" className="text-sm">Access Key</Label>
          <Input
            id="access_key"
            type="password"
            placeholder="Tu access key"
            value={credentials.access_key}
            onChange={(e) => setCredentials({ ...credentials, access_key: e.target.value })}
            disabled={isAuthenticated}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="partner_id" className="text-sm">Partner ID (opcional)</Label>
          <Input
            id="partner_id"
            placeholder="Nombre de tu app"
            value={credentials.partner_id}
            onChange={(e) => setCredentials({ ...credentials, partner_id: e.target.value })}
            disabled={isAuthenticated}
          />
        </div>
      </div>
      {!isAuthenticated && (
        <Button onClick={onAuth} disabled={loading} className="mt-4 gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {loading ? "Autenticando..." : "Conectar a Siigo"}
        </Button>
      )}
    </div>
  );
}
