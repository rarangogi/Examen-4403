/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubEntity } from './club.entity';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClubEntity])],
  providers: [ClubService],
  controllers: [ClubController]
})
export class ClubModule {}
