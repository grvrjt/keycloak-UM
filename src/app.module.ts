import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypegooseModule } from 'nestjs-typegoose';
import { UserModule } from './user/user.module';
import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
} from 'nest-keycloak-connect';

@Module({
  imports: [TypegooseModule.forRoot('mongodb://localhost:27017/userManagementDb'), UserModule,
  KeycloakConnectModule.register({
    authServerUrl: 'http://localhost:8080/auth',
    realm: 'kochar',
    clientId: 'admin-cli',
    secret: '5ec50f6d-4e95-4209-a15e-670c26c8120c',
    // optional if you want to retrieve JWT from cookie
    //cookieKey: 'KEYCLOAK_JWT',
  }),],
  providers: [{
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: ResourceGuard,
  }, {
    provide: APP_GUARD,
    useClass: RoleGuard,
  }]
})
export class AppModule { }
