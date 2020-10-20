import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypegooseModule.forRoot('mongodb://localhost:27017/auth-app', {
      useNewUrlParser: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  
  providers: [AppService],
})
export class AppModule {}
