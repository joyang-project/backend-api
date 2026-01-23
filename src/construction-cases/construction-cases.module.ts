import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionCasesService } from './construction-cases.service';
import { ConstructionCasesController } from './construction-cases.controller';
import { ConstructionCase } from './entities/construction-case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructionCase])],
  
  controllers: [ConstructionCasesController],
  
  providers: [ConstructionCasesService],
  
  exports: [ConstructionCasesService],
})
export class ConstructionCasesModule {}