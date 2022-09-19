/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ClubService } from './club.service';
import { ClubEntity } from './club.entity';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';


describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let clubList: ClubEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    clubList = [];
    for(let i = 0; i < 5; i++){
        const club: ClubEntity = await repository.save(
          {
            nombre: faker.company.name(),
            fechaFundacion: faker.address.longitude(),
            imagen: faker.address.latitude(),
            descripcion: faker.internet.url()
          }
        );        
        clubList.push(club);
    }
  }

  it('findAll debería devolver todas los clubs', async () => {
    const clubs: ClubEntity[] = await service.findAll();
    expect(clubs).not.toBeNull();
    expect(clubs).toHaveLength(clubList.length);
  });

  it('findOne debería retornar un club por id', async () => {
    const storedclub: ClubEntity = clubList[0];
    const club: ClubEntity = await service.findOne(storedclub.id);
    expect(club).not.toBeNull();
    expect(club.nombre).toEqual(storedclub.nombre)
    expect(club.fechaFundacion).toEqual(storedclub.fechaFundacion)
    expect(club.imagen).toEqual(storedclub.imagen)
    expect(club.descripcion).toEqual(storedclub.descripcion)
  });

  it('findOne debería lanzar una excepción para una club inválido', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "No se encontró el club con el ID dado")
  });


  it('create debería retornar un nuevo club con nombre válido', async () => {
    const club: ClubEntity = {
      id: "",
      nombre: "club Nuevo",
      fechaFundacion: faker.address.longitude(),
      imagen: faker.address.latitude(),
      descripcion: faker.internet.url(),
      socios: []
    }
 
    const nuevoclub: ClubEntity = await service.create(club);
    expect(nuevoclub).not.toBeNull();
 
    const storedclub: ClubEntity = await repository.findOne({where: {id: nuevoclub.id}})
    expect(storedclub).not.toBeNull();
    expect(storedclub.nombre).toEqual(nuevoclub.nombre)
    expect(storedclub.fechaFundacion).toEqual(nuevoclub.fechaFundacion)
    expect(storedclub.imagen).toEqual(nuevoclub.imagen)
    expect(storedclub.descripcion).toEqual(nuevoclub.descripcion)
  });  

  it('create debería lanzar una excepción por crear un nuevo club con nombre no válido', async () => {
    const club: ClubEntity = {
      id: "",
      nombre: "Nuevo",
      fechaFundacion: faker.address.longitude(),
      imagen: faker.address.latitude(),
      descripcion: faker.internet.url(),
      socios: []
    } 
    await expect(() => service.create(club)).rejects.toHaveProperty("message", "El nombre del club debe tener mas de 10 caracteres")
  });  

  
  it('update debería modificar un club con nombre válido', async () => {
    const club: ClubEntity = clubList[0];
    club.nombre = "Nuevo Nombre club";
    club.fechaFundacion = faker.address.longitude();
    club.imagen = faker.address.latitude();
    club.descripcion = faker.internet.url();
    const updatedclub: ClubEntity = await service.update(club.id, club);
    expect(updatedclub).not.toBeNull();
    const storedclub: ClubEntity = await repository.findOne({ where: { id: club.id } })
    expect(storedclub).not.toBeNull();
    expect(storedclub.nombre).toEqual(club.nombre)
    expect(storedclub.fechaFundacion).toEqual(club.fechaFundacion)
    expect(storedclub.imagen).toEqual(club.imagen)
    expect(storedclub.descripcion).toEqual(club.descripcion)
  });


  it('update debería lanzar una excepción por modificar un club con nombre no válido', async () => {
    const club: ClubEntity = clubList[0];
    club.nombre = "Nuevo";
    club.fechaFundacion = faker.address.longitude();
    club.imagen = faker.address.latitude();
    club.descripcion = faker.internet.url();
    await expect(() => service.update(club.id, club)).rejects.toHaveProperty("message", "El nombre del club debe tener mas de 10 caracteres")
  });

  it('update debería lanzar una excepción por actualizar un club que no existe', async () => {
    let club: ClubEntity = clubList[0];
    club = {
      ...club, nombre: "Nuevo Nombre club", fechaFundacion: faker.address.longitude(), imagen: faker.address.latitude(), descripcion: faker.internet.url()
    }
    await expect(() => service.update("0", club)).rejects.toHaveProperty("message", "No se encontró el club con el ID dado")
  });

  it('delete deberia eliminar una club', async () => {
    const club: ClubEntity = clubList[0];
    await service.delete(club.id);
    const deletedclub: ClubEntity = await repository.findOne({ where: { id: club.id } })
    expect(deletedclub).toBeNull();
  });

  it('delete debería lanzar una excepción por eliminar un club que no existe', async () => {
    const club: ClubEntity = clubList[0];
    await service.delete(club.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "No se encontró el club con el ID dado")
  });

  
});
