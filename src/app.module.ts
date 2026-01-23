import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { ConstructionCasesModule } from './construction-cases/construction-cases.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    ConstructionCasesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}