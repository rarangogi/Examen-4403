/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SocioService } from './socio.service';
import { Repository } from 'typeorm';
import { SocioEntity } from './socio.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

describe('SocioService', () => {
  let service: SocioService;
  let repository: Repository<SocioEntity>;
  let socioList: SocioEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioService],
    }).compile();

    service = module.get<SocioService>(SocioService);
    repository = module.get<Repository<SocioEntity>>(getRepositoryToken(SocioEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    socioList = [];
    for(let i = 0; i < 5; i++){
        const socio: SocioEntity = await repository.save(
          {
            nombreUsuario: faker.address.cityName(),
            correoElectronico: faker.address.country(),
            fechaNacimiento: faker.address.country()
          }
        );        
        socioList.push(socio);
    }
  }

  it('findAll debería devolver todas las socioes', async () => {
    const socios: SocioEntity[] = await service.findAll();
    expect(socios).not.toBeNull();
    expect(socios).toHaveLength(socioList.length);
  });

  it('findOne debería retornar una socio por id', async () => {
    const storedSocio: SocioEntity = socioList[0];
    const socio: SocioEntity = await service.findOne(storedSocio.id);
    expect(socio).not.toBeNull();
    expect(socio.nombreUsuario).toEqual(storedSocio.nombreUsuario)
    expect(socio.correoElectronico).toEqual(storedSocio.correoElectronico)
    expect(socio.fechaNacimiento).toEqual(storedSocio.fechaNacimiento)
  });

  it('findOne debería lanzar una excepción para una socio inválida', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "No se encontró la socio con el ID dado")
  });


  it('create debería retornar una nueva socio con un correo permitido', async () => {
    const socio: SocioEntity = {
      id: "",
      nombreUsuario: faker.address.cityName(),
      correoElectronico: "Argentina",
      fechaNacimiento: faker.address.country(),
      clubes: []
    }
 
    const nuevoSocio: SocioEntity = await service.create(socio);
    expect(nuevoSocio).not.toBeNull();
 
    const storedSocio: SocioEntity = await repository.findOne({where: {id: nuevoSocio.id}})
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombreUsuario).toEqual(nuevoSocio.nombreUsuario)
    expect(storedSocio.correoElectronico).toEqual(nuevoSocio.correoElectronico)
    expect(storedSocio.fechaNacimiento).toEqual(nuevoSocio.fechaNacimiento)
  });  

  it('create debería lanzar una excepción por crear una nueva socio con un  correo no permitido', async () => {
    const socio: SocioEntity = {
      id: "",
      nombreUsuario: faker.address.cityName(),
      correoElectronico: "Argentina",
      fechaNacimiento: faker.address.country(),
      clubes: []
    }

    await expect(() => service.create(socio)).rejects.toHaveProperty("message", "El pais de la socio ingresada no se encuentra dentro de los paises permitidos")
  });  

  
  it('update debería modificar una socio con datos de un correo permitido', async () => {
    const socio: SocioEntity = socioList[0];
    socio.nombreUsuario = faker.address.cityName();
    socio.correoElectronico = "Paraguay";
    socio.fechaNacimiento = faker.address.country();
    const updatedSocio: SocioEntity = await service.update(socio.id, socio);
    expect(updatedSocio).not.toBeNull();
     const storedSocio: SocioEntity = await repository.findOne({ where: { id: socio.id } })
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombreUsuario).toEqual(socio.nombreUsuario)
    expect(storedSocio.correoElectronico).toEqual(socio.correoElectronico)
    expect(storedSocio.fechaNacimiento).toEqual(socio.fechaNacimiento)
  });


  it('update debería lanzar una excepción por modificar una socio con datos no permitido', async () => {
    const socio: SocioEntity = socioList[0];
    socio.nombreUsuario = faker.address.cityName();
    socio.correoElectronico = faker.address.country();
    socio.fechaNacimiento = faker.address.country();
    await expect(() => service.update(socio.id, socio)).rejects.toHaveProperty("message", "El pais de la socio ingresada no se encuentra dentro de los paises permitidos")
  });

  it('update debería lanzar una excepción por actualizar una socio que no existe', async () => {
    let socio: SocioEntity = socioList[0];
    socio = {
      ...socio, nombreUsuario: faker.address.cityName(), correoElectronico: "Argentina", fechaNacimiento: faker.address.country()
    }
    await expect(() => service.update("0", socio)).rejects.toHaveProperty("message", "No se encontró la socio con el ID dado")
  });

  it('delete deberia eliminar una socio', async () => {
    const socio: SocioEntity = socioList[0];
    await service.delete(socio.id);
    const deletedSocio: SocioEntity = await repository.findOne({ where: { id: socio.id } })
    expect(deletedSocio).toBeNull();
  });

  it('delete debería lanzar una excepción por eliminar una socio que no existe', async () => {
    const socio: SocioEntity = socioList[0];
    await service.delete(socio.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "No se encontró la socio con el ID dado")
  });

});
