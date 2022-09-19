/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { SocioEntity } from './socio.entity';

@Injectable()
export class SocioService {
    constructor(
        @InjectRepository(SocioEntity)
        private readonly socioRepository: Repository<SocioEntity>
    ){}

    async findAll(): Promise<SocioEntity[]> {
        return await this.socioRepository.find({ relations: ["clubes"] });
    }

    async findOne(id: string): Promise<SocioEntity> {
        const socio: SocioEntity = await this.socioRepository.findOne({where: {id}, relations: ["clubes"] } );
        if (!socio)
          throw new BusinessLogicException("No se encontró la socio con el ID dado", BusinessError.NOT_FOUND);
   
        return socio;
    }

    async create(socio: SocioEntity): Promise<SocioEntity> {
        if( !ValidaCorreo(socio.correoElectronico))
            throw new BusinessLogicException("El correo de la socio ingresada no se encuentra dentro de los correoes permitidos", BusinessError.PRECONDITION_FAILED);
        return await this.socioRepository.save(socio);
    }

    async update(id: string, socio: SocioEntity): Promise<SocioEntity> {
        if( !ValidaCorreo(socio.correoElectronico))
            throw new BusinessLogicException("El correo de la socio ingresada no se encuentra dentro de los correoes permitidos", BusinessError.PRECONDITION_FAILED);

        const persistedsocio: SocioEntity = await this.socioRepository.findOne({where:{id}});
        if (!persistedsocio)
          throw new BusinessLogicException("No se encontró la socio con el ID dado", BusinessError.NOT_FOUND);
        
        return await this.socioRepository.save({...persistedsocio, ...socio});
    }

    async delete(id: string) {
        const socio: SocioEntity = await this.socioRepository.findOne({where:{id}});
        if (!socio)
          throw new BusinessLogicException("No se encontró la socio con el ID dado", BusinessError.NOT_FOUND);
      
        await this.socioRepository.remove(socio);
    }


}

function ValidaCorreo(correo: string) {
    return correo;
}

