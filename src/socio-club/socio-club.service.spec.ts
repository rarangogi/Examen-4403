/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { SocioClubService } from './socio-club.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';


describe('SocioClubService', () => {
  let service: SocioClubService;
  let socioRepository: Repository<SocioEntity>;
  let clubRepository: Repository<ClubEntity>;
  let socio: SocioEntity;
  let clubList : ClubEntity[];
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioClubService],
    }).compile();

    service = module.get<SocioClubService>(SocioClubService);
    clubRepository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));
    socioRepository = module.get<Repository<SocioEntity>>(getRepositoryToken(SocioEntity));
    
    await seedDatabase();
  });

  const seedDatabase = async () => {
    clubRepository.clear();
    socioRepository.clear();
 
    clubList = [];
    for(let i = 0; i < 5; i++){
        const club: ClubEntity = await clubRepository.save({
          nombre: "Nombre club " + i,
          fechafundacion: faker.address.longitude(),
          imagen: faker.address.latitude(),
          descripcion: faker.internet.url()
        })
        clubList.push(club);
    }
 
    socio = await socioRepository.save({
      nombreUsuario: faker.address.cityName(),
      correoElectronico: "Argentina",
      fechaNacimiento: faker.address.cityName(),
      clubes: clubList
    })
  }


  it(' addMemberToClub deberia agregar un club a una socio', async () => {
    const nuevoclub: ClubEntity = await clubRepository.save({
      nombre: "Otro club",
      fechafundacion: faker.address.longitude(),
      imagen: faker.address.latitude(),
      descripcion: faker.internet.url()

    });

    const nuevasocio: SocioEntity = await socioRepository.save({
      nombreUsuario: faker.address.cityName(),
      correoElectronico: "Argentina",
      fechaNacimiento: faker.address.cityName(),

    })
 
    const result: SocioEntity = await service.addMemberToClub(nuevasocio.id, nuevoclub.id);
   
    expect(result.clubes.length).toBe(1);
    expect(result.clubes[0]).not.toBeNull();
    expect(result.clubes[0].nombre).toBe(nuevoclub.nombre)
    expect(result.clubes[0].fechaFundacion).toBe(nuevoclub.fechaFundacion)
    expect(result.clubes[0].imagen).toBe(nuevoclub.imagen)
    expect(result.clubes[0].descripcion).toBe(nuevoclub.descripcion)
  });

  it(' addMemberToClub debería lanzar una excepción por club inválido', async () => {
    const nuevasocio: SocioEntity = await socioRepository.save({
      nombreUsuario: faker.address.cityName(),
      correoElectronico: "Argentina",
      fechaNacimiento: faker.address.cityName(),

    })
 
    await expect(() => service.addMemberToClub(nuevasocio.id, "0")).rejects.toHaveProperty("message", "No se encontró el club con el Id dado");
  });

  it(' addMemberToClub debería lanzar una excepción por socio inválida', async () => {
    const nuevoclub: ClubEntity = await clubRepository.save({
      nombre: "Otro club",
      fechafundacion: faker.address.longitude(),
      imagen: faker.address.latitude(),
      descripcion: faker.internet.url()

    });
 
    await expect(() => service.addMemberToClub("0", nuevoclub.id)).rejects.toHaveProperty("message", "no se encontró la socio con el Id dado");
  });

  it('findMembersFromClub debería retornar los clubes de una socio', async ()=>{
    const clubes: ClubEntity[] = await service.findMembersFromClub(socio.id);
    expect(clubes.length).toBe(5)
  });

  it('findMembersFromClub debería lanzar una excepción por socio inválida', async () => {
    await expect(()=> service.findMembersFromClub("0")).rejects.toHaveProperty("message", "No se encontró la socio con el Id dado");
  });

  it('findMemberFromClub debería retornar un club de una socio', async () => {
    const club: ClubEntity = clubList[0];
    const storedclub: ClubEntity = await service.findMemberFromClub(socio.id, club.id, )
    expect(storedclub).not.toBeNull();
    expect(storedclub.nombre).toBe(club.nombre);
    expect(storedclub.fechaFundacion).toBe(club.fechaFundacion);
    expect(storedclub.imagen).toBe(club.imagen);
    expect(storedclub.descripcion).toBe(club.descripcion);
  });

  it('findMemberFromClub debería lanzar una excepción por club inválido', async () => {
    await expect(()=> service.findMemberFromClub(socio.id, "0")).rejects.toHaveProperty("message", "No se encontró el club con el Id dado");
  });
  
  it('findMemberFromClub debería lanzar una excepción por socio inválida', async () => {
    const club: ClubEntity = clubList[0];
    await expect(()=> service.findMemberFromClub("0", club.id)).rejects.toHaveProperty("message", "No se encontró la socio con el Id dado");
  });

  it('findMemberFromClub debería lanzar una excepción por club no asociado a socio', async () => {
    const nuevoclub: ClubEntity = await clubRepository.save({
      nombre: "Otro club",
      fechafundacion: faker.address.longitude(),
      imagen: faker.address.latitude(),
      descripcion: faker.internet.url()

    });
 
    await expect(()=> service.findMemberFromClub(socio.id, nuevoclub.id)).rejects.toHaveProperty("message", "El club no se encuentra asociado a la socio");
  });

  it('updateMembersFromClub debería actualizar la lista de clubes de una socio', async () => {
    const nuevoclub: ClubEntity = await clubRepository.save({
      nombre: "Otro club",
      fechafundacion: faker.address.longitude(),
      imagen: faker.address.latitude(),
      descripcion: faker.internet.url()

    });
 
    const updatedsocio: SocioEntity = await service.updateMembersFromClub(socio.id, [nuevoclub]);
    expect(updatedsocio.clubes.length).toBe(1);
 
    expect(updatedsocio.clubes[0].nombre).toBe(nuevoclub.nombre);
    expect(updatedsocio.clubes[0].fechaFundacion).toBe(nuevoclub.fechaFundacion);
    expect(updatedsocio.clubes[0].imagen).toBe(nuevoclub.imagen);
    expect(updatedsocio.clubes[0].descripcion).toBe(nuevoclub.descripcion);
  });

  it('updateMembersFromClub debería lanzar una excepción al asociar una lista de clubes a una socio que no existe', async () => {
    const nuevoclub: ClubEntity = await clubRepository.save({
      nombre: "Otro club",
      fechafundacion: faker.address.longitude(),
      imagen: faker.address.latitude(),
      descripcion: faker.internet.url()

    });
 
    await expect(()=> service.updateMembersFromClub("0", [nuevoclub])).rejects.toHaveProperty("message", "No se encontró la socio con el Id dado");
  });

  it('updateMembersFromClub debería lanzar una excepción al asociar una lista de clubes que no existe a una socio', async () => {
    const nuevoclub: ClubEntity = clubList[0];
    nuevoclub.id = "0";
 
    await expect(()=> service.updateMembersFromClub(socio.id, [nuevoclub])).rejects.toHaveProperty("message", "No se encontró el club con el Id dado");
  });

  it('deleteMemberFromClub debería eliminar un club de una socio', async () => {
    const club: ClubEntity = clubList[0];
   
    await service.deleteMemberFromClub(socio.id, club.id);
 
    const storedsocio: SocioEntity = await socioRepository.findOne({where: {id: socio.id}, relations: ["clubes"]});
    const deletedclub: ClubEntity = storedsocio.clubes.find(s => s.id === club.id);
 
    expect(deletedclub).toBeUndefined();
 
  });

  it('deleteMemberFromClub debería lanzar una excepción por club no existe', async () => {
    await expect(()=> service.deleteMemberFromClub(socio.id, "0")).rejects.toHaveProperty("message", "No se encontró el club con el Id dado");
  });

  it('deleteMemberFromClub debería lanzar una excepción por socio no existe', async () => {
    const club: ClubEntity = clubList[0];
    await expect(()=> service.deleteMemberFromClub("0", club.id)).rejects.toHaveProperty("message", "No se encontró la socio con el Id dado");
  });

  it('deleteMemberFromClub should thrown an exception for an non asocciated artwork', async () => {
    const nuevoclub: ClubEntity = await clubRepository.save({
      nombre: "Otro club",
      fechafundacion: faker.address.longitude(),
      imagen: faker.address.latitude(),
      descripcion: faker.internet.url()

    });
 
    await expect(()=> service.deleteMemberFromClub(socio.id, nuevoclub.id)).rejects.toHaveProperty("message", "El club no se encuentra asociado a la socio");
  });

});
