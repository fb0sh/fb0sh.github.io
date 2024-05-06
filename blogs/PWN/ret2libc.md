---
title: ret2libc
layout: doc
---
[[toc]]

## libc 相关知识
### 计算libc基地址
> 基地址：每次运行程序加载函数时，函数的基地址都会发生改变。这是一种地址随机化的保护机制，导致函数的真实地址每次运行都是不一样的。

> 这次运行程序的基地址 = 这次运行得到的某个函数func的真实地址  - 函数func的偏移地址 “这次！！”


libc_offset_puts 可以由pwntools的 libc.symbols['puts'] 获得 

函数的真实地址   =   libc基地址   +   偏移地址 

libc_base   = real_func - libc_offset_func

system_addr = libc_base - libc_offset_system

puts_addr   = libc_base - libc_offset_puts
### 获取plt表或者got表里的 偏移地址
```py
elf = ELF("file")
elf.plt['puts']
elf.got['puts']
```
### 通过puts打印出puts的真实地址
> 像puts(),write()这样的函数可以打印内容，我们可以直接利用这些打印函数，打印出某个函数的真实地址（即got表中存放的地址）
```py
puts_plt = elf.plt['puts']
puts_got = elf.got['puts']
ret_addr = 0xdeadbeef
# payload = b'A' * padding + p32(puts_plt) + p32(ret_addr) + p32(puts_got)
# 调用plt里的puts打印出got里的puts got里面是真实的地址 也就是 real_puts
```
> 64 位

### 通过puts计算出 libc_base
### 32位 传入参数 
填充字符 + 要跳转的函数 + 随便的函数地址 + 要跳转函数的参数

### 64位 传入参数