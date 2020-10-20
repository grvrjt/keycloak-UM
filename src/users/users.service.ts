import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import KcAdminClient from 'keycloak-admin';
import { User } from './user.model';
import { RequiredActionAlias } from 'keycloak-admin/lib/defs/requiredActionProviderRepresentation';
import { HttpException } from '@nestjs/common';
import { Issuer } from 'openid-client';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';

const kcAdminClient = new KcAdminClient();
const keycloakRun = async () => {
  try {
    await kcAdminClient.auth({
      username: process.env.KEYCLOAK_ADMIN_USERNAME,
      password: process.env.KEYCLOAK_ADMIN_PASSWORD,
      grantType: 'password',
      clientId: 'admin-cli',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    });
    console.log(process.env.KEYCLOAK_ADMIN_USERNAME, " Authenticated by Keycloak " );
// :fire
    // const keycloakIssuer = await Issuer.discover(
    //   'http://localhost:8080/auth/realms/master',
    // );
    // const client = new keycloakIssuer.Client({
    //   client_id: 'admin-cli', // Same as `clientId` passed to client.auth()
    //   client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
    // });
    // // Use the grant type 'password'

    // let tokenSet = await client.grant({
    //   grant_type: 'password',
    //   username: process.env.KEYCLOAK_ADMIN_USERNAME,
    //   password: process.env.KEYCLOAK_ADMIN_PASSWORD,
    // });
    // console.log('Admin Connection with keycloack established');

    // setInterval(async () => {
    //   try {
    //     tokenSet = await client.refresh(kcAdminClient.refreshToken);
    //     kcAdminClient.setAccessToken(tokenSet.access_token);
    //   } catch (err) {
    //     console.log(`Error in set in`, err);
    //   }
    // }, 58 * 1000);
  } catch (err) {
    console.log('Error while making connection with keycloak', err);
  }
};
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
  ) {
    keycloakRun();
  }

  async getUsers(): Promise<UserRepresentation[]> {
    try {
      const users = await kcAdminClient.users.find({
        realm: process.env.REALM,
      });
      return users;
    } catch (err) {
      console.log(err);
    }
  }
  /**
   * This method  is used to delete the user from  the keycloak.
   * @method saveUser
   * @author GAURAV RAJPUT
   * @date  15-10-2020 , 12:05 PM
   * @param   {Object}  userData{ Containing the data of the user}
   * @return  {Object}   {Object containing id of the craeted user }
   */
  async saveUser(userData: User): Promise<boolean> {
    try {
      const newUser = new this.userModel(userData);
      const actions = [RequiredActionAlias.UPDATE_PASSWORD];
      if (userData.totp) {
        actions.push(RequiredActionAlias.CONFIGURE_TOTP);
      }
      const response = await kcAdminClient.users.create({
        realm: process.env.REALM,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        emailVerified: true,
        requiredActions: actions,
        enabled: true,
        totp: userData.totp ? true : false,
        credentials: [
          {
            type: 'password',
            temporary: false,
            value: 'Gizmo123',
          },
        ],
      });
      newUser.keyCloakId = response.id;
      await newUser.save();
      // console.log(response);
      return true;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.response.data.errorMessage || error.message,
        },
        400,
      );
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
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await kcAdminClient.users.del({
        id: userId,
        realm: process.env.REALM,
      });
      return true;
    } catch (err) {
      console.log(err);
      throw new HttpException(
        { success: false, message: err.response.data },
        400,
      );
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
  async disableUser(userId: string): Promise<boolean> {
    try {
      await kcAdminClient.users.update(
        {
          id: userId,
          realm: process.env.REALM,
        },
        {
          enabled: false,
        },
      );
      return true;
    } catch (err) {
      throw new HttpException(
        { success: false, message: err.response.data },
        400,
      );
    }
  }

  async getRoles(): Promise<RoleRepresentation[]> {
    try {
      const roles = await kcAdminClient.roles.find();
      return roles;
    } catch (err) {
      throw new HttpException(
        { success: false, message: err.response.data },
        400,
      );
    }
  }


  /**
   * This method  is used to  assign the roles to the user .
   * @method assignRoleToUser
   * @author GAURAV RAJPUT
   * @date  19-10-2020 , 2:53 PM
   * @param   {string}  userId{ keycloak id of the  user}
   * @param {Object}  roleDetail {Contains the  id , description and name of the role }
   * @return  boolean  
  */
  async assignRoleToUser(userId: string, roleDetail: { id: string, name: string, description:string}): Promise<boolean> {
    try {
      await kcAdminClient.users.addRealmRoleMappings({
        id: userId,
        roles: [{
          clientRole: false,
          composite: false,
          containerId: process.env.REALM,
          description: roleDetail.description,
          id: roleDetail.id,
          name: roleDetail.name 
        }],
        realm: process.env.REALM
      });
      return true
    } catch (err) {
      throw new HttpException(
        { success: false, message: err.response.data },
        400,
      );
    }
  }


}
