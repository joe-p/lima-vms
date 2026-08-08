#!/usr/bin/env bash

set -x
limactl stop --force dev-template
limactl delete dev-template
limactl create -y dev-template.yaml
limactl start dev-template

limactl shell dev-template -- sh -c "rm -rf ~/.local/share/chezmoi"
limactl shell dev-template -- sh -c "git clone --branch chezmoi https://github.com/joe-p/dotfiles.git ~/.local/share/chezmoi"
ghtkn exec -- limactl shell dev-template -- sh -c "cd ~/.local/share/chezmoi/dot_setup && MISE_GITHUB_TOKEN=$GITHUB_TOKEN bash setup-ubuntu.sh"

