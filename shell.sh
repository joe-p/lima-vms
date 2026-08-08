#!/usr/bin/env bash
set -x
kitten ssh -F ~/.lima/$1/ssh.config lima-$1
