**SQUID parser WEB UI**

This is a simple SQUID proxy server logs parser with friendly WEB UI

**USAGE**

Just clone this repo and run docker-compose up comand

```
docker-compose up -d
```

**Proxy settings**

By defaults there is some demo users in ***./proxy/start_proxy.sh*** file

```
htpasswd -b -c /etc/squid/passwords ivanov ivanov
htpasswd -b /etc/squid/passwords petrov petrov
htpasswd -b /etc/squid/passwords sidorov sidorov
htpasswd -b /etc/squid/passwords egorov egorov
htpasswd -b /etc/squid/passwords antonova antonova
htpasswd -b /etc/squid/passwords pavlova pavlova
htpasswd -b /etc/squid/passwords sokolova sokolova
```

You can manage this shell script or setup any othe squid integration to get proxy users list.