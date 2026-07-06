---
name: ParsedGui example
---

# ParsedGui example

`ParsedGui` lets you define an entire inventory GUI in a YAML config file — items, slots, click actions, open/close hooks, and placeholders — with no boilerplate code.

#### YAML structure

```yaml
id: my_gui
title: "<gold>My Shop"
size: 54          # must be a multiple of 9

on_open:          # optional — action list to run when GUI opens
  - "[sound] UI_BUTTON_CLICK;1;1"

on_close:         # optional — action list to run when GUI closes
  - "[message] <gray>Closed the shop."

Items:
  my_item:
    material: DIAMOND
    slot: 13                    # single slot
    display_name: "<aqua>Buy Diamond"
    lore:
      - ""
      - " <gray>Click to purchase"
      - ""
    on_click:
      any:                      # fires on every click type
        - "[sound] UI_BUTTON_CLICK;1;1"
        - "[player] buy diamond"
      left:                     # fires only on left click
        - "[message] <green>Left clicked!"
      shift_left:
        - "[message] <yellow>Shift+Left!"
```

**Supported click types:** `any`, `left`, `shift_left`, `right`, `shift_right`, `middle`, `drop`, `control_drop`, `double`

**Slot formats:**

```yaml
slot: 13              # single slot
slots:
  - '0-8'             # range
  - '45-53'           # another range
  - '27'              # single inside a list
```

***

#### Opening from code

```java
// From a FileConfiguration:
FileConfiguration config = YamlConfiguration.loadConfiguration(file);
new ParsedGui(player, config, myPlugin).open(player);

// From a pre-parsed Gui record (more efficient for many players):
Gui gui = ...; // parsed once at startup
new ParsedGui(player, gui, myPlugin).open(player);
```

***

#### Runtime placeholders

Use `setReplace()` to inject values into display names, lore, and action lines at runtime. Call it **before** `open()` — items are built on open.

```java
ParsedGui gui = new ParsedGui(player, config, myPlugin);
gui.setReplace("%price%", "500")
   .setReplace("%item_name%", "Diamond Sword");
gui.open(player);
```

In YAML:

```yaml
display_name: "<white>Price: <green>$%price%"
lore:
  - " <gray>Item: <white>%item_name%"
```

PlaceholderAPI placeholders (`%papi_placeholder%`) are applied automatically — no extra setup needed.

***

#### Click handlers from code

Register Java-side click logic for items by their YAML section key. Runs **in addition** to whatever `on_click` is defined in YAML.

```java
ParsedGui gui = new ParsedGui(player, config, myPlugin);

gui.addClickHandler("my_item", event -> {
    Player clicker = (Player) event.getWhoClicked();
    clicker.sendMessage("You clicked my_item!");
    gui.refresh();
});

gui.open(player);
```

***

#### Passing the GUI into actions via ActionContext

When a player clicks an item, `ParsedGui` puts itself into the `ActionContext` automatically. Inside a custom action you can retrieve it:

```java
ActionRegistry.register("myplugin", "my_action", (ctx, text) -> {
    ParsedGui gui = ctx.get(ParsedGui.class);
    if (gui == null) return;

    // do something, then refresh
    gui.refresh();
});
```

In config:

```yaml
on_click:
  any:
    - "[myplugin:my_action]"
```

***

#### Slot priority & view\_requirements

Multiple items can target the same slot. The one with the lowest `priority` value whose `view_requirements` all pass wins. This is useful for conditional items — e.g. show a locked version until the player has enough money.

```yaml
Items:
  buy_locked:
    material: RED_STAINED_GLASS_PANE
    slot: 13
    priority: 1
    display_name: "<red>Not enough money"
    view_requirements:
      - "%vault_eco_balance% < 100"   # shown when balance < 100

  buy_unlocked:
    material: EMERALD
    slot: 13
    priority: 2                        # fallback — shown when locked item's requirement fails
    display_name: "<green>Buy"
```

`view_requirements` supports `==`, `!=`, `>=`, `<=`, `>`, `<` with both numbers and strings. PlaceholderAPI placeholders are resolved before comparison.

***

#### Refreshing the GUI

Call `refresh()` to clear and rebuild all items — re-evaluates `view_requirements` and re-applies all placeholders.

```java
gui.refresh();
```

Typically called inside a click handler after state changes:

```java
gui.addClickHandler("toggle", event -> {
    toggleSomething(player);
    gui.refresh();
});
```

***

#### Extending ParsedGui

You can subclass `ParsedGui` to add custom inventory slots, override rendering logic, etc.

> ⚠️ `super(viewer, config, plugin)` calls `buildItems()` internally during construction — before your subclass fields are initialized. Override `buildItems()` with a null-check guard:

```java
public class MyGui extends ParsedGui {

    private final MyPlugin plugin;

    public MyGui(Player viewer, FileConfiguration config, MyPlugin plugin) {
        super(viewer, config, plugin);
        this.plugin = plugin;
        // your init here
    }

    @Override
    public void buildItems(List<Item> items) {
        if (plugin == null) {          // guard: called from super() before our fields exist
            super.buildItems(items);
            return;
        }
        // your custom logic, then:
        super.buildItems(items);
    }

    @Override
    public void refresh() {
        // update your replacements before items are rebuilt
        setReplace("%score%", String.valueOf(getScore()));
        super.refresh();
    }
}
```

<br>
