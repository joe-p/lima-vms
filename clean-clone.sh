#!/usr/bin/env bash
set -euox pipefail

src=$1
dst=$2

VM=lima-$dst

limactl stop -f "$src"
limactl clone --start "$src" "$dst"
ssh -O exit $VM
ssh -A $VM -- sudo cloud-init clean --logs --machine-id
ssh -A $VM -- sudo rm -rf /var/log/journal/*
ssh -A $VM -- sudo rm -f /etc/ssh/ssh_host_*
ssh -A $VM -- sudo ssh-keygen -A

limactl stop "$dst"
rm ~/.lima/$dst/ssh.known_hosts
limactl start --debug "$dst"
ssh -O exit $VM

ssh -A $VM -- hostnamectl
ssh -A $VM -- sudo journalctl -n 5
