#!/usr/bin/env bash

set -ex

limactl create --debug -y dev-template.yaml
limactl start --debug dev-template

limactl shell dev-template -- sh -c "sudo DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a APT_LISTCHANGES_FRONTEND=none apt-get -y update"
limactl shell dev-template -- sh -c "sudo DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a APT_LISTCHANGES_FRONTEND=none apt-get -y -o Dpkg::Options::=\"--force-confdef\" -o Dpkg::Options::=\"--force-confold\" upgrade"
limactl restart dev-template
limactl shell dev-template -- sh -c "git clone --bare https://github.com/joe-p/dotfiles.git \$HOME/.dotfiles"
limactl shell dev-template -- sh -c "git --git-dir=\$HOME/.dotfiles/ --work-tree=\$HOME checkout --force"
limactl shell dev-template -- sh -c "cd .setup && bash setup-ubuntu.sh"
limactl shell dev-template -- sudo bash .setup/setup-sudo-ssh-agent-auth.sh joe

