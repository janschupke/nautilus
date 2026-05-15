# nmap

## Params

```bash
-sP # ping scan
-sT # full tcp connect open scan
-sS # syn scan / stealth
-sO # protocol scan

-O # OS detection
-A # OS, versions etc
-D <ip> # duplicate traffic with decoy source ip
```

## Examples

```bash
nmap network/netmask # network scan
nmap host # host scan
nmap --script vuln <host>
nmap -sT -p 80,443 net/mark # scan for open ports
...
```
