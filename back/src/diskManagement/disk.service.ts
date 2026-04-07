import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getDiskInfo } from 'node-disk-info';
import { join } from 'path';
import * as fs from 'fs';
import * as AdmZip from 'adm-zip';
import * as path from 'path';

export interface FastifyFile {
  filename: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class DiskService {
  
  async getAvailableDisks() {
    try {
      return await getDiskInfo(); 
    } catch (error) {
      throw new InternalServerErrorException('Impossible de lire les disques du serveur');
    }
  }

  async getFiles(diskPath: string) {
    try {
      return await fs.promises.readdir(diskPath);
    } catch (error) {
      throw new InternalServerErrorException('Impossible de lire les fichiers du disque');
    }
  }
  
  async getFileContenu(diskPath: string, filePath: string){
     const fileDirection = join(diskPath, filePath);
     try {
      return await fs.promises.readdir(fileDirection);
    } catch (error) {
      throw new InternalServerErrorException('Impossible de lire les fichiers du dossier');
    }
  }

  async downloadFolderAsZip(fullPath: string): Promise<Buffer> {
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Le chemin n'existe pas : ${fullPath}`);
    }

    const zip = new AdmZip();
    zip.addLocalFolder(fullPath); 
    
    return zip.toBuffer();
  }

  async saveFiles(diskPath: string, filePath: string, files: FastifyFile[]) {
    const fullPath = path.join(diskPath, filePath);

    if (!fs.existsSync(fullPath)) {
      await fs.promises.mkdir(fullPath, { recursive: true });
    }

    const savedFiles = await Promise.all(
      files.map(async (file) => {
      
        const fileFullPath = path.join(fullPath, file.filename);
        
   
        await fs.promises.writeFile(fileFullPath, file.buffer);
        
        return {
          originalname: file.filename, 
          path: fileFullPath,
        };
      })
    );

    return savedFiles;
  }
}