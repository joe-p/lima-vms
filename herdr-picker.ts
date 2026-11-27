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

const herdrAppLs = await $`herdr-app ls`;
const spaces: Space[] = JSON.parse(herdrAppLs.text()).spaces;

try {
  const repo = await pickRepo();

  const vmSpaces = spaces.filter((s) => s.machine === repo.vm.hostname);
  const dirSpace = vmSpaces.find((s) => s.name === repo.dir.split("/").at(-1));

  if (dirSpace) {
    await $`herdr-app do space.select --id ${dirSpace.id}`;
  } else {
    await $`herdr-app do space.new --machine ${repo.vm.hostname} --folder /home/joe.guest/${repo.dir}`;
  }
} finally {
  spaces.forEach(async (s) => {
    if (s.name === "picker")
      await $`herdr-app do space.close --id ${s.id} --confirmed true`;
  });
}
