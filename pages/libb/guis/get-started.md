---
name: Get Started
priority: 999
---

# Getting Started

A GUI file consists of several sections:

- `command` — commands that open this GUI.
- `on_open` — actions executed when the GUI is opened.
- `on_close` — actions executed when the GUI is closed.
- `Items` — all items displayed inside the GUI.

---

# Open Command

Use the `command` section to register commands that open this GUI.

```yaml
command:
  - example1
  - example2
```

The example above allows the GUI to be opened using either `/example1` or `/example2`.

---

# Open Actions

The `on_open` section runs actions immediately after the GUI is opened.

```yaml
on_open:
  - "[message] GUI opened"

  - example_check:
      if: "10 > 15"
      then:
        - "[message] Condition is true"
      else:
        - "[message] Condition is false"
```

Actions are executed from top to bottom.

You can use any action supported by the action system.

Learn more about actions [here](/libb/actions/get-started).

---

# Close Actions

The `on_close` section works the same way as `on_open`, but is executed when the player closes the GUI.

```yaml
on_close:
  - "[message] GUI closed"
```

---

# Items

All GUI items are declared inside the `Items` section.

```yaml
Items:
  example:
    material: STONE
    amount: 1
    slot: 11
    priority: 1
    display_name: "Example Item"

    lore:
      - "First line"

    flags:
      - HIDE_ATTRIBUTES

    view_requirements:
      - "player.level >= 5"

    on_click:
      any:
        - "[message] Clicked"

      left:
        - "[message] Left click"
```

## Item Properties

### material

The Bukkit material used for the item.

```yaml
material: STONE
```

Support for base64 heads. Use `basehead-ID`
Exmaple:
```yaml
material: basehead-eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYjU5YmUwYjQ2NTJjM2ZiZjRiNjZlY2M5ZTc0MzI3MWJiZDY2NmIwNDRmNTIxMTgwMDMzMjVkYTIxMzBjZmZkNSJ9fX0=
```
You can find out custom heads here: [minecraft-heads.com](https://minecraft-heads.com/)

---

### amount

The stack size.

```yaml
amount: 1
```

Maximum amount is `64` for Spigot and `99` for Paper
{% tabs %}
{% tab title="Spigot (64)" %}
<p align="center">
  <img src="/assets/spigot-max-amount.png">
</p>
{% endtab %}
{% tab title="Paper (99)" %}
<p align="center">
  <img src="/assets/paper-max-amount.png">
</p>
{% endtab %}
{% endtabs %}


---

### slot

The inventory slot where the item will be placed.

```yaml
slot: 11
```

You can use either `slots` or `slot` for multiple slots—it makes no difference:
```yaml
slots:
  - 10-13
  - 14,15
  - 16
```

---

### priority

Used when multiple items target the same slot.

The item with the highest priority is displayed.

```yaml
priority: 10
```

---

### display_name

Sets the item's display name.

```yaml
display_name: "Example"
```

---

### lore

A list of lore lines.

```yaml
lore:
  - "Line 1"
  - "Line 2"
```

---

### flags

Applies Bukkit `ItemFlags`.

```yaml
flags:
  - HIDE_ATTRIBUTES
  - HIDE_ENCHANTS
```

---

### view_requirements

Conditions that determine whether the item is visible.

```yaml
view_requirements:
  - "player.level >= 5"
```

If any requirement fails, the item is not shown.

---

### on_click

Actions executed when the player clicks the item.

**List of all availiable clicks** [here](https://jd.papermc.io/paper/26.2/org/bukkit/event/inventory/ClickType.html)

Example:

```yaml
on_click:
  any:
    - "[message] Clicked"

  left:
    - "[message] Left click"

  right:
    - "[message] Right click"
```

Each click type accepts a list of actions, including conditional actions.

```yaml
on_click:
  any:
    - example_check:
        if: "player.level >= 10"
        then:
          - "[message] Welcome!"
        else:
          - "[message] Level too low."
```