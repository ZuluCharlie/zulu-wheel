import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Blob } from 'buffer';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

export type SettingsValue = null | boolean | string | number | SettingsObject | SettingsValue[];
export type SettingsObject = {
  [key: string]: SettingsValue;
};

export type ElectronAPI = {
  writeData: (data: string, fileName: string) => Promise<void>,
  readData: (fileName: string) => Promise<string>,
  writeSetting: (setting: string, data: SettingsValue) => Promise<void>,
  readSetting: (fileName: string) => Promise<SettingsValue>,
  getFilesInDirectory: (fileName: string) => Promise<string[]>,
  saveFile: (fileName: string, file: ArrayBuffer) => Promise<string>,
  downloadFile: (url: string, filePath: string) => Promise<string>,
  twitchAuth: (forceVerify: boolean) => Promise<string>,
  twitchAuthDeviceCode: (deviceCode: string) => Promise<string>,
  getTwitchAccessToken: () => Promise<string>,
  reload: (url: string) => Promise<void>,
  importCsv: (file: ArrayBuffer, headers: string[]) => Promise<void>,
  exportCsv: (csv: string) => Promise<void>,
  watchFile: (path: string | null, file: File | null) => Promise<string>,
  unwatchFile: () => Promise<void>,
  openWheelTemplate: () => Promise<void>,
  openImportCsvTemplate: () => Promise<void>,
  onTokenCollected(cb: ((customData: string) => void)): void,
  onImportedCsv(cb: ((customData: object[]) => void)): void,
  onFileWatchChange(cb: ((customData: string) => void)): void,
  onFileWatchError(cb: (() => void)): void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}