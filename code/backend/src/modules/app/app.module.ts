import {
  DB_DATABASE,
  DB_PASSWORD,
  DB_USERNAME,
  FRONTEND_BUILD_PATH,
  SOCKETIO_ENDPOINT_ON,
} from '../../config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { NotesModule } from '../notes/notes.module';
import { ExerciseTypesModule } from '../exercise-types/exercise-types.module';
import { ExerciseSchedulesModule } from '../exercise-schedules/exercise-schedules.module';
import { ExerciseCompletionsModule } from '../exercise-completions/exercise-completions.module';
import { ReportsModule } from '../reports/reports.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatModule } from '../chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';

const imports = [
  AuthModule,
  UsersModule,
  NotesModule,
  ExerciseTypesModule,
  ExerciseSchedulesModule,
  ExerciseCompletionsModule,
  ReportsModule,
  SequelizeModule.forRoot({
    dialect: 'postgres', // or 'mysql', 'sqlite', etc.
    host: 'localhost',
    port: 5432,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    autoLoadModels: true, // Automatically load models registered in modules
    synchronize: false, // Sync models with DB (don't use true in production!)
    define: {
      underscored: true, // This automatically maps isActive to is_active globally
      // scopes: {
      //   // This ensures that all find queries default to raw data
      //   raw: { raw: true },
      // },
    },

    // Optional: If you want query-level raw results globally (like raw SQL)
    // query: { raw: true },
  }),
  ServeStaticModule.forRoot({
    rootPath: FRONTEND_BUILD_PATH,
  }),
];

if (SOCKETIO_ENDPOINT_ON) {
  imports.push(ChatModule);
}

@Module({
  imports,
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
