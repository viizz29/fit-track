import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ExerciseTypesModule } from '../exercise-types/exercise-types.module';
import { ExerciseSchedulesModule } from '../exercise-schedules/exercise-schedules.module';
import { ExerciseCompletionsModule } from '../exercise-completions/exercise-completions.module';
import { ReportsModule } from '../reports/reports.module';
import { ExerciseStatsModule } from '../exercise-stats/exercise-stats.module';
import { ExerciseNotificationsModule } from '../exercise-notifications/exercise-notifications.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatModule } from '../chat/chat.module';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envValueValidations from 'src/lib/env-value-validations';

const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: `.env.${process.env.NODE_ENV}`,
    ignoreEnvFile: process.env.NODE_ENV === 'production',
    validationSchema: envValueValidations,
  }),
  AuthModule,
  UsersModule,
  ExerciseTypesModule,
  ExerciseSchedulesModule,
  ExerciseCompletionsModule,
  ReportsModule,
  ExerciseStatsModule,
  ExerciseNotificationsModule,
  SequelizeModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      dialect: 'postgres', // or 'mysql', 'sqlite', etc.
      host: 'localhost',
      port: 5432,
      username: config.getOrThrow('DB_USERNAME'),
      password: config.getOrThrow('DB_PASSWORD'),
      database: config.getOrThrow('DB_DATABASE'),
      timezone: '+00:00',
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
  }),
  CacheModule.registerAsync({
    isGlobal: true,
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      store: await redisStore({
        url: config.getOrThrow<string>('REDIS_URL'),
      }),
    }),
  }),
  ThrottlerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      throttlers: [
        {
          ttl: seconds(60),
          limit: 20,
        },
      ],
      storage: new ThrottlerStorageRedisService(
        config.getOrThrow<string>('REDIS_URL'),
      ),
    }),
  }),
];

if (process.env.SOCKETIO_ENDPOINT_ON) {
  imports.push(ChatModule);
}

@Module({
  imports,
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: EmailVerifiedGuard },
  ],
})
export class AppModule {}
