# We'll use the latest version of Python and the smaller image in size (i.e. `slim`)
FROM python:slim

# We'll define the default folder in the image to /app
WORKDIR /app

# The only dependency we need is fastapi
RUN pip install --no-cache-dir fastapi[standard]

# We need to copy our Python script in the image
COPY main.py main.py

# And we'll run FastAPI and call our script. We'll expose the script on port 82
CMD ["fastapi", "run", "main.py", "--port", "82"]
