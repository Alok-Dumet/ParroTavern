 #!/bin/sh
 set -e  # Exit if any command fails

 echo "Setting up frontend..."
 cd frontend
 npm install
 npm run build
 cd ..

 echo "Setting up backend..."
 cd backend
 npm install
 cd ..

 echo "Starting server..."
 cd backend
 npm run start