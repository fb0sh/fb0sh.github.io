---
title: ret2csu
layout: doc
---
# {{$frontmatter.title}}
[[toc]]

在64位程序中，当函数参数少于7个时， 参数从左到右放入寄存器: rdi, rsi, rdx, rcx, r8, r9

在大多时候下，当参数过多的时候，我们很难找到部署寄存器值的gadget。

不过还有一些万能gadget能被我们利用，__libc_csu_init这个函数是用来对libc进行初始化操作的

而 __libc_csu_init 则有很多gadget