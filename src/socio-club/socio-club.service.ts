/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocioEntity } from '../socio/socio.entity';
import { Repository } from 'typeorm';
import { ClubEntity } from '../club/club.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class SocioClubService {
    constructor(
        @InjectRepository(SocioEntity)
        private readonly socioRepository: Repository<SocioEntity>,
    
        @InjectRepository(ClubEntity)
        private readonly clubRepository: Repository<ClubEntity>
    ) {}

    async addMemberToClub(socioId: string, clubId: string): Promise<SocioEntity>
    {
        const club: ClubEntity = await this.clubRepository.findOne({where: {id: clubId}});
        if (!club)
          throw new BusinessLogicException("No se encontró el club con el Id dado", BusinessError.NOT_FOUND);
      
        const socio: SocioEntity = await this.socioRepository.findOne({where: {id: socioId}, relations: ["clubes"]})
        if (!socio)
          throw new BusinessLogicException("no se encontró la socio con el Id dado", BusinessError.NOT_FOUND);
    
        socio.clubes = [...socio.clubes, club];
        return await this.socioRepository.save(socio);
    }

    async findMembersFromClub(socioId: string): Promise<ClubEntity[]> {
        const socio: SocioEntity = await this.socioRepository.findOne({where: {id: socioId}, relations: ["clubes"]});
        if (!socio)
          throw new BusinessLogicException("No se encontró la socio con el Id dado", BusinessError.NOT_FOUND)
       
        return socio.clubes;
    }

    async findMemberFromClub(socioId: string, clubId: string): Promise<ClubEntity> {
        const club: ClubEntity = await this.clubRepository.findOne({where: {id: clubId}});
        if (!club)
          throw new BusinessLogicException("No se encontró el club con el Id dado", BusinessError.NOT_FOUND)
       
        const socio: SocioEntity = await this.socioRepository.findOne({where: {id: socioId}, relations: ["clubes"]});
        if (!socio)
          throw new BusinessLogicException("No se encontró la socio con el Id dado", BusinessError.NOT_FOUND)
   
        const socio_club: ClubEntity = socio.clubes.find(s => s.id === club.id);
   
        if (!socio_club)
          throw new BusinessLogicException("El club no se encuentra asociado a la socio", BusinessError.PRECONDITION_FAILED)
   
        return socio_club;
    }

    async updateMembersFromClub(socioId: string, clubes: ClubEntity[]): Promise<SocioEntity> {
        const socio: SocioEntity = await this.socioRepository.findOne({where: {id: socioId}, relations: ["clubes"]});
    
        if (!socio)
          throw new BusinessLogicException("No se encontró la socio con el Id dado", BusinessError.NOT_FOUND)
    
        for (let i = 0; i < clubes.length; i++) {
          const club: ClubEntity = await this.clubRepository.findOne({where: {id: clubes[i].id}});
          if (!club)
            throw new BusinessLogicException("No se encontró el club con el Id dado", BusinessError.NOT_FOUND)
        }
    
        socio.clubes = clubes;
        return await this.socioRepository.save(socio);
      }

      async deleteMemberFromClub(socioId: string, clubId: string){
        const club: ClubEntity = await this.clubRepository.findOne({where: {id: clubId}});
        if (!club)
          throw new BusinessLogicException("No se encontró el club con el Id dado", BusinessError.NOT_FOUND)
    
        const socio: SocioEntity = await this.socioRepository.findOne({where: {id: socioId}, relations: ["clubes"]});
        if (!socio)
          throw new BusinessLogicException("No se encontró la socio con el Id dado", BusinessError.NOT_FOUND)
    
        const socioclub: ClubEntity = socio.clubes.find(s => s.id === club.id);
    
        if (!socioclub)
            throw new BusinessLogicException("El club no se encuentra asociado a la socio", BusinessError.PRECONDITION_FAILED)
 
        socio.clubes = socio.clubes.filter(s => s.id !== clubId);
        await this.socioRepository.save(socio);
    }  
}
