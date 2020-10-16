import { Module } from "@nestjs/common";
import { TypegooseModule } from "nestjs-typegoose";
import { UserController } from "./user.controller";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Module({
    imports: [TypegooseModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService]
})
export class UserModule { }
