import { 
    Controller, Get, Post, Query, Res, Req, 
    BadRequestException, UseGuards 
} from "@nestjs/common";
import { DiskService } from "./disk.service";
import { FastifyReply, FastifyRequest } from 'fastify'; 
import * as path from 'path';
import * as fs from 'fs';
import { SupabaseAuthGuard } from "@src/supabase/supabase.authGuard";
import "@fastify/multipart";

@UseGuards(SupabaseAuthGuard)
@Controller('disk')
export class DiskController {
    constructor(private readonly diskService: DiskService) {}

    @Get('getDisk')
    async getAvailableDisks() {
        try {
            return await this.diskService.getAvailableDisks();
        } catch(error) {
            throw new Error('Impossible de lire les disques du serveur');
        }
    }

    @Get('getFiles')
    async getFiles(@Query('diskPath') diskPath: string): Promise<any> {
        if(!diskPath){
            throw new Error('Pas de chemin de disque')
        }
        return await this.diskService.getFiles(diskPath);
    }

    @Get('getFileContenu')
    async getFileContenu(
        @Query('diskPath') diskPath: string, 
        @Query('filePath') filePath: string
    ): Promise<any> {
        if(!diskPath || !filePath){
            console.error('Erreur dans le chemin disk et file')
            throw new Error('Erreur dans le chemin disk et file')
        }
        return await this.diskService.getFileContenu(diskPath, filePath);
    }

    @Get('streamFile')
    streamFile(
        @Query('diskPath') diskPath: string, 
        @Query('filePath') filePath: string, 
        @Res() res: FastifyReply 
    ) {
        if (!diskPath || !filePath) throw new Error('Paramètres manquants');
        
        const fullPath = path.join(diskPath, filePath);
        

        const stream = fs.createReadStream(fullPath);
        return res.send(stream);
    }

    @Get('downloadFolderAsZip')
    async downloadFolderAsZip(
        @Query('diskPath') diskPath: string,
        @Query('folderPath') folderPath: string,
        @Res() res: FastifyReply 
    ) {
        if (!diskPath || !folderPath) {
            throw new Error('diskPath and folderPath are required');
        }

        try {
            const fullPath = path.join(diskPath, folderPath);
            const zipBuffer = await this.diskService.downloadFolderAsZip(fullPath);
            const fileName = `${path.basename(folderPath)}.zip`;

            res.headers({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': zipBuffer.length,
            });

            return res.send(zipBuffer);
            
        } catch (error) {
            console.error('Zip Error:', error);
            throw new Error('Erreur lors de la récupération du zip');
        }
    }

@Post('uploadFiles')
async uploadFiles(
    @Query('diskPath') diskPath: string,
    @Query('filePath') filePath: string,
    @Req() req: FastifyRequest
) {
    if (!diskPath || !filePath) {
        throw new BadRequestException('Paramètres manquants');
    }

    const uploadedFiles: { filename: string; mimetype: string; buffer: Buffer }[] = [];

    const parts = req.files();

    for await (const part of parts) {
        const fileBuffer = await part.toBuffer();
        
        uploadedFiles.push({
            filename: part.filename,
            mimetype: part.mimetype,
            buffer: fileBuffer
        });
    }

    if (uploadedFiles.length === 0) {
        throw new BadRequestException('Fichiers/dossiers manquants');
    }

    return this.diskService.saveFiles(diskPath, filePath, uploadedFiles);
}
}