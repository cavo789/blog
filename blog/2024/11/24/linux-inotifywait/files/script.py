def signal_handler(sig, frame):
    print('Stop')
    exit(0)

signal.signal(signal.SIGINT, signal_handler)

# We'll put files in our application out folder
folder : Path = Path("/app/out/")

folder.mkdir(parents=True, exist_ok=True)

counter : int = 0

while True:
    file : Path = folder.joinpath(os.path.basename(tempfile.mktemp()))
    print(file.absolute())

    with open(file, 'w') as f:
        pass

    counter += 1

    print(f"{counter} files have been created.")

    time.sleep(1)
