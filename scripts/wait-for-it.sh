#!/usr/bin/env bash
# wait-for-it.sh — waits for a TCP host:port to be available
set -e
host="$1"; port="$2"; shift 2; cmd="$@"
until nc -z "$host" "$port"; do
  echo "Waiting for $host:$port..."
  sleep 2
done
echo "$host:$port is available"
exec $cmd
