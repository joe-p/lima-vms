#!/usr/bin/env bun

import { LimaController } from "./lib";
import { $ } from "bun";

const lima = new LimaController();
const vm = Bun.argv[2];
if (!vm) throw Error("vm name is required");

if ((await lima.vm(vm))?.status !== "Stopped") {
  await $`limactl stop ${vm}`;
}

await lima.cmd(`disk create ${vm}-git --size 20GiB`);
await lima.cmd(
  `edit ${vm} --start --set '.additionalDisks += [{"name":"${vm}-git","format":true,"fsType":"ext4"}]'`,
);

const gitDir = `/home/${process.env.USER}.guest/git`;
await lima.shell(vm, `mkdir ${gitDir}`);
await lima.shell(vm, `sudo mount --bind /mnt/lima-${vm}-git ${gitDir}`);
await lima.shell(vm, `sudo chown -R joe:joe ${gitDir}`);
