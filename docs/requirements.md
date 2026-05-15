# Module content requirements

Use this document when creating or auditing module content.

## Exercise format

- Prefer real system files over arbitrary lab fixtures. Where the system provides a deterministic file (logs, configs, `/etc/passwd`, `/var/log/auth.log`), use it. Only use seeded fixtures when natural system file usage is awkward or the question requires controlled data.
- Fixtures can be seeded anywhere on the host, not just the home directory. Discoverable files add realism.
- Questions within a module should build on each other.
- Modules increase in complexity sequentially. Later questions should be CTF-style discovery tasks rather than single-command drills.
- Modules must be self-contained — no dependency on another module's outcomes or host state changes.
- Structure each module to showcase the most important practical usage of the tool, not classroom-style parameter walkthroughs.
- No fixed question count; 10 is a guideline, not a limit.

## Question prompt rules

**Do:**
- Ask for a derived value that requires the learner to find and reason about data.
- Name specific files when the exercise is about processing, not discovery.
- Use CTF-style questions at the end of each module — finding a flag, extracting a hidden value, identifying an anomaly.

**Don't:**
- Include the command or flag required to answer in the prompt.
- Write questions that only need copy-paste of the shown command.
- Give exact file paths when the point of the question is finding the file.

**Examples (style templates, not copy-paste):**

| Good | Bad |
|---|---|
| How many users on the system contain a certain letter? | Run `grep X /etc/passwd` and paste the output. |
| Which IP has the most entries in the access log? | Use `awk '{print $1}'` on `access.log` and find the top IP. |
| How many errors appear in the log? | Run `grep -c ERROR app.log`. |
| What is the sum of a specific field in the CSV? | Use `awk -F, '{sum+=$3}'` on `data.csv` and report the sum. |
| Find the flag hidden somewhere on the host. | The flag is in `/home/isopod/labs/module/flag.txt` — cat it. |

## Data and naming

- Example data should look real: Apache logs, CSV exports, JSON API responses, env files, network captures.
- Prefer networking, sysadmin, and cybersecurity themes for invented values and hostnames.
