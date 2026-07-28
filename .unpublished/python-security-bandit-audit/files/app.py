import subprocess

DB_PASSWORD = "hunter2"


def run_backup(filename):
    subprocess.run(f"tar -czf backup.tar.gz {filename}", shell=True)
