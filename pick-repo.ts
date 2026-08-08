#!/usr/bin/env bun
import { $ } from "bun";

export async function pickRepo(): Promise<{
  repo: string;
  vm: string;
  selection: string;
}> {
  const vmList = await $`limactl list --json | jq -s .`.quiet();

  const vms = vmList.json();

  const repos: string[] = [];
  for (const vm of vms) {
    if (vm.name === "dev-template") continue;
    const vmRepos = (
      await $`limactl shell ${vm.name} -- find git -maxdepth 3 -mindepth 2 -type d -name ".git"`
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
  const [vm, repo] = selection.split(": ");

  return { vm: vm!.trim(), repo: repo!.trim(), selection };
}

if (import.meta.main) {
  console.log((await pickRepo()).selection);
}
