import { 
  Controller, Post, Get, Patch, Delete, 
  UseInterceptors, UploadedFile, Body, Param 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConstructionCasesService } from './construction-cases.service';

@Controller('construction-cases')
export class ConstructionCasesController {
  constructor(private readonly service: ConstructionCasesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', {
    dest: './temp',
  }))
  async uploadCase(
    @UploadedFile() file: Express.Multer.File, 
    @Body() body: any
  ) {
    return this.service.createCase(file, body);
  }

  @Get()
  async getAllCases() {
    return this.service.findAll();
  }

  @Patch('reorder')
  async reorderCases(@Body('ids') ids: string[]) {
    return this.service.updateOrder(ids);
  }

  @Delete(':id')
  async deleteCase(@Param('id') id: string) {
    return this.service.remove(id);
  }
}