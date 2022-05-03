import {
  VaultEntryModel,
  VaultValueType,
  VaultVisibilityType,
} from '@coveord/platform-client';
import {CliUx} from '@oclif/core';
import {readJsonSync, rmSync, writeJsonSync} from 'fs-extra';
import open from 'open';
import {join} from 'path';
import {cwd} from 'process';
import {green, bgWhite} from 'chalk';
import {
  InvalidVaultEntryError,
  InvalidVaultFileError,
  MissingVaultEntryValueError,
} from '../errors/vaultErrors';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {Snapshot} from './snapshot';
import {VaultEntryAttributes} from './snapshotReporter';
import {Plurable, pluralizeIfNeeded} from '../utils/string';
import dedent from 'ts-dedent';

export class Vault {
  private static defaultEntryValue = '';

  public constructor(private organizationId: string) {}

  public async createEntries(entries: VaultEntryAttributes[]) {
    const client = await this.client();
    const vaultEntryFilePath = join(cwd(), `${this.organizationId}-vault.json`);
    let valid = false;

    this.prepareFile(vaultEntryFilePath, entries);
    await this.openFile(vaultEntryFilePath);

    while (!valid) {
      const key = await CliUx.ux.prompt('', {
        type: 'single',
        required: false,
        prompt: `\n${bgWhite('Press any key to continue. Press q to abort')}\n`,
      });
      if (key === 'q') {
        return;
      }
      try {
        this.ensureEntriesValidity(vaultEntryFilePath, entries);
        valid = true;
      } catch (error) {
        CliUx.ux.log('');
        CliUx.ux.warn(`${error}`);
        await this.openFile(vaultEntryFilePath, false);
      }
    }
    const vaultEntryModels = this.formatVaultEntries(
      vaultEntryFilePath,
      entries
    );
    rmSync(vaultEntryFilePath);

    if (vaultEntryModels.length > 0) {
      const entryPlurable: Plurable = ['entry', 'entries'];
      CliUx.ux.action.start(
        `Creating vault ${pluralizeIfNeeded(
          entryPlurable,
          vaultEntryModels.length
        )}`
      );
      await Promise.all(
        vaultEntryModels.map((entry) => client.vault.create(entry))
      );
      CliUx.ux.action.stop(green('✔'));
    }
  }

  public async transferable(
    entries: VaultEntryAttributes[],
    sourceOrganizationId: string
  ): Promise<boolean> {
    // TODO: get vault entries from source org
    // TODO: return true if the missing entries are present in source org. Return false otherwise
    throw 'TODO: CDX-935';
  }

  public async transfer(snapshot: Snapshot, sourceOrganizationId: string) {
    throw 'TODO: CDX-935';
  }

  private prepareFile(
    vaultEntryFilePath: string,
    entries: VaultEntryAttributes[]
  ) {
    const data: Record<string, unknown> = {};
    for (const {vaultEntryId} of entries) {
      data[vaultEntryId] = Vault.defaultEntryValue;
    }

    writeJsonSync(vaultEntryFilePath, data, {spaces: 4});
  }

  private async openFile(vaultEntryFilePath: string, print = true) {
    if (print) {
      CliUx.ux.log(dedent`\nOpening file ${vaultEntryFilePath}.
      Please fill out all the vault entries from the JSON file.`);
    }
    await open(vaultEntryFilePath);
  }

  private ensureEntriesValidity(
    vaultEntryFilePath: string,
    requiredEntries: VaultEntryAttributes[]
  ): void | never {
    const missingEntries: string[] = [];
    let data: Record<string, unknown>;

    try {
      data = readJsonSync(vaultEntryFilePath);
    } catch (error) {
      throw new InvalidVaultFileError(error);
    }

    for (const {vaultEntryId} of requiredEntries) {
      if (
        data[vaultEntryId] === undefined ||
        data[vaultEntryId] === Vault.defaultEntryValue
      ) {
        missingEntries.push(vaultEntryId);
      }
    }
    if (missingEntries.length > 0) {
      throw new MissingVaultEntryValueError(missingEntries);
    }
  }

  private formatVaultEntries(
    vaultEntryFilePath: string,
    entries: VaultEntryAttributes[]
  ): VaultEntryModel[] {
    const data = readJsonSync(vaultEntryFilePath);
    const models: VaultEntryModel[] = [];
    for (const {resourceName, resourceType, vaultEntryId} of entries) {
      const jsonPath = this.getVaultEntryJsonPath(vaultEntryId, resourceName);
      models.push({
        key: vaultEntryId,
        attributeReferences: [
          {
            jsonPath,
            resourceName,
            resourceType,
          },
        ],
        organizationId: this.organizationId,
        value: data[vaultEntryId],
        valueType: VaultValueType.STRING,
        vaultVisibilityType: VaultVisibilityType.STRICT,
      });
    }
    return models;
  }

  private getVaultEntryJsonPath(key: string, resourceName: string) {
    // TODO: CDX-939: Define contract with backend for report and upcoming contract.
    // The report should give the vault entry JSONpath in the same format we need to send it
    const regex = `${resourceName}-(?<jsonPath>.*)`;
    const match = key.match(regex);
    const jsonPath = match?.groups?.['jsonPath'];
    if (!jsonPath) {
      throw new InvalidVaultEntryError(this.organizationId, key);
    }
    return jsonPath;
  }

  private async client(organization = this.organizationId) {
    return await new AuthenticatedClient().getClient({organization});
  }
}
