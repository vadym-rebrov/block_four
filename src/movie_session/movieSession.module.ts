import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Session.name,
                schema: StudentSchema,
            },
        ]),
        ,
    ],
    providers: [MovieSessionService],
    controllers: [MovieSessionController],
})
export class StudentModule {}
