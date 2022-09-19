/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';

@Injectable()
export class ClubService {
    constructor(
        @InjectRepository(ClubEntity)
        private readonly clubRepository: Repository<ClubEntity>
    ){}

    async findAll(): Promise<ClubEntity[]> {
        return await this.clubRepository.find({ relations: ["socios"] });
    }

    async findOne(id: string): Promise<ClubEntity> {
        const club: ClubEntity = await this.clubRepository.findOne({where: {id}, relations: ["socios"] } );
        if (!club)
          throw new BusinessLogicException("No se encontró el club con el ID dado", BusinessError.NOT_FOUND);
   
        return club;
    }

    async create(club: ClubEntity): Promise<ClubEntity> {
        if( !ValidaSupermercado(club.nombre))
            throw new BusinessLogicException("El nombre del club debe tener mas de 10 caracteres", BusinessError.PRECONDITION_FAILED);
        return await this.clubRepository.save(club);
    }

    async update(id: string, club: ClubEntity): Promise<ClubEntity> {
        if( !ValidaSupermercado(club.nombre))
            throw new BusinessLogicException("El nombre del club debe tener mas de 10 caracteres", BusinessError.PRECONDITION_FAILED);

        const persistedClub: ClubEntity = await this.clubRepository.findOne({where:{id}});
        if (!persistedClub)
          throw new BusinessLogicException("No se encontró el club con el ID dado", BusinessError.NOT_FOUND);
        
        return await this.clubRepository.save({...persistedClub, ...club});
    }

    async delete(id: string) {
        const club: ClubEntity = await this.clubRepository.findOne({where:{id}});
        if (!club)
          throw new BusinessLogicException("No se encontró el club con el ID dado", BusinessError.NOT_FOUND);
      
        await this.clubRepository.remove(club);
    }
}

function ValidaSupermercado(nombre: string) {   
    return nombre.length > 10;
}
