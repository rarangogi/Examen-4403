/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from "class-validator";


export class SocioDto {
    @IsString()
    @IsNotEmpty()
    readonly nombreUsuario: string;
    
    @IsString()
    @IsNotEmpty()
    readonly correoElectronico: string;
    
    @IsString()
    @IsNotEmpty()
    readonly fechaNacimiento: string;
}