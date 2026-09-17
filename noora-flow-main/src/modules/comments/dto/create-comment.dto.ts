import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    text: string

    @IsString()
    @IsOptional()
    projectTaskId?: string

    @IsString()
    @IsOptional()
    parentId?: string

    @IsDate()
    @IsOptional()
    createdAt?: Date

    @IsString()
    @IsOptional()
    createdBy?: string

    @IsDate()
    @IsOptional()
    modifiedAt?: Date

    @IsString()
    @IsOptional()
    modifiedBy?: string
}
