type FileSizeOptions = {
  emptyLabel?: string;
  useKbBelowMb?: boolean;
};

export function formatDuration(
  minutes: number | null | undefined,
  emptyLabel = 'Sem duracao',
) {
  if (!minutes || minutes <= 0) {
    return emptyLabel;
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

export function formatOptionalDate(
  value: string | null | undefined,
  emptyLabel = 'Sem data',
) {
  if (!value) {
    return emptyLabel;
  }

  const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data invalida';
  }

  return date.toLocaleDateString();
}

export function formatFileSize(
  sizeBytes: number | null | undefined,
  options: FileSizeOptions = {},
) {
  const { emptyLabel = 'Tamanho desconhecido', useKbBelowMb = false } = options;

  if (!sizeBytes || sizeBytes <= 0) {
    return emptyLabel;
  }

  const sizeInMb = sizeBytes / 1024 / 1024;

  if (useKbBelowMb && sizeInMb < 1) {
    return `${(sizeBytes / 1024).toFixed(2)} KB`;
  }

  return `${sizeInMb.toFixed(2)} MB`;
}
