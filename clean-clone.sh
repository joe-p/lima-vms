#!/usr/bin/env bash
set -euox pipefail

src=$1
dst=$2

limactl stop -f "$src"
limactl clone --start "$src" "$dst"

limactl shell "$dst" -- sudo cloud-init clean --logs --machine-id
limactl shell "$dst" -- sudo rm -rf /var/log/journal/*
limactl shell "$dst" -- sudo rm -f /etc/ssh/ssh_host_*
limactl shell "$dst" -- sudo ssh-keygen -A

limactl stop "$dst"
limactl start "$dst"

limactl shell "$dst" -- hostnamectl
limactl shell "$dst" -- sudo journalctl -n 5
