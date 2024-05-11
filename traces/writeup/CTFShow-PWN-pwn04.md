---
title: CTFShow pwn04
layout: doc
---

# {{$frontmatter.title}}
[[toc]]

> 题目链接：https://ctf.show/challenges#pwn04-65

## 基础分析
```zsh
┌──(kali㉿kali)-[~/win/Downloads]
└─$ file ex2
ex2: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=6109b31b5fb5bcbef1eb882cf8d59afb93900352, not stripped

┌──(kali㉿kali)-[~/win/Downloads]
└─$ checksec --file=ex2
[*] '/home/kali/win/Downloads/ex2'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```
可以看到 是 32位小端序，开启了栈保护，和栈不可执行（无法写入shellcode）

## ida
![alt text](/images/image-25.png)

存在getshell函数

![alt text](/images/image-26.png)
存在printf格式化漏洞，

可以泄露canary地址，重写canary和getshell地址

可以看到vuln函数存在printf

> 要查看vuln里的 canary地址，也就是ebp+varC
```asm{3,34}
.text:0804862E var_74          = dword ptr -74h
.text:0804862E buf             = byte ptr -70h
.text:0804862E var_C           = dword ptr -0Ch
.text:0804862E
.text:0804862E                 push    ebp
.text:0804862F                 mov     ebp, esp
.text:08048631                 sub     esp, 78h
.text:08048634                 mov     eax, large gs:14h
.text:0804863A                 mov     [ebp+var_C], eax
.text:0804863D                 xor     eax, eax
.text:0804863F                 mov     [ebp+var_74], 0
.text:08048646                 jmp     short loc_8048671
.text:08048648 ; ---------------------------------------------------------------------------
.text:08048648
.text:08048648 loc_8048648:                            ; CODE XREF: vuln+47↓j
.text:08048648                 sub     esp, 4
.text:0804864B                 push    200h            ; nbytes
.text:08048650                 lea     eax, [ebp+buf]
.text:08048653                 push    eax             ; buf
.text:08048654                 push    0               ; fd
.text:08048656                 call    _read
.text:0804865B                 add     esp, 10h
.text:0804865E                 sub     esp, 0Ch
.text:08048661                 lea     eax, [ebp+buf]
.text:08048664                 push    eax             ; format
.text:08048665                 call    _printf
.text:0804866A                 add     esp, 10h
.text:0804866D                 add     [ebp+var_74], 1
.text:08048671
.text:08048671 loc_8048671:                            ; CODE XREF: vuln+18↑j
.text:08048671                 cmp     [ebp+var_74], 1
.text:08048675                 jle     short loc_8048648
.text:08048677                 nop
.text:08048678                 mov     eax, [ebp+var_C]
.text:0804867B                 xor     eax, large gs:14h
.text:08048682                 jz      short locret_8048689
.text:08048684                 call    ___stack_chk_fail
```

