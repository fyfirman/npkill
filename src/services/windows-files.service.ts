import * as getSize from 'get-folder-size';
import * as PATH from 'path';
import * as fs from 'fs';

import { Observable, of } from 'rxjs';

import { IFileService } from '../interfaces/file.interface';
import { StreamService } from './stream.service';
import { spawn } from 'child_process';

export class WindowsFilesService implements IFileService {
  public constructor(private streamService: StreamService) {}

  public getFolderSize(path: string): Observable<any> {
    return Observable.create(observer => {
      getSize(path, (err, size) => {
        if (err) {
          throw err;
        }
        observer.next(this.convertBToMb(size));
        observer.complete();
      });
    });
  }

  public listDir(path: string): Observable<{}> {
    const binPath = PATH.normalize(`${__dirname}/../bin/windows-find`);
    const child = spawn(binPath, [path]);
    return this.streamService.getStream(child);
  }

  public deleteDir(path: string) {
    const files = this.getDirectoryFiles(path);

    this.removeDirectoryFiles(path, files);

    fs.rmdirSync(path);
  }

  private convertBToMb(bytes: number): number {
    const factorBtoMb = 1048576;
    return bytes / factorBtoMb;
  }

  private getDirectoryFiles(dir: string) {
    return fs.readdirSync(dir);
  }

  private removeDirectoryFiles(dir: string, files: string[]): void {
    files.map(file => {
      const path = dir + file;
      if (fs.statSync(path).isDirectory()) {
        this.deleteDir(path);
      } else {
        fs.unlinkSync(path);
      }
    });
  }
}
