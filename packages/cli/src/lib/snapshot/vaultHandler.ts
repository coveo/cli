import {
  VaultEntryModel,
  VaultValueType,
  VaultVisibilityType,
} from '@coveord/platform-client';
import {CliUx} from '@oclif/core';
import fsExtra from 'fs-extra';
const {readJsonSync, rmSync, writeJsonSync} = fsExtra;
import open from 'open';
import {join} from 'path';
import {cwd} from 'process';
import chalk from 'chalk';
import {
  InvalidVaultEntryError,
  InvalidVaultFileError,
  MissingVaultEntryValueError,
} from '../errors/vaultErrors.js';
import {AuthenticatedClient} from '../platform/authenticatedClient.js';
import {Snapshot} from './snapshot.js';
import {VaultEntryAttributes} from './snapshotReporter.js';
import {Plurable, pluralizeIfNeeded} from '../utils/string.js';
import {ProcessAbort} from '../../lib/errors/processError.js';
import {dedent} from 'ts-dedent';

export class VaultHandler {
  private static readonly defaultEntryValue = '';

  public constructor(private organizationId: string) {}

  public async createEntries(entries: VaultEntryAttributes[]) {
    await this.prepareAndOpenFile(entries);
    await this.ensureValidityOrAbort(entries);
    const vaultEntryModels = this.getVaultEntryModels(entries);
    rmSync(this.vaultEntryFilePath);
    await this.doCreateVaultEntries(vaultEntryModels);
  }

  private async prepareAndOpenFile(entries: VaultEntryAttributes[]) {
    this.prepareFile(entries);
    await this.openFile();
  }

  private async ensureValidityOrAbort(entries: VaultEntryAttributes[]) {
    let valid = false;
    while (!valid) {
      const key = await CliUx.ux.prompt('', {
        type: 'single',
        required: false,
        prompt: `\n${chalk.inverse('Press any key to continue. Press q to abort')}\n`,
      });
      if (key === 'q') {
        throw new ProcessAbort();
      }
      try {
        this.ensureEntriesValidity(entries);
        valid = true;
      } catch (error) {
        CliUx.ux.log('');
        CliUx.ux.warn(`${error}`);
        await this.openFile(false);
      }
    }
  }

  private async doCreateVaultEntries(vaultEntryModels: VaultEntryModel[]) {
    const client = await this.client();
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
      CliUx.ux.action.stop(chalk.green('✔'));
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

  private prepareFile(entries: VaultEntryAttributes[]) {
    const data: Record<string, unknown> = {};
    for (const {vaultEntryId} of entries) {
      data[vaultEntryId] = VaultHandler.defaultEntryValue;
    }

    writeJsonSync(this.vaultEntryFilePath, data, {spaces: 4});
  }

  private async openFile(print = true) {
    if (print) {
      CliUx.ux.log(dedent`\nOpening file ${this.vaultEntryFilePath}.
      Please fill out all the vault entries from the JSON file.`);
    }
    await open(this.vaultEntryFilePath);
  }

  private ensureEntriesValidity(
    requiredEntries: VaultEntryAttributes[]
  ): void | never {
    const missingEntries: string[] = [];
    let data: Record<string, unknown>;

    try {
      data = readJsonSync(this.vaultEntryFilePath);
    } catch (error) {
      throw new InvalidVaultFileError(error);
    }

    for (const {vaultEntryId} of requiredEntries) {
      if (
        data[vaultEntryId] === undefined ||
        data[vaultEntryId] === VaultHandler.defaultEntryValue
      ) {
        missingEntries.push(vaultEntryId);
      }
    }
    if (missingEntries.length > 0) {
      throw new MissingVaultEntryValueError(missingEntries);
    }
  }

  private getVaultEntryModels(
    entries: VaultEntryAttributes[]
  ): VaultEntryModel[] {
    const data = readJsonSync(this.vaultEntryFilePath);
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

  private get vaultEntryFilePath() {
    return join(cwd(), `${this.organizationId}-vault.json`);
  }
}
