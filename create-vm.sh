#!/usr/bin/env bash

set -x
limactl stop dev-template
limactl clone dev-template $1
