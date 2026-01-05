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

describe('MovieSessionController (Integration)', () => {
    let app: INestApplication;
    let roomRepository: RoomRepository;

    // Mock for external Movie API
    const mockMovieService = {
        getById: jest.fn(),
    };

    beforeAll(async () => {
        // 1. Start MongoDB container
        const uri = await startMongoContainer();

        // 2. Create Testing Module
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri), // Use test DB
                MovieSessionModule,
            ],
        })
            .overrideProvider(MovieService) // Replace real HTTP service with mock
            .useValue(mockMovieService)
            .compile();

        app = moduleFixture.createNestApplication();

        // 3. Apply global pipes (same as in main.ts) for validation
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
            }),
        );

        // 4. Get repository to seed data
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
                ext_id: 101,
                title: 'Inception',
            },
            room_number: 1,
            start: new Date(Date.now() + 100000).toISOString(),
            end: new Date(Date.now() + 200000).toISOString(),
        };

        it('should create a movie session successfully', async () => {
            // Arrange
            // 1. Seed Room
            await roomRepository.create({
                roomNumber: 1,
                capacity: 50,
                type: 'STANDARD',
                seatsTemplate: [{ rowNumber: 1, seatNumber: 1 }],
            });

            // 2. Mock Movie Service response
            mockMovieService.getById.mockResolvedValue({
                id: 101,
                title: 'Inception',
            });

            // Act
            const response = await request(app.getHttpServer())
                .post('/movie-session')
                .send(validSessionDto);

            // Assert
            expect(response.status).toBe(201);
            expect(response.text).toBeDefined(); // Returns ID string
            expect(mockMovieService.getById).toHaveBeenCalledWith(101);
        });

        it('should fail if room does not exist', async () => {
            // Arrange
            mockMovieService.getById.mockResolvedValue({
                id: 101,
                title: 'Inception',
            });

            // Act (Room is not seeded)
            const response = await request(app.getHttpServer())
                .post('/movie-session')
                .send(validSessionDto);

            // Assert
            expect(response.status).toBe(404);
            expect(response.body.message).toContain('Room with number 1 not found');
        });

        it('should fail if movie title does not match external service', async () => {
            // Arrange
            await roomRepository.create({ roomNumber: 1, seatsTemplate: [] } as any);

            // Mock returns different title
            mockMovieService.getById.mockResolvedValue({
                id: 101,
                title: 'Interstellar',
            });

            // Act
            const response = await request(app.getHttpServer())
                .post('/movie-session')
                .send(validSessionDto);

            // Assert
            expect(response.status).toBe(404); // Logic in repo throws NotFoundException if title mismatch or movie not found
        });

        it('should fail if session overlaps (Conflict)', async () => {
            // Arrange
            await roomRepository.create({
                roomNumber: 1,
                seatsTemplate: [{ rowNumber: 1, seatNumber: 1 }],
            });
            mockMovieService.getById.mockResolvedValue({
                id: 101,
                title: 'Inception',
            });

            // Create first session
            await request(app.getHttpServer())
                .post('/movie-session')
                .send(validSessionDto)
                .expect(201);

            // Act - Try to create overlapping session
            const response = await request(app.getHttpServer())
                .post('/movie-session')
                .send(validSessionDto);

            // Assert
            expect(response.status).toBe(409); // ConflictException
            expect(response.body.message).toContain('already booked');
        });
    });

    describe('GET /movie-session (List)', () => {
        it('should return sessions filtered by movieId', async () => {
            // Arrange: Create sessions via API (helper or direct DB call preferred, using API for simplicity here)
            await roomRepository.create({
                roomNumber: 1,
                seatsTemplate: [{ rowNumber: 1, seatNumber: 1 }],
            });
            mockMovieService.getById.mockResolvedValue({
                id: 101,
                title: 'Inception',
            });

            const session1 = {
                movie: { ext_id: 101, title: 'Inception' },
                room_number: 1,
                start: new Date(Date.now() + 100000).toISOString(),
                end: new Date(Date.now() + 200000).toISOString(),
            };

            // Create session via endpoint to populate DB
            await request(app.getHttpServer()).post('/movie-session').send(session1);

            const query: MovieSessionQueryDto = {
                movieId: 101,
                size: 10,
                from: 0,
            };

            // Act
            const response = await request(app.getHttpServer())
                .get('/movie-session')
                .query(query);

            // Assert
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body).toHaveLength(1);
            expect(response.body[0].movie.ext_id).toBe(101);
        });

        it('should return empty list if no sessions found', async () => {
            const query: MovieSessionQueryDto = {
                movieId: 999,
                size:10,
                from:0
            };

            const response = await request(app.getHttpServer())
                .get('/movie-session')
                .query(query);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('POST /movie-session/_counts', () => {
        it('should count sessions by movie ids', async () => {
            // Arrange
            await roomRepository.create({
                roomNumber: 1,
                seatsTemplate: [{ rowNumber: 1, seatNumber: 1 }],
            });
            mockMovieService.getById.mockImplementation((id) => {
                if(id === 101) return Promise.resolve({ id: 101, title: 'Inception' });
                if(id === 102) return Promise.resolve({ id: 102, title: 'Matrix' });
            });

            // Create 2 sessions for movie 101
            await request(app.getHttpServer()).post('/movie-session').send({
                movie: { ext_id: 101, title: 'Inception' },
                room_number: 1,
                start: new Date(Date.now() + 10000).toISOString(),
                end: new Date(Date.now() + 20000).toISOString(),
            });
            await request(app.getHttpServer()).post('/movie-session').send({
                movie: { ext_id: 101, title: 'Inception' },
                room_number: 1,
                start: new Date(Date.now() + 30000).toISOString(),
                end: new Date(Date.now() + 40000).toISOString(),
            });

            // Create 1 session for movie 102
            await request(app.getHttpServer()).post('/movie-session').send({
                movie: { ext_id: 102, title: 'Matrix' },
                room_number: 1,
                start: new Date(Date.now() + 50000).toISOString(),
                end: new Date(Date.now() + 60000).toISOString(),
            });

            const countDto: CountByIdArrayDto = {
                movieIds: [101, 102, 103],
            };

            // Act
            const response = await request(app.getHttpServer())
                .post('/movie-session/_counts')
                .send(countDto);

            // Assert
            expect(response.status).toBe(201);
            // Expected format: { "id101": 2, "id102": 1, "id103": 0 }
            // Note: Repository logic prefixes keys with "id"
            expect(response.body).toEqual(expect.objectContaining({
                id101: 2,
                id102: 1,
                id103: 0
            }));
        });
    });
});