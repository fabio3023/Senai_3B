#!/usr/bin/env bash
set -euo pipefail

action="${1:-status}"

is_ready() {
  if command -v pg_isready >/dev/null 2>&1; then
    pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1
  else
    (echo >/dev/tcp/127.0.0.1/5432) >/dev/null 2>&1
  fi
}

find_service() {
  if ! command -v systemctl >/dev/null 2>&1; then
    return 1
  fi

  local candidate
  for candidate in postgresql postgresql.service; do
    if systemctl list-unit-files "$candidate" >/dev/null 2>&1; then
      printf '%s' "$candidate"
      return 0
    fi
  done

  systemctl list-unit-files --type=service 2>/dev/null     | awk '/postgresql.*\.service/ {print $1; exit}'
}

service_name="$(find_service || true)"

case "$action" in
  start)
    if is_ready; then
      echo 'PostgreSQL local já está respondendo em 127.0.0.1:5432.'
      exit 0
    fi
    if [[ -z "$service_name" ]]; then
      echo 'Serviço PostgreSQL não localizado.' >&2
      exit 1
    fi
    sudo systemctl start "$service_name"
    echo "PostgreSQL iniciado: $service_name"
    ;;
  stop)
    if [[ -z "$service_name" ]]; then
      echo 'Serviço PostgreSQL não localizado.' >&2
      exit 1
    fi
    sudo systemctl stop "$service_name"
    echo "PostgreSQL parado: $service_name"
    ;;
  status)
    if [[ -n "$service_name" ]]; then
      systemctl --no-pager status "$service_name" || true
    fi
    if is_ready; then
      echo 'Porta 127.0.0.1:5432 acessível.'
      exit 0
    fi
    echo 'PostgreSQL não está respondendo em 127.0.0.1:5432.' >&2
    exit 1
    ;;
  *)
    echo 'Uso: postgres_service.sh start|stop|status' >&2
    exit 2
    ;;
esac
