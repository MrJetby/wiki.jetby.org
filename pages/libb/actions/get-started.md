---
priority: 10000
name: Get started
---

***
Actions are a list of commands that run when a specific event happens (for example, a slot click in a GUI, a command being used, a trigger firing, etc.).

Each command in the list can be either **simple** or **conditional** — and you can freely mix them in any order, as many times as you like.

### Simple command
Just a string that always runs, no conditions attached:
```yaml
- '[message] Hello!'
```

### Conditional command (`if/then/else`)
This is a command with a condition: if the condition is true, one set of commands runs; if not, another one does:
```yaml
- my_check:
    if: "10 > 5"
    then:
      - '[message] yes'
    else:
      - '[message] no'
```
> The name (`my_check`) can be anything you want — it doesn't affect behavior, it's just there for readability.\
> The `else` branch is optional — if the condition is false and there's no `else`, nothing happens.

***
### Mixing commands
Simple and conditional commands can be combined in the same list however you like:
```yaml
actions:
  - '[message] clicked'     # simple — always runs
  - example_check:          # conditional — depends on if
      if: "10 > 15"
      then:
        - '[message] nice'
      else:
        - '[message] not nice'
  - '[message] after check' # runs after the check, as usual
```
All commands in a list run **sequentially, top to bottom**, regardless of whether they're simple or conditional.