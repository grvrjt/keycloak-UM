import { prop } from "@typegoose/typegoose";

export class User {
    @prop()
    id?: string
    @prop({ required: true })
    userName: string
    @prop({ required: true })
    realmName: string
    @prop() //TODO :email validation 
    email?: string
    @prop()
    firstName?: string
    @prop()
    lastName?: string

}