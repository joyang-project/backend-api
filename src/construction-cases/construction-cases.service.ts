import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionCase } from './entities/construction-case.entity';
import sharp from 'sharp';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class ConstructionCasesService {
  constructor(
    @InjectRepository(ConstructionCase)
    private readonly repo: Repository<ConstructionCase>,
  ) {}

  async createCase(file: Express.Multer.File, body: any) {
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.webp`;
    const uploadPath = join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    await sharp(file.path)
      .resize(1000)
      .webp({ quality: 80 })
      .toFile(join(uploadPath, fileName));

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    const newCase = this.repo.create({
      service_type: body.service_type,
      location_tag: body.location_tag,
      title: body.title,
      description: body.description,
      original_name: file.originalname,
      stored_name: fileName,
      image_url: `/uploads/${fileName}`,
      mimetype: 'image/webp',
      size: fs.statSync(join(uploadPath, fileName)).size.toString(),
    });

    return await this.repo.save(newCase);
  }

  async findAll() {
    return await this.repo.find({
      where: { is_visible: true },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async updateOrder(ids: string[]) {
    const updates = ids.map((id, index) => 
      this.repo.update(id, { sort_order: index })
    );
    await Promise.all(updates);
    return { success: true };
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    
    if (!item) {
      throw new NotFoundException('해당 사례를 찾을 수 없습니다.');
    }

    const filePath = join(process.cwd(), 'uploads', item.stored_name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.repo.remove(item);
    return { success: true };
  }
}