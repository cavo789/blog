# Start from an official Python image.
FROM python:3.11-slim

# Set the working directory in the container.
WORKDIR /code

# Copy the requirements file and install dependencies.
# We'll install fastapi and uvicorn (the server).
RUN pip install --no-cache-dir fastapi[all]

# Copy the application code into the container.
COPY ./main.py /code/main.py

# Expose the port the app runs on.
EXPOSE 80

# Command to run the application.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
