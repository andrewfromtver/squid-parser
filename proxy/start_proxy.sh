#!/bin/bash

# proxy users
htpasswd -b -c /etc/squid/passwords ivanov ivanov
htpasswd -b /etc/squid/passwords petrov petrov
htpasswd -b /etc/squid/passwords sidorov sidorov
htpasswd -b /etc/squid/passwords egorov egorov
htpasswd -b /etc/squid/passwords antonova antonova
htpasswd -b /etc/squid/passwords pavlova pavlova
htpasswd -b /etc/squid/passwords sokolova sokolova

# check log files
touch /var/log/squid/access.log
touch /var/log/squid/cache.log
chown -R proxy:proxy /var/log/squid

# start squid proxy service
service squid start

# container keepalive tail
tail -f /var/log/squid/access.log
