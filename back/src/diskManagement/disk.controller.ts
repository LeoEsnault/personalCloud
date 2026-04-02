import { 
    Controller, Get, Post, Query, Res, Body, 
    UseInterceptors, UploadedFiles, BadRequestException, UseGuards 
} from "@nestjs/common";
import { FilesInterceptor } from '@nestjs/platform-express'; // Note le 's'
import { DiskService } from "./disk.service";
import { Response } from 'express';
import * as path from 'path';
import { Multer } from 'multer';
import { SupabaseAuthGuard } from "src/supabase/supabase.authGuard";


@UseGuards(SupabaseAuthGuard)
@Controller('disk')
export class DiskController {
    constructor(private readonly diskService: DiskService) {}
    @Get('getDisk')
    async getAvailableDisks() {

        try{

        const disks = await this.diskService.getAvailableDisks();

        return disks;

        }catch(error){
            throw Error('Impossible de lire les disques du serveur');
        }
        
    }
    @Get('getFiles')
    async getFiles(@Query('diskPath') diskPath: string): Promise<any>{

        if(!diskPath){
            throw new Error('Pas de chemin de disque')
        }
        const response = await this.diskService.getFiles(diskPath);

        return response
    }

    @Get('getFileContenu')
    async getFileContenu(@Query('diskPath') diskPath: string, @Query('filePath') filePath: string): Promise<any>{
        
        if(!diskPath || !filePath){
            console.error('Erreur dans le chemin disk et file')
            throw new Error('Erreur dans le chemin disk et file')
        }

        const response = await this.diskService.getFileContenu(diskPath, filePath)

        return response
    }
    @Get('streamFile')
        streamFile(
            @Query('diskPath') diskPath: string, 
            @Query('filePath') filePath: string, 
            @Res() res: Response) {
    if (!diskPath || !filePath) throw new Error('Paramètres manquants');
    
    const fullPath = path.join(diskPath, filePath);
    return res.sendFile(fullPath);
}

@Get('downloadFolderAsZip')
async downloadFolderAsZip(
    @Query('diskPath') diskPath: string,
    @Query('folderPath') folderPath: string,
    @Res() res: Response 
) {
    if (!diskPath || !folderPath) {
        throw new Error('diskPath and folderPath are required');
    }

    try {
        const fullPath = path.join(diskPath, folderPath);
        
        // On récupère le buffer (ou le stream) depuis le service
        const zipBuffer = await this.diskService.downloadFolderAsZip(fullPath);

        const fileName = `${path.basename(folderPath)}.zip`;

        // On configure les headers pour forcer le téléchargement côté navigateur
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': zipBuffer.length,
        });

        // On envoie le contenu binaire
        return res.end(zipBuffer);
        
    } catch (error) {
        console.error('Zip Error:', error);
        // Utilise les exceptions intégrées de Nest pour des messages d'erreur propres
        throw new Error('Erreur lors de la récupération du zip');
    }
}

@Post('uploadFiles')
@UseInterceptors(FilesInterceptor('files', Infinity)) 
async uploadFiles(
  @Query('diskPath') diskPath: string,
  @Query('filePath') filePath: string,
  @UploadedFiles() files: Express.Multer.File[]
) {
  if (!diskPath || !filePath || !files?.length) {
    throw new BadRequestException('Paramètres ou fichiers/dossiers manquants');
  }

  return this.diskService.saveFiles(diskPath, filePath, files);
}

}