## gdb 调试
```zsh{41,44,84}
┌──(kali㉿kali)-[~/win/Downloads]
└─$ gdb ex2
gdb-peda$ disassemble vuln
Dump of assembler code for function vuln:
=> 0x0804862e <+0>:     push   ebp
   0x0804862f <+1>:     mov    ebp,esp
   0x08048631 <+3>:     sub    esp,0x78
   0x08048634 <+6>:     mov    eax,gs:0x14
   0x0804863a <+12>:    mov    DWORD PTR [ebp-0xc],eax
   0x0804863d <+15>:    xor    eax,eax
   0x0804863f <+17>:    mov    DWORD PTR [ebp-0x74],0x0
   0x08048646 <+24>:    jmp    0x8048671 <vuln+67>
   0x08048648 <+26>:    sub    esp,0x4
   0x0804864b <+29>:    push   0x200
   0x08048650 <+34>:    lea    eax,[ebp-0x70]
   0x08048653 <+37>:    push   eax
   0x08048654 <+38>:    push   0x0
   0x08048656 <+40>:    call   0x8048430 <read@plt>
   0x0804865b <+45>:    add    esp,0x10
   0x0804865e <+48>:    sub    esp,0xc
   0x08048661 <+51>:    lea    eax,[ebp-0x70]
   0x08048664 <+54>:    push   eax
   0x08048665 <+55>:    call   0x8048440 <printf@plt>
   0x0804866a <+60>:    add    esp,0x10
   0x0804866d <+63>:    add    DWORD PTR [ebp-0x74],0x1
   0x08048671 <+67>:    cmp    DWORD PTR [ebp-0x74],0x1
   0x08048675 <+71>:    jle    0x8048648 <vuln+26>
   0x08048677 <+73>:    nop
   0x08048678 <+74>:    mov    eax,DWORD PTR [ebp-0xc]
   0x0804867b <+77>:    xor    eax,DWORD PTR gs:0x14
   0x08048682 <+84>:    je     0x8048689 <vuln+91>
   0x08048684 <+86>:    call   0x8048450 <__stack_chk_fail@plt>
   0x08048689 <+91>:    leave
   0x0804868a <+92>:    ret
End of assembler dump.

gdb-peda$ b *0x08048665 # 在printf处下断点, 为什么在这里？因为是要用printf泄露，到时候是从栈里开始泄露
Breakpoint 2 at 0x8048665

gdb-peda$ x $ebp-0x0C
0xffffd2cc:     0xb90a1300

gdb-peda$ stack 50
0000| 0xffffd230 --> 0xffffd248 ("aaaa\n") # 栈顶
0004| 0xffffd234 --> 0xffffd248 ("aaaa\n")
0008| 0xffffd238 --> 0x200
0012| 0xffffd23c --> 0xf7c7f3f3 (<_IO_new_file_overflow+275>:   add    esp,0x10)
0016| 0xffffd240 --> 0xf7e1eda0 --> 0xfbad2887
0020| 0xffffd244 --> 0x0
0024| 0xffffd248 ("aaaa\n")
0028| 0xffffd24c --> 0xa ('\n')
0032| 0xffffd250 --> 0x1
0036| 0xffffd254 --> 0x0
0040| 0xffffd258 --> 0xf7c7ff29 (<__GI___overflow+9>:   add    ebx,0x19e0cb)
0044| 0xffffd25c --> 0xf7e1ca40 --> 0x0
0048| 0xffffd260 --> 0xd ('\r')
0052| 0xffffd264 --> 0xf7e1dff4 --> 0x21dd8c
0056| 0xffffd268 --> 0xffffd2a8 --> 0xffffd2d8 --> 0x0
0060| 0xffffd26c --> 0xf7c7344b (<__GI__IO_puts+523>:   add    esp,0x10)
0064| 0xffffd270 --> 0xf7e1eda0 --> 0xfbad2887
0068| 0xffffd274 --> 0xa ('\n')
0072| 0xffffd278 --> 0xd ('\r')
0076| 0xffffd27c --> 0xf7c7a770 (<setbuf>:      sub    esp,0x10)
0080| 0xffffd280 --> 0xf7e1e620 --> 0xfbad208b
0084| 0xffffd284 --> 0x804a064 --> 0xf7e1eda0 --> 0xfbad2887
0088| 0xffffd288 --> 0xd ('\r')
0092| 0xffffd28c --> 0xf7e1eda0 --> 0xfbad2887
0096| 0xffffd290 --> 0xffffd2d8 --> 0x0
--More--(25/50)
0100| 0xffffd294 --> 0xf7fdbe80 (<_dl_runtime_resolve+16>:      pop    edx)
0104| 0xffffd298 --> 0xf7e1f9ac --> 0x0
0108| 0xffffd29c --> 0xf7e1dff4 --> 0x21dd8c
0112| 0xffffd2a0 --> 0x80486e0 (<__libc_csu_init>:      push   ebp)
0116| 0xffffd2a4 --> 0xf7ffcba0 --> 0x0
0120| 0xffffd2a8 --> 0xffffd2d8 --> 0x0
0124| 0xffffd2ac --> 0xb90a1300
0128| 0xffffd2b0 --> 0x8048768 ("Hello Hacker!")
0132| 0xffffd2b4 --> 0x0
0136| 0xffffd2b8 --> 0xffffd2d8 --> 0x0
0140| 0xffffd2bc --> 0x80486c1 (<main+54>:      mov    eax,0x0)
0144| 0xffffd2c0 --> 0xf7c216ac --> 0x21e04c
0148| 0xffffd2c4 --> 0xf7fd9e61 (<_dl_fixup+225>:       mov    DWORD PTR [esp+0x28],eax)
0152| 0xffffd2c8 --> 0xf7c1c9a2 ("_dl_audit_preinit")
0156| 0xffffd2cc --> 0xb90a1300 # canary的值
0160| 0xffffd2d0 --> 0xffffd300 --> 0xf7e1dff4 --> 0x21dd8c
0164| 0xffffd2d4 --> 0xffffd2f0 --> 0x1
0168| 0xffffd2d8 --> 0x0
0172| 0xffffd2dc --> 0xf7c237c5 (<__libc_start_call_main+117>:  add    esp,0x10)
0176| 0xffffd2e0 --> 0x1
0180| 0xffffd2e4 --> 0x0
0184| 0xffffd2e8 --> 0x78 ('x')
0188| 0xffffd2ec --> 0xf7c237c5 (<__libc_start_call_main+117>:  add    esp,0x10)
0192| 0xffffd2f0 --> 0x1
0196| 0xffffd2f4 --> 0xffffd3a4 --> 0xffffd512 ("/home/kali/win/Downloads/ex2")
--More--(50/50)
```
canary 位置就是在 

构造泄露 payload 

canary地址 - 栈底

0xffffd2cc - 0xffffd230 = 156

因为是 32 位 所以是 156/4 = 39

> %39$p

## exp
**32 **

- 这是32位， 64还是不清楚
- 栈底地址
- canary地址
- 返回地址

- 他们间的 偏移