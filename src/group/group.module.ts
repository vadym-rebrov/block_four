import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupRepository } from './group.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Group.name,
        schema: GroupSchema,
      },
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService, GroupRepository],
  exports: [GroupService],
})
export class GroupModule {}
