# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.1.x   | Yes       |
| < 1.1   | No        |

## Reporting a Vulnerability

Do not open a public GitHub issue for security vulnerabilities.

Report vulnerabilities privately through GitHub Security Advisories:

https://github.com/mastermunj/to-numbers/security/advisories/new

Response targets:

- Acknowledge new reports within 48 hours
- Share an initial triage update and expected remediation direction within 5 business days
- Publish a patch release and coordinated disclosure once a fix is ready

## Scope

| In scope | Examples                                                                              |
| -------- | ------------------------------------------------------------------------------------- |
| Yes      | Prototype pollution, ReDoS, crafted-input denial of service, arbitrary code execution |
| Yes      | Supply-chain issues affecting published artifacts or release automation               |
| No       | Incorrect locale parsing for a specific input                                         |
| No       | Missing locale support, documentation bugs, or feature requests                       |

If you are unsure whether something is a security issue, report it privately and include a minimal reproduction.
