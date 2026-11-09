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
const user = process.env.USER;
const gitDir = `/home/${user}.guest/git`;

// Replace any existing entry for this disk so re-running the script stays idempotent
const disk = JSON.stringify({
  name: diskName,
  format: true,
  fsType: "ext4",
  mountPoint: gitDir,
});
await lima.cmd(
  `edit ${vm} --start --set '.additionalDisks = ((.additionalDisks // []) | map(select(.name != "${diskName}"))) + [${disk}]'`,
);

await lima.shell(vm, `sudo chown -R ${user}:${user} ${gitDir}`);
