#!/usr/bin/env bash
set -euox pipefail

src=$1
dst=$2

VM=lima-$dst

limactl stop -f "$src"
limactl clone --tty=false "$src" "$dst"
limactl start --debug "$dst"

ssh $VM -- sudo cloud-init clean --logs --machine-id
ssh $VM -- sudo rm -rf /var/log/journal/*
ssh $VM -- sudo rm -f /etc/ssh/ssh_host_*
ssh $VM -- sudo ssh-keygen -A

limactl stop "$dst"
rm ~/.lima/$dst/ssh.known_hosts
limactl start --debug "$dst"

ssh $VM -- hostnamectl
ssh $VM -- sudo journalctl -n 5
