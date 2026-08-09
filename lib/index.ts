import { $ } from "bun";

export type LimaVM = {
  status: "Running" | "Stopped";
  name: string;
  hostname: string;
  sshConfigFile: string;
};

export class LimaController {
  constructor(private bin: string = "limactl") {}

  async list(): Promise<LimaVM[]> {
    const vmList = await $`${this.bin} list --json | jq -s .`.quiet();

    return vmList.json();
  }

  async vm(name: string): Promise<LimaVM | undefined> {
    return (await this.list()).find((vm) => vm.name === name);
  }

  shell(vmName: string, cmd: string): $.ShellPromise {
    return this.cmd(`shell ${vmName} -- ${cmd}`);
  }

  cmd(cmd: string): $.ShellPromise {
    console.log(`+${this.bin} ${cmd}`);
    return $`${this.bin} ${{ raw: cmd }}`;
  }
}
