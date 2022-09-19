/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class ClubDto {
    
    @IsString()
    @IsNotEmpty()
    readonly nombre: string;
    
    @IsString()
    @IsNotEmpty()
    readonly fechaFundacion: string;
    
    @IsString()
    @IsNotEmpty()
    readonly imagen: string;

    @IsUrl()
    @IsNotEmpty()
    readonly descripcion: string;
}