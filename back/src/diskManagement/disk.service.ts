import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getDiskInfo } from 'node-disk-info';
import { join, normalize } from 'path';
import * as fs from 'fs';
import * as AdmZip from 'adm-zip';
import * as path from 'path';

@Injectable()
export class DiskService {
  
  async getAvailableDisks() {
    try {
      const disks = await getDiskInfo(); 
      return disks;
    } catch (error) {
      throw new InternalServerErrorException('Impossible de lire les disques du serveur');
    }
  }

  async getFiles(diskPath: string) {
    try {
      const files = await fs.promises.readdir(diskPath);
      return files;
    } catch (error) {
      throw new InternalServerErrorException('Impossible de lire les fichiers du disque');
    }
  }
  
  async getFileContenu(diskPath: string, filePath: string){
     const fileDirection = join(diskPath, filePath);
     try {
      const files = await fs.promises.readdir(fileDirection);
      return files;
    } catch (error) {
      throw new InternalServerErrorException('Impossible de lire les fichiers du disque');
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

  async saveFiles(diskPath: string, filePath: string, files: Express.Multer.File[]) {
    const fullPath = path.join(diskPath, filePath);

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    // Sauvegarder chaque fichier
    const savedFiles = files.map((file) => {
      const fileFullPath = path.join(fullPath, file.originalname);
      fs.writeFileSync(fileFullPath, file.buffer);
      return {
        originalname: file.originalname,
        path: fileFullPath,
      };
    });

    return savedFiles;
  }
}
