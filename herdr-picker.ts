import { $ } from "bun";
import { pickRepo } from "./pick-repo";

type Terminal = {
  terminal: string;
  pane: string;
  status?: string;
  app?: string;
  name?: string;
  sub_agents: unknown;
};

type Space = {
  id: string;
  name: string;
  folder: string;
  machine?: string;
  active: boolean;
  tabs: [
    {
      id: string;
      name: string;
      active: boolean;
      settled: boolean;
      terminals: Terminal[];
    },
  ];
};

const herdrAppLs = await $`herdr-app ls`.quiet();
const spaces: Space[] = JSON.parse(herdrAppLs.text()).spaces;

function nameForDir(dir: string) {
  return dir.replace("git/", "");
}

try {
  const repo = await pickRepo();

  const vmSpaces = spaces.filter((s) => s.machine === repo.vm.hostname);
  const dirSpace = vmSpaces.find((s) => s.name === nameForDir(repo.dir));

  if (dirSpace) {
    await $`herdr-app do space.select --id ${dirSpace.id}`.quiet();
  } else {
    const dir = repo.dir === "$HOME" ? "" : repo.dir;
    await $`herdr-app do space.new --machine ${repo.vm.hostname} --folder /home/joe.guest/${dir} --name ${nameForDir(dir)}`.quiet();
  }
} finally {
  spaces.forEach(async (s) => {
    if (s.name === "picker")
      await $`herdr-app do space.close --id ${s.id} --confirmed true`.quiet();
  });
}
