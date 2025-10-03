def greet_user(name):
    print(f"Hello, {name}! Welcome to the Python world.")

def main():
    name = input("What's your name? ")
    if name.strip():
        greet_user(name)
    else:
        print("You didn't enter a name. Try again!")

if __name__ == "__main__":
    main()
