## Overview

The project manager wants to unify professional signups that happen through disparate sources (direct, partner referrals, internal additions) and this project seeks to create endpoints that can facilitate their objective.  

Endpoints exposed by this project are as follows:

```
BASE API URL: http://localhost:8000/api
```

## List Professionals
#### List all professionals, filtered by source with the option to include resume

GET /api/professionals/?source=direct|partner|internal&include_resume=true

Optional query params:

 - source=direct|partner|internal
 - include_resume=true

##### Example Response
```json
[
  {
    "id": 1,
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "15551234567",
    "company_name": "Acme Inc",
    "job_title": "Research Analyst",
    "source": "direct",
    "created_at": "2026-02-16T12:30:10Z",
    "resume_url": "http://localhost:9000/resumes/jane.pdf",
    "resume_summary": "Experienced research analyst with 5+ years in financial modeling..."
  }
]
```

## Create Professional
#### Create a single professional

POST /api/professionals/

##### Example Payload
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "15551234567",
  "company_name": "Acme Inc",
  "job_title": "Research Analyst",
  "source": "direct"
}
```

##### Example Response
```json
{
  "id": 1,
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "15551234567",
  "company_name": "Acme Inc",
  "job_title": "Research Analyst",
  "source": "direct",
  "created_at": "2026-02-16T12:30:10Z",
  "resume_url": null,
  "resume_summary": null
}
```


## Bulk Upsert Professionals
#### Create bulk professionals

POST /api/professionals/

- Uses email as primary key if present 
- Otherwise uses phone 
- Supports partial success

##### Example Payload
```json
[
  {
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "source": "direct"
  },
  {
    "full_name": "John Smith",
    "phone": "15550001111",
    "source": "partner"
  }
]
```

##### Example Response
```json
{
  "created": 1,
  "updated": 1,
  "errors": []
}
```


## Upload Resume
#### Upload resume of professional

POST /api/professionals/{professional_id}/resume

- Uses email as primary key if present
- Otherwise uses phone
- Supports partial success

##### Example Request
```bash
curl -X POST http://localhost:8000/api/professionals/1/resume \
-F "file=@sample_resume.pdf"
```

##### Example Response (201)
```json
{
  "id": 10,
  "professional": 1,
  "file_url": "http://localhost:9000/resumes/resume_1.pdf",
  "summary": "Senior researcher with 10 years experience in market intelligence..."
}
```
---

## Running application:

The application is containerized so ensure docker is running before running the following commands.



```bash


# clone the repo within a temp folder
git clone git@github.com:ackimwilliams/professional_signups.git .

# start application by running the following commands at the root of the repo (where you cloned the application)
make start

# stop application
make stop

# (optional) seed the database (backend/api/management/commands/seed.py <--- update seeder as necessary)
make seed

# (optional) start backend
make backend

# (optional) start frontend
make frontend
```

### Tests

```py
python manage.py test api
```

<img width="980" height="331" alt="image" src="https://github.com/user-attachments/assets/26491ad0-2b5b-4e4d-9ea1-5879b7135c63" />


## Backend

<img width="702" height="724" alt="image" src="https://github.com/user-attachments/assets/7cc37977-8da8-4989-a189-c649e7d448ba" />



### In the interest of time certain tradeoff were made, given more time the following updates will be addressed:

1. add user profiles and authentication support
2. create custom exception for this domain
2. use environment variables or cloud secret manager to store credentials and other sensitive data
3. add pagination to the *GET /api/professional* endpoint, as the list grows so does the payload without pagination
4. add more support for filtering, ordering and searching GET endpoints
4. extend uploaded resume to include other file types
5. add more integration and unit tests
6. add more validation for user submitted data. Perform regex validation and variable normalization/transformation such as numbers only phone or string.lower() email and phone
7. for file uploads consider antivirus scanning, file size validation and limits and type checking
7. as extracting text from files is a blocking request can can increase latency, especially noticeable with large files, we should make the process asynchronous. This may involve enqueuing celery tasks and having celery workers extract text, generate summary and push the uploaded file to cloud storage
8. add structured logging and stream logs to datadog or an observability related service
9. consider rate limiting/trottling especially for bulk uploads
10. although email address is used for upsert, add an idempotency key for bulk retries
11. make use of django's bulk_create() and bulk_update() for batch uploads and consider prefetching all professionals associated with emails and/or phone in 1 query 
13. add health check endpoints
 
## Frontend

#### Login

```
email address = test@test.com
password = test
```

<img width="933" height="720" alt="image" src="https://github.com/user-attachments/assets/ef8a0b10-8ebb-4815-af0a-818062f03310" />

#### Dashboard

<img width="2033" height="1071" alt="image" src="https://github.com/user-attachments/assets/4471e362-f1ba-4984-bdbc-25f34f4d7323" />

#### View Resume

<img width="2044" height="1140" alt="image" src="https://github.com/user-attachments/assets/fcfa59a7-cf35-48f7-b6af-3b0f7a5f41ab" />

#### Upload Resume:

<img width="2027" height="1053" alt="image" src="https://github.com/user-attachments/assets/c0b9d943-5be7-40f9-bd4b-d7493a33152a" />

#### Bulk Upsert

<img width="2039" height="610" alt="image" src="https://github.com/user-attachments/assets/54d46638-4e2c-4eff-97b7-8668a674bc94" />


#### Single Insert

<img width="755" height="643" alt="image" src="https://github.com/user-attachments/assets/2ec518ec-aaaf-4089-b122-d0994f88f65e" />



### In the interest of time certain tradeoff were made, given more time the following updates will be addressed:

1. add user profiles and authentication
2. add support for multiple file types, not just pdf
3. add explicit download resume functionality
4. version uploaded resume files
5. add a progress bar for large file uploads 
6. add a delete professional functionality as necessary 
7. modify the interface to meet the style of NewtonX products 
8. add support for paginated endpoints 
9. add unit and integration tests 
10. remove debugging application messages such as json payload returned 
11. add validation for email and phone numbers
12. add inline form validation
13. add a keyword search option
