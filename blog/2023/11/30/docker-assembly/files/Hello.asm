; Our data section (i.e. our variables)
SECTION .data
    ; Our null terminated string
    hello: db 'Hello, World! This message comes from Docker.', 0

; Our entry point
SECTION .text
    global _start

_start:
    mov edx, 45    ; 45 is the length of our "hello" message
    mov ecx, hello ; The name of our variable is "hello"
    mov ebx, 1     ; We'll write to stdout
    mov eax, 4     ; System call number (sys_write)
    int 0x80       ; Triggers software interrupt 80

    mov ebx, 0     ; Next three lines are equivalent to exit 0
    mov eax, 1
    int 0x80
