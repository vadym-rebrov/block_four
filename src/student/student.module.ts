import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './student.schema';
import { StudentRepository } from './student.repository';
import { GroupModule } from 'src/group/group.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Student.name,
        schema: StudentSchema,
      },
    ]),
    GroupModule,
  ],
  providers: [StudentService, StudentRepository],
  controllers: [StudentController],
})
export class StudentModule {}
