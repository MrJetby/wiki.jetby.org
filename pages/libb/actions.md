---
name: Actions Usage
priority: 999
---

# Actions

***

### Actions

Actions are a list of commands that execute when a specific event occurs (e.g., a slot click). Each command can be either **simple** or **conditional** — and you can mix them freely in any order.

#### Simple command

Just a string — always executes:

```yaml
- '[message] Hello!'
```

#### Conditional command (`if/then/else`)

An object with a condition — executes based on the result:

```yaml
- my_check:
    if: "10 > 5"
    then:
      - '[message] yes'
    else:
      - '[message] no'
```

> The name (`my_check`) is arbitrary and only serves as a label for readability.\
> The `else` branch is optional.

***

#### Mixing commands

Simple and conditional commands can be **mixed in any order**, any number of times:

```yaml
on_click:
  any:
    - '[message] clicked'     # simple — always runs
    - example_check:          # conditional — depends on if
        if: "10 > 15"
        then:
          - '[message] nice'
        else:
          - '[message] not nice'
    - '[message] after check' # continues normally after
```

All commands in a list execute **sequentially top to bottom**, regardless of whether they are simple or conditional.

***

#### Click types

Keys inside `on_click` define **which type of click** triggers that action list:

| Key                          | Triggers on         |
| ---------------------------- | ------------------- |
| `any`                        | Any click           |
| `left`                       | Left mouse button   |
| `right`                      | Right mouse button  |
| `middle`                     | Middle mouse button |
| `shift_left` / `shift_right` | Shift + click       |
| `drop`                       | Drop                |
| `control_drop`               | Ctrl + Drop         |
| `window_border_left`         | Window border left  |
| `window_border_right`        | Window border right |

Multiple types can be declared at once — they are fully independent:

```yaml
on_click:
  any:
    - '[message] clicked'
  left:
    - '[message] clicked left'
```
