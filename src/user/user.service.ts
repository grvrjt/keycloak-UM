import { Injectable } from '@nestjs/common';
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from '@typegoose/typegoose';
import KcAdminClient from 'keycloak-admin';
import { User } from './user.model'
import { RequiredActionAlias } from 'keycloak-admin/lib/defs/requiredActionProviderRepresentation';
import { query } from 'express';
const kcAdminClient = new KcAdminClient();

const keycloakRun = async () => {
    try {
        await kcAdminClient.auth({
            username: 'gauravrajput',
            password: '5225143',
            grantType: 'password',
            clientId: 'admin-cli',
        });
        console.log("RADHE RADHE ")
    } catch (err) {
        console.log("GAURAV RAJPUT---->", err);
    }
};
keycloakRun();
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>
    ) {
    }


    /**
         * This method  is used to delete the user from  the keycloak.
         * @method saveUser
         * @author GAURAV RAJPUT
         * @date  15-10-2020 , 12:05 PM
         * @param   {Object}  userData{ Containing the data of the user}
         * @return  {Object}   {Object containing id of the craeted user }
         */
    async saveUser(userData: User): Promise<object> {
        try {
            const response = await kcAdminClient.users.create({
                realm: userData.realmName,
                username: userData.userName,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                emailVerified: true,
                requiredActions: [RequiredActionAlias.CONFIGURE_TOTP],
                enabled: true,
                totp: true,
                credentials: [{
                    type: 'password',
                    temporary: false,
                    value: 'Gizmo123'
                }]
            });
            return response
        } catch (err) {
            console.log(err);
        }
    }



    /**
         * This method  is used to delete the user from  the keycloak.
         * @method deleteUser
         * @author GAURAV RAJPUT
         * @date  16-10-2020 , 3:05 PM
         * @param   {Object}  userId{ keycloak id of the  user}
         * @return  {Object}   {success and related info }
         */
    async deleteUser(userId: string): Promise<object> {
        try {
            await kcAdminClient.users.del({
                id: userId,
                realm: "myRealm", //TODO: realm name change accordingly
            });
            return { success: true, message: "User Deleted Successfully ..." }
        } catch (err) {
            return { success: false, message: err.response.data }
        }
    }

    /**
     * This method  is used to disabled the user in the keycloak.
     * @method disableUser
     * @author GAURAV RAJPUT
     * @date  16-10-2020 , 3:42 PM 
     * @param   {Object}  userId{ keycloak id of the  user}
     * @return  Void   {}
     */
    async disableUser(userId: string): Promise<void> {
        try {
            await kcAdminClient.users.update({
                id: userId,
                realm: "myRealm"// TODO: realm name change accordingly
            }, {
                enabled: false,
            })
            return
        } catch (err) {
            console.log("Error while updating the user ", err);
            return
        }
    }

}























