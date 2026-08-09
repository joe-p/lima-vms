#!/usr/bin/env bun
import assert from "node:assert";
import { LimaController, type LimaVM } from "./lib";

export async function pickRepo(): Promise<{
  repo: string;
  vm: LimaVM;
  selection: string;
}> {
  const lima = new LimaController();
  const vms = await lima.list();

  const repos: string[] = [];
  for (const vm of vms) {
    if (vm.name === "dev-template") continue;
    if (vm.status !== "Running") continue;
    const vmRepos = (
      await lima
        .shell(vm.name, `find git -maxdepth 3 -mindepth 2 -type d -name ".git"`)
        .quiet()
        .text()
    )
      .split("\n")
      .filter((repo) => repo.length)
      .map((repo) => `${vm.name}: ${repo.split("/").slice(1, 3).join("/")}`);

    repos.push(...vmRepos);
  }

  const proc = Bun.spawn(["fzf", "--nth=-1", "--layout=reverse"], {
    stdin: "pipe",
    stdout: "pipe",
  });

  proc.stdin.write(repos.join("\n"));
  await proc.stdin.end();

  const selection = await proc.stdout.text();
  const [selectedVmName, repo] = selection.split(": ");

  const selectedVm = vms.find((vm) => vm.name === selectedVmName);

  assert(selectedVm, "selected name should be a VM");
  assert(repo, "selection should have repo");

  return {
    vm: selectedVm,
    repo: repo.trim(),
    selection,
  };
}

if (import.meta.main) {
  console.log((await pickRepo()).selection);
}
