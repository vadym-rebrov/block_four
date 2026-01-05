# Movie Session Service

## Domain Description

This service implements the logic for **Entity 3 (Movie Session)**. It is designed to manage movie screenings in a cinema system.

**Entities:**
* **Entity 1 (Movie):** Represents the movie itself. This is an external entity managed by a separate service. The Session Service validates the existence of a movie via an HTTP request to the Movie Service.
* **Entity 3 (Movie Session):** Represents a specific screening of a movie in a specific room at a specific time.
    * **Relationship:** Many-to-One (Many sessions can exist for one movie).
    * **Attributes:** Start time, End time, Room number, Ticket availability.

**Features:**
* **Creation:** Allows creating a new session. It validates:
    * Existence of the Movie (via external API).
    * Existence of the Room (internal database).
    * **Time constraints:** `end` time must be strictly greater than `start` time.
    * **Overlaps:** Ensures no two sessions in the same room overlap in time.
* **Listing:** Retrieves a paginated list of sessions for a specific movie, sorted by start time (descending).
* **Aggregation:** Provides a bulk counter endpoint to get the number of sessions for a list of movie IDs using MongoDB Aggregation Framework.

---

## How to Run

### Prerequisites
* Node.js (v18+)
* Docker & Docker Compose
* Run Java Spring Service from : https://github.com/vadym-rebrov/BlockTwo
### Option 1: Using Docker Compose

1.  Ensure Docker is running.
2.  Run the application and the MongoDB database:
    ```bash
    docker-compose up --build
    ```
3.  The service will be available at `http://localhost:3000`.

### Option 2: Local Setup

1.  **Environment Setup:**
    Create a `.env` file in the root directory or ensure environment variables are set:
    ```env
    PORT=3000
    MONGO_ADDRESS=mongodb://localhost:27017/movies_db_2
    MOVIE_SERVICE_URL=http://localhost:8080/api/movie
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Application:**
    ```bash
    npm run start:dev
    ```

---

## API Usage Examples

### 1. Create a Movie Session
**Endpoint:** `POST /api/movie-session`

#### Valid Request
Creates a session for movie ID `101` in room `1`.
```
{
    "movie": {
      "ext_id": 442,
      "title": "Gone with the Wind"
    },
    "roomNumber": 5,
    "start": "2025-10-20T18:00:00.000Z",
    "end": "2025-10-20T21:00:00.000Z"
}
```

#### Invalid Request
End date is before Start date.
```
    "movie": {
      "ext_id": 442,
      "title": "Gone with the Wind"
    },
    "roomNumber": 5,
    "start": "2025-10-20T21:00:00.000Z",
    "end": "2025-10-20T18:00:00.000Z"
```

#### Invalid Request
Session overlaps with an existing one in the same room.
```
    "movie": {
      "ext_id": 442,
      "title": "Gone with the Wind"
    },
    "roomNumber": 5,
    "start": "2025-10-20T18:00:00.000Z",
    "end": "2025-10-20T21:00:00.000Z"
```

**Response:**
```
{
    "message": "Room 5 is already booked from Thu Jan 02 2025 14:00:00 GMT+0000 (Coordinated Universal Time) to Thu Jan 02 2025 17:00:00 GMT+0000 (Coordinated Universal Time)",
    "error": "Conflict",
    "statusCode": 409
}
```

### 2. Get Sessions by Movie ID
**Endpoint:** `GET /api/movie-session`

#### Valid Request
Fetches sessions for movie 12 with pagination.

GET /api/movie-session?movieId=12&size=5&from=0

```
{
    "list": [
        {
            "id": "695bea809570e692b99ad377",
            "movie": {
                "ext_id": 12,
                "title": "The Widening Gyre"
            },
            "start": "2026-01-15T18:02:00.000Z",
            "end": "2026-01-15T20:29:00.000Z",
            "roomNumber": 3,
            "tickets": [
                {
                    "rowNumber": 1,
                    "seatNumber": 1,
                    "isBooked": false
                },
                {
                    "rowNumber": 1,
                    "seatNumber": 2,
                    "isBooked": false
                },
                {
                    "rowNumber": 1,
                    "seatNumber": 3,
                    "isBooked": false
                },
                {
                    "rowNumber": 1,
                    "seatNumber": 4,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 1,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 2,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 3,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 4,
                    "isBooked": false
                }
            ]
        },
        {
            "id": "695bea809570e692b99ad50e",
            "movie": {
                "ext_id": 12,
                "title": "The Widening Gyre"
            },
            "start": "2026-01-15T17:24:00.000Z",
            "end": "2026-01-15T19:35:00.000Z",
            "roomNumber": 5,
            "tickets": [
                {
                    "rowNumber": 1,
                    "seatNumber": 1,
                    "isBooked": false
                },
                {
                    "rowNumber": 1,
                    "seatNumber": 2,
                    "isBooked": false
                },
                {
                    "rowNumber": 1,
                    "seatNumber": 3,
                    "isBooked": false
                },
                {
                    "rowNumber": 1,
                    "seatNumber": 4,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 1,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 2,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 3,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 4,
                    "isBooked": false
                },
                {
                    "rowNumber": 3,
                    "seatNumber": 1,
                    "isBooked": false
                },
                {
                    "rowNumber": 3,
                    "seatNumber": 2,
                    "isBooked": false
                },
                {
                    "rowNumber": 3,
                    "seatNumber": 3,
                    "isBooked": false
                },
                {
                    "rowNumber": 3,
                    "seatNumber": 4,
                    "isBooked": false
                }
            ]
        },
        {
            "id": "695bea809570e692b99ad318",
            "movie": {
                "ext_id": 12,
                "title": "The Widening Gyre"
            },
            "start": "2026-01-15T15:07:00.000Z",
            "end": "2026-01-15T17:42:00.000Z",
            "roomNumber": 3,
            "tickets": [
                {
                    "rowNumber": 1,
                    "seatNumber": 1,
                    "isBooked": false
                },
                {
                    "rowNumber": 1,
                    "seatNumber": 2,
                    "isBooked": false
                },
                {
                    "rowNumber": 1,
                    "seatNumber": 3,
                    "isBooked": false
                },
                {
                    "rowNumber": 1,
                    "seatNumber": 4,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 1,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 2,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 3,
                    "isBooked": false
                },
                {
                    "rowNumber": 2,
                    "seatNumber": 4,
                    "isBooked": false
                }
            ]
        }
    ],
    "totalElements": 33
}
```

#### Invalid Request
movieId is required.

```
{
    "message": [
        "movieId must be an integer number",
        "movieId should not be empty"
    ],
    "error": "Bad Request",
    "statusCode": 400
}
```

### 3. Get Session Counts (Aggregation)
**Endpoint:** `POST /api/movie-session/_counts`
#### Valid Request

```
{
    "movieIds":[12,443,442,664]
}
```
**Response:**

```
{
    "id442": 39,
    "id664": 38,
    "id12": 33,
    "id443": 0
}
```

#### Invalid Request

```
{
    "movieIds":[34, "25"]
}
```
**Response:**

```
{
    "message": [
        "each value in movieIds must be a number conforming to the specified constraints"
    ],
    "error": "Bad Request",
    "statusCode": 400
}
```

