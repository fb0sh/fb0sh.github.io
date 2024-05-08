---
title: HTTP常见绕过请求头
layout: doc
---
# {{$frontmatter.title}}
[[toc]]

## 使用Curl
> 可以直观的看到响应和请求

```zsh
curl -v https://123123.123.123.1
curl -v -X POST -d "name=123" https://123123.123.123.1
curl -v -x POST -H "Referer: https://123123.123.123.1" https://123123.123.123.1
```

## 绕过IP类
```zsh
X-Forwarded-For
X-remote-IP
X-remote-addr
X-Real-Ip
X-Client-Ip
x-originating-iP
```

## 伪造Refer

```zsh
Referer: https://123123.123.123.1
```