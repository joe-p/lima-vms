#!/usr/bin/env bun

import { LimaController } from "./lib";
import { $ } from "bun";

const lima = new LimaController();
const vm = Bun.argv[2];
if (!vm) throw Error("vm name is required");

if ((await lima.vm(vm))?.status !== "Stopped") {
  await $`limactl stop ${vm}`;
}

const diskName = `${vm}-git`;
const disks = (await $`limactl disk list --json`.quiet().text())
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line) as { name: string });

if (disks.some((d) => d.name === diskName)) {
  console.log(`disk ${diskName} already exists, reattaching`);
} else {
  await lima.cmd(`disk create ${diskName} --size 20GiB`);
}
await lima.cmd(
  `edit ${vm} --start --set '.additionalDisks += [{"name":"${vm}-git","format":true,"fsType":"ext4"}]'`,
);

const gitDir = `/home/${process.env.USER}.guest/git`;
await lima.shell(vm, `mkdir -p ${gitDir}`);
await lima.shell(vm, `sudo mount --bind /mnt/lima-${vm}-git ${gitDir}`);
await lima.shell(vm, `sudo chown -R joe:joe ${gitDir}`);
