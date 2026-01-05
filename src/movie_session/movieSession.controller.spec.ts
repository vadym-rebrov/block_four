import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieSessionModule } from './movieSession.module';
import { MovieService } from '../movie/movie.service';
import { RoomRepository } from '../room/room.repository';
import {
    clearDatabase,
    startMongoContainer,
    stopMongoContainer,
} from '../test/mongo.setup';
import { SaveMovieSessionDto } from './dto/saveMovieSession.dto';
import { MovieSessionQueryDto } from './dto/movieSessionQueryDto';
import { CountByIdArrayDto } from './dto/countByIdArrayDto';

jest.setTimeout(100000);
describe('MovieSessionController (Integration)', () => {
    let app: INestApplication;
    let roomRepository: RoomRepository;
    const mockMovieService = {
        getById: jest.fn(),
    };

    beforeAll(async () => {
        const uri = await startMongoContainer();
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                MovieSessionModule,
            ],
        })
            .overrideProvider(MovieService)
            .useValue(mockMovieService)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
            }),
        );
        roomRepository = moduleFixture.get<RoomRepository>(RoomRepository);

        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await stopMongoContainer();
    });

    beforeEach(async () => {
        await clearDatabase();
        jest.clearAllMocks();
    });

    describe('POST /movie-session (Create)', () => {
        const validSessionDto: SaveMovieSessionDto = {
            movie: {
                ext_id: 442,
                title: 'Gone with the Wind'
            },
            roomNumber: 1,
            start: new Date(Date.now() + 100000).toISOString(),
            end: new Date(Date.now() + 200000).toISOString(),
        };

        it('should create a movie session successfully', async () => {
            await roomRepository.create({
                roomNumber: 1,
                capacity: 50,
                type: 'STANDARD',
                seatsTemplate: [{ rowNumber: 1, seatNumber: 1 }],
            });

            mockMovieService.getById.mockResolvedValue({
                id:442,
                title: 'Gone with the Wind',
            });

            const response = await request(app.getHttpServer())
                .post('/movie-session')
                .send(validSessionDto);
            expect(response.status).toBe(201);
            expect(typeof response.text).toBe('string');
            expect(response.text.length).toBeGreaterThan(0);
        });

        it('should fail if End date is before Start date', async () => {
            await roomRepository.create({
                roomNumber: 1,
                seatsTemplate: [{ rowNumber: 1, seatNumber: 1 }],
            });

            mockMovieService.getById.mockResolvedValue({
                id: 442,
                title: 'Gone with the Wind',
            });

            const invalidDto = {
                ...validSessionDto,
                start: new Date(Date.now() + 200000).toISOString(),
                end: new Date(Date.now() + 100000).toISOString(),
            };

            const response = await request(app.getHttpServer())
                .post('/movie-session')
                .send(invalidDto);

            expect(response.status).toBe(400);
            expect(JSON.stringify(response.body)).toContain('End date must be after start date');
        });

        it('should throw 409 Conflict if session overlaps', async () => {
            await roomRepository.create({
                roomNumber: 1,
                seatsTemplate: [{ rowNumber: 1, seatNumber: 1 }],
            });
            mockMovieService.getById.mockResolvedValue({ id: 442, title: 'Gone with the Wind' });

            await request(app.getHttpServer())
                .post('/movie-session')
                .send(validSessionDto)
                .expect(201);

            const response = await request(app.getHttpServer())
                .post('/movie-session')
                .send(validSessionDto);

            expect(response.status).toBe(409);
            expect(response.body.message).toMatch("Room 1 is busy at this time");
        });
    });

    describe('GET /movie-session (List with Pagination)', () => {
        it('should return MovieSessionQueryResponseDto with list and totalElements', async () => {
            await roomRepository.create({
                roomNumber: 1,
                seatsTemplate: [{ rowNumber: 1, seatNumber: 1 }],
            });
            mockMovieService.getById.mockResolvedValue({ id: 101, title: 'Inception' });

            for (let i = 0; i < 3; i++) {
                await request(app.getHttpServer()).post('/movie-session').send({
                    movie: { ext_id: 101, title: 'Inception' },
                    roomNumber: 1,
                    start: new Date(Date.now() + (i * 1000000)).toISOString(),
                    end: new Date(Date.now() + (i * 1000000) + 500000).toISOString(),
                });
            }

            const query: MovieSessionQueryDto = {
                movieId: 101,
                size: 2,
                from: 0,
            };

            const response = await request(app.getHttpServer())
                .get('/movie-session')
                .query(query);

            expect(response.status).toBe(200);

            const responseBody = response.body;

            expect(responseBody).toHaveProperty('list');
            expect(responseBody).toHaveProperty('totalElements');

            expect(responseBody.list).toHaveLength(2);

            expect(responseBody.totalElements).toBe(3);

            expect(responseBody.list[0]).toHaveProperty('id');
            expect(responseBody.list[0]).toHaveProperty('movie');
            expect(responseBody.list[0].movie.title).toBe('Inception');
        });

        it('should return empty list if nothing found', async () => {
            const query: { movieId: number } = { movieId: 999 };

            const response = await request(app.getHttpServer())
                .get('/movie-session')
                .query(query);

            expect(response.status).toBe(200);
            expect(response.body.list).toEqual([]);
            expect(response.body.totalElements).toBe(0);
        });
    });

    describe('POST /movie-session/_counts', () => {
        it('should return CountByIdArrayResponseDto with counts', async () => {
            await roomRepository.create({
                roomNumber: 1,
                seatsTemplate: [{ rowNumber: 1, seatNumber: 1 }],
            });
            mockMovieService.getById.mockImplementation((id) => Promise.resolve({ id, title: 'Movie' }));

            const sessionBase = {
                roomNumber: 1,
                start: new Date().toISOString(),
                end: new Date().toISOString()
            };

            let timeOffset = 0;
            const createSession = async (ext_id: number) => {
                timeOffset += 100000;
                await request(app.getHttpServer()).post('/movie-session').send({
                    movie: { ext_id, title: 'Movie' },
                    roomNumber: 1,
                    start: new Date(Date.now() + timeOffset).toISOString(),
                    end: new Date(Date.now() + timeOffset + 50000).toISOString(),
                });
            };

            await createSession(10);
            await createSession(10);
            await createSession(20);

            const countDto: CountByIdArrayDto = {
                movieIds: [10, 20, 30],
            };

            const response = await request(app.getHttpServer())
                .post('/movie-session/_counts')
                .send(countDto);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({
                id10: 2,
                id20: 1,
                id30: 0
            }));
        });
    });
});