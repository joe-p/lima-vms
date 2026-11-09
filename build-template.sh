#!/usr/bin/env bash

set -ex

limactl create -y dev-template.yaml
limactl start dev-template

limactl shell dev-template -- sh -c "git clone --bare https://github.com/joe-p/dotfiles.git \$HOME/.dotfiles"
limactl shell dev-template -- sh -c "git --git-dir=\$HOME/.dotfiles/ --work-tree=\$HOME checkout --force"
limactl shell dev-template -- sh -c "cd .setup && bash setup-ubuntu.sh"
limactl shell dev-template -- sudo bash .setup/setup-sudo-ssh-agent-auth.sh joe

