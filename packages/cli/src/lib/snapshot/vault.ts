import PlatformClient, {
  VaultEntryModel,
  VaultValueType,
  VaultVisibilityType,
} from '@coveord/platform-client';
import {CliUx} from '@oclif/core';
import {readJsonSync, rmSync, writeJsonSync} from 'fs-extra';
import open from 'open';
import {join} from 'path';
import {cwd} from 'process';
import {InvalidVaultEntry} from '../errors/vaultErrors';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {VaultEntryAttributes} from './snapshotReporter';

export class Vault {
  public constructor(
    private organizationId: string,
    private client: PlatformClient
  ) {}

  public async getFormattedVaultEntries(
    missingEntries: IterableIterator<VaultEntryAttributes>
  ) {
    const vaultEntryFilePath = join(cwd(), `${this.organizationId}-vault.json`);
    let valid = false;

    while (!valid) {
      await this.waitForUserInput(vaultEntryFilePath, missingEntries);
      const key = await CliUx.ux.prompt(
        'Press anykey once finished. Press q to abort',
        {type: 'single'}
      );
      if (key === 'q') {
        return null;
      }
      valid = this.areEntriesValid(vaultEntryFilePath, missingEntries);
    }
    const vaultEntryModels = this.formatVaultEntries(
      vaultEntryFilePath,
      missingEntries
    );
    rmSync(vaultEntryFilePath);
    return vaultEntryModels;
  }

  public async createVaultEntries(entries: VaultEntryModel[]) {
    return Promise.all(entries.map((entry) => this.client.vault.create(entry)));
  }

  private async waitForUserInput(
    vaultEntryFilePath: string,
    missingEntries: IterableIterator<VaultEntryAttributes>
  ) {
    const data: Record<string, unknown> = {};
    for (const {vaultEntryId} of missingEntries) {
      data[vaultEntryId] = '';
    }

    writeJsonSync(vaultEntryFilePath, data);
    await open(vaultEntryFilePath);
  }

  private areEntriesValid(
    vaultEntryFilePath: string,
    missingEntries: IterableIterator<VaultEntryAttributes>
  ): boolean {
    try {
      const data: Record<string, unknown> = readJsonSync(vaultEntryFilePath);
      for (const {vaultEntryId} of missingEntries) {
        if (data[vaultEntryId] === undefined) {
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  private formatVaultEntries(
    vaultEntryFilePath: string,
    entries: IterableIterator<VaultEntryAttributes>
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
      throw new InvalidVaultEntry(this.organizationId, key);
    }
    return jsonPath;
  }

  private async getClient() {
    return await new AuthenticatedClient().getClient({
      organization: this.organizationId,
    });
  }
}
