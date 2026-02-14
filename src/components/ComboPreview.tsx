import { type ComboProduct } from "@/lib/siigo-parser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface Props {
  combos: ComboProduct[];
}

export function ComboPreview({ combos }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-display font-semibold">
          3. Vista Previa — {combos.length} combos
        </h2>
      </div>
      <div className="overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-32">Grupo</TableHead>
              <TableHead className="w-40">Componentes</TableHead>
              <TableHead className="w-28 text-right">Precio 1</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combos.map((combo) => (
              <TableRow key={combo.code}>
                <TableCell className="font-mono text-sm">{combo.code}</TableCell>
                <TableCell className="font-medium">{combo.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {combo.accountGroup}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {combo.components.map((c) => (
                      <Badge key={c.code} variant="secondary" className="text-xs">
                        {c.code} ×{c.quantity}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {combo.prices[0]
                    ? `$${combo.prices[0].value.toLocaleString("es-CO")}`
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
