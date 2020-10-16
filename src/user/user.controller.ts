import { Controller, Post, Body, Delete, Param, Put } from '@nestjs/common'
import { Roles, Scopes } from 'nest-keycloak-connect';
import { User } from './user.model';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
    constructor(private readonly UserService: UserService) { }

    @Post('/create-user')
    @Roles('kochar:admin', 'admin')
    async create(@Body() userData: User): Promise<object> {
        return await this.UserService.saveUser(userData);
    }

    @Delete('/delete-user/:id')
    @Roles('admin')
    async delete(@Param('id') userId: string): Promise<object> {
        return await this.UserService.deleteUser(userId);
    }

    @Put('/disable-user/:id')
    @Roles('admin')
    async disable(@Param('id') userId: string): Promise<void> {
        return await this.UserService.disableUser(userId);
    }

}