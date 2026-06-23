import { Badge } from "@/components/ui/badge";
import {
  CLIENT_STATUS_LABEL,
  LEAD_SOURCE_LABEL,
  PIPELINE_STAGE_LABEL,
  PROSPECT_STATUS_LABEL,
  QUOTE_STATUS_LABEL,
  type ClientStatus,
  type LeadSource,
  type PipelineStage,
  type ProspectStatus,
  type QuoteStatus,
} from "@/lib/types";

type Variant = React.ComponentProps<typeof Badge>["variant"];

const prospectVariant: Record<ProspectStatus, Variant> = {
  nuevo: "info",
  contactado: "secondary",
  calificado: "warning",
  convertido: "success",
  perdido: "destructive",
};

export function ProspectStatusBadge({ status }: { status: ProspectStatus }) {
  return (
    <Badge variant={prospectVariant[status]}>
      {PROSPECT_STATUS_LABEL[status]}
    </Badge>
  );
}

const clientVariant: Record<ClientStatus, Variant> = {
  activo: "success",
  inactivo: "secondary",
  en_riesgo: "warning",
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge variant={clientVariant[status]}>{CLIENT_STATUS_LABEL[status]}</Badge>
  );
}

const stageVariant: Record<PipelineStage, Variant> = {
  prospeccion: "info",
  calificacion: "secondary",
  propuesta: "info",
  negociacion: "warning",
  ganada: "success",
  perdida: "destructive",
};

export function StageBadge({ stage }: { stage: PipelineStage }) {
  return (
    <Badge variant={stageVariant[stage]}>{PIPELINE_STAGE_LABEL[stage]}</Badge>
  );
}

const quoteVariant: Record<QuoteStatus, Variant> = {
  borrador: "secondary",
  enviada: "info",
  aceptada: "success",
  rechazada: "destructive",
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <Badge variant={quoteVariant[status]}>{QUOTE_STATUS_LABEL[status]}</Badge>
  );
}

export function SourceBadge({ source }: { source: LeadSource }) {
  return <Badge variant="outline">{LEAD_SOURCE_LABEL[source]}</Badge>;
}
