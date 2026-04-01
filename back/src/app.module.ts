import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiskModule } from './diskManagement/disk.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule.forRoot(), DiskModule, SupabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
