import { Injectable } from '@angular/core';
import { mkConfig, generateCsv, asString } from 'export-to-csv';
import { BehaviorSubject } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class FileService {
    private csvImport = new BehaviorSubject<object[]>([]);
    public readonly csvImport$ = this.csvImport.asObservable();

    private watchFileChange = new BehaviorSubject<string | null>(null);
    public readonly watchFileChange$ = this.watchFileChange.asObservable();

    private watchFileError = new BehaviorSubject<boolean>(false);
    public readonly watchFileError$ = this.watchFileError.asObservable();

    constructor() {
        window.electronAPI.onImportedCsv((token) => {
            this.csvImport.next(token);
        });

        window.electronAPI.onFileWatchChange((data) => {
            this.watchFileChange.next(data);
            this.watchFileError.next(false);
        });

        window.electronAPI.onFileWatchError(() => {
            this.watchFileChange.next(null);
            this.watchFileError.next(true);
        });
    }

    storeToDisk(data: string, filename: string, error: (error: string) => void) {
        if (window.electronAPI) {
            window.electronAPI.writeData(
                data,
                filename
            ).catch((errorMessage) => {
                if (error) {
                    error(errorMessage);
                }
            });
        }
    }

    loadFromDisk(filename: string, callback: (data: string) => void, error: (error: string) => void) {
        if (window.electronAPI) {
            window.electronAPI
                .readData(filename)
                .then((data: string) => {
                    callback(data);
                })
                .catch((errorMessage) => {
                    if (error) {
                        error(errorMessage);
                    };
                });
        }
    }

    getFilesInDirectory(folderPath: string, callback: (data: string[]) => void, error?: (error: string) => void) {
        if (window.electronAPI) {
            window.electronAPI
                .getFilesInDirectory(folderPath)
                .then((data: string[]) => {
                    callback(data);
                })
                .catch((errorMessage) => {
                    if (error) {
                        error(errorMessage);
                    };
                });
        }
    }

    saveFile(filePath: string, file: ArrayBuffer, callback: (fileName: string) => void, error?: (error: string) => void) {
        if (window.electronAPI) {
            window.electronAPI
                .saveFile(filePath, file)
                .then((fileName) => {
                    callback(fileName);
                })
                .catch((errorMessage) => {
                    if (error) {
                        error(errorMessage);
                    };
                });
        }
    }

    importCsv(file: ArrayBuffer, headers: string[], callback: () => void, error?: (error: string) => void) {
        if (window.electronAPI) {
            window.electronAPI
                .importCsv(file, headers)
                .then(() => {
                    callback();
                })
                .catch((errorMessage) => {
                    if (error) {
                        error(errorMessage);
                    };
                });
        }
    }

    exportCsv(objectArr: any[], headers: { property: string, header: string }[], callback: () => void, error?: (error: string) => void) {
        const csv = this.convertToCSV(objectArr, headers);
        if (window.electronAPI) {
            window.electronAPI
                .exportCsv(csv)
                .then(() => {
                    callback();
                })
                .catch((errorMessage) => {
                    if (error) {
                        error(errorMessage);
                    };
                });
        }
    }

    watchFile(filepath: string | null, file: File | null, callback: (path: string) => void, error?: (error: string) => void) {
        if (window.electronAPI) {
            window.electronAPI.watchFile(filepath, file)
                .then((path) => {
                    callback(path);
                })
                .catch((errorMessage) => {
                    if (error) {
                        error(errorMessage);
                    };
                });
        }
    }

    unwatchFile(callback: () => void, error?: (error: string) => void) {
        if (window.electronAPI) {
            window.electronAPI
                .unwatchFile()
                .then(() => {
                    callback();
                })
                .catch((errorMessage) => {
                    if (error) {
                        error(errorMessage);
                    };
                });
        }
    }

    openWheelTemplate(error?: (error: string) => void) {
        if (window.electronAPI) {
            window.electronAPI
                .openWheelTemplate()
                .catch((errorMessage) => {
                    if (error) {
                        error(errorMessage);
                    };
                });
        }
    }

    openImportCsvTemplate(error?: (error: string) => void) {
        if (window.electronAPI) {
            window.electronAPI
                .openImportCsvTemplate()
                .catch((errorMessage) => {
                    if (error) {
                        error(errorMessage);
                    };
                });
        }
    }

    private convertToCSV(data: any[], headerMapping: { property: string, header: string }[]) {
        const headers = headerMapping.map(h => h.property);
        const rows = data.map(row =>
            headerMapping.map(h => {
                const value = row[h.property] || '';
                return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` :
                    Array.isArray(value) ? `"${value.map(v => v.replace(/"/g, '""')).join(', ')}"` :
                    value.toString();
            }).join(",")
        );
        return [headerMapping.map(h => h.header), ...rows].join("\n");
    }
}