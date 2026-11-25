#!/usr/bin/env bash
# [M2] Mide las consultas críticas: por cada Q muestra el tipo de scan principal y el
# "Execution Time" (mediana de N corridas, por defecto 5).
#
#   Uso:  PGHOST=localhost PGPORT=5432 PGUSER=postgres ./measure.sh [corridas]
#
# Usa estas bases (cámbielas con las variables si su estructura es distinta):
#   DB_CLINICAL=clinical_db  DB_SCHEDULING=scheduling_db  DB_NOTIFICATIONS=notifications_db
# Con la estructura anterior (un esquema por servicio en una sola base) apunte las tres a esa base.
set -euo pipefail

RUNS="${1:-5}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PSQL="${PSQL:-psql}"

declare -A BASES=(
  [clinical]="${DB_CLINICAL:-clinical_db}"
  [scheduling]="${DB_SCHEDULING:-scheduling_db}"
  [notifications]="${DB_NOTIFICATIONS:-notifications_db}"
)

for svc in clinical scheduling notifications; do
  echo "=== $svc (${BASES[$svc]}) ==="
  for ((i = 1; i <= RUNS; i++)); do
    "$PSQL" -X -q -d "${BASES[$svc]}" -f "$DIR/$svc.sql" > "$DIR/.run-$svc-$i.txt" 2>&1 || true
  done
  # Une las corridas por consulta: etiqueta, scan principal, mediana de tiempos.
  awk -v runs="$RUNS" '
    FNR == 1 { run++ }
    /^>> /            { q = $0; if (!(q in seen)) { seen[q] = 1; order[++n] = q } next }
    /Execution Time/  { t = $3; times[q] = times[q] " " t }
    /Scan/ && !(q in scan) { s = $0; sub(/^[ ]*(->)?[ ]*/, "", s); sub(/ \(cost.*/, "", s); sub(/ on .*/, "", s); scan[q] = s }
    END {
      for (i = 1; i <= n; i++) {
        q = order[i]; m = split(times[q], a, " ")
        for (x = 1; x <= m; x++) for (y = x + 1; y <= m; y++) if (a[x] + 0 > a[y] + 0) { tmp = a[x]; a[x] = a[y]; a[y] = tmp }
        printf "%-95s %10s ms  [%s]\n", substr(q, 4), a[int((m + 1) / 2)], scan[q]
      }
    }' "$DIR"/.run-"$svc"-*.txt
  rm -f "$DIR"/.run-"$svc"-*.txt
done
