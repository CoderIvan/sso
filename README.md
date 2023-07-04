# sso

无登录时的重定向
```
https://github.com/login?client_id=0625d398dd9166a196e9&return_to=%2Flogin%2Foauth%2Fauthorize%3Fclient_id%3D0625d398dd9166a196e9%26redirect_uri%3Dhttps%253A%252F%252Fcnodejs.org%252Fauth%252Fgithub%252Fcallback%26response_type%3Dcodhttps://github.com/login
```
```
https://github.com/login
?
client_id=0625d398dd9166a196e9
&return_to=
  /login/oauth/authorize
    ?
    client_id=0625d398dd9166a196e9
    &redirect_uri=https://cnodejs.org/auth/github/callback
    &response_type=code
```