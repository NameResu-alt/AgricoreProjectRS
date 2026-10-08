These setup instructions are for Windows computers, may not function for Linux or Max.

-Note, neither .sh script is dependent on the current working directory, but good to orient yourself

# 1. Run the Setup Script
From the project root, open Git Bash and execute the setup.sh script:
bash ./bin/setup.sh

If you don't utilize Git Bash, it won't work. 

This script creates a .env file in the /backend directory.

# 2. Configure the Backend Environment
Open /backend/.env and provide the following environment variables:
- DATABASE_URL: The connection URL to your database. 

Follows the postgresql+asyncpg://<username>:<password>@<host>/<db_name> format. 

- SECRET_KEY: A randomly generated secret key
- FRONTEND_ORIGIN=The origin URL used by the frontend. Needed for CORS

You can generate a secret key by doing this in a terminal:
python -c "import secrets; print(secrets.token_urlsafe(32))"

Copy the generated SECRET_KEY to the .env file

# 3. Seed the Database
Return to the project root and run the seed.sh script using Git Bash: 
bash ./bin/seed.sh

The seed script supports the following optional arguments:
-r, --reset: Drop all tables and insert seed data.
-y, --yes: Automatically confirm the database reset

# 4. Star tthe Backend API
In a Powershell terminal (not Git Bash) go to the /backend directory. 

Activate the Python venv by doing:
./.venv/Scripts/Activate.ps1

Once the virtual environment is active, run the command to start the FastAPI api:
fastapi dev

# 5. Configure the Frontend
Once the backend API is running, open /frontend/.env.development

Set the environment variables
- VITE_API_BASE_URL: The URL that leads to where the backend API is hosted.

# 6. Start the Frontend
Open a new terminal separate from the one that is currently running the FastAPI backend, and navigate to the frontend directory:
cd /frontend

Start the frontend server with:
npm run dev

# Troubleshooting
* If the backend cannot connect to the database, check the DATABASE_URL in /backend/.env and make sure that the database is accessible. 

* Frontend cannot connect to the backend: Make sure that the backend URL in /frontend/.env.development and confirm that the API is running.

* Frontend is getting CORS errors. Ensure that the provided frontend origin in /backend/.env matches the one the frontend is currently running on. 