section .data
    msg db 'Hello, world!', 0Ah
section .text
    global _start
_start:
    mov edx, 13
