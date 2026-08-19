#!/usr/bin/env bun

/*
  Script for picking a kitty tab based on git repos in the VMs
 
  Make sure kitty.conf launches this script with remote control. For example:
  
  ```
  map cmd+k launch --type=overlay --allow-remote-control zsh -lic /Users/joe/git/joe-p/lima-vms/kitty-picker.ts
  ```
 */
import { $ } from "bun";
import { pickRepo } from "./pick-repo";
import { basename } from "node:path";

type KittyTab = { title: string; id: number };
type KittyWindow = { tabs: KittyTab[] };

const { vm, dir } = await pickRepo();
const title = `${basename(dir)} [${vm.name}]`;

const windows: KittyWindow[] = await $`kitty @ ls`.json();
const tab = windows.flatMap((w) => w.tabs).find((t) => t.title === title);

if (tab) {
  await $`kitty @ focus-tab --match ${`id:${tab.id}`}`;
} else {
  const sshCmd = `kitten ssh -t -F ${vm.sshConfigFile} ${vm.hostname} 'cd ${dir} && zsh -lic vim'`;
  await $`kitty @ launch --type=tab --tab-title=${title} zsh -lic ${sshCmd}`;
}
