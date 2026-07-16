---
name: Parsed Gui
priority: 997
---

# Introduction
`ParsedGui` is your friend, and a way to save time.
Imagine this scenario: you just hand a plain YAML file to the plugin, and it builds a GUI out of it.
Convenient, isn't it?
And I'll tell you more — you can not only turn YAML into a full InventoryHolder,
you can also change the logic behind how the GUI gets built.

Say you've built a GUI straight from a YAML file, but you want to add some custom placeholder or custom click logic on an item.
All of that is possible with ParsedGui.

---
Let's start with this: `ParsedGui` itself is a `PaginatedGui`, which in turn is an `AdvancedGui`.
So the chain looks like this: `ParsedGui -> PaginatedGui -> AdvancedGui -> InventoryHolder`.

In practice you don't need to fully understand all of them — it's enough to know that `AdvancedGui` gives us `open(player)`, and that's about it.
But if you need pagination, then you do need to look into `PaginatedGui`.

---
To get familiar with the YAML structure, go [here](/libb/guis/get-started).
# Getting started
Creating a GUI comes down to two approaches:
1. Through a Configuration (file.yml)
```java
// Keep in mind your config still gets parsed into a `Gui` object either way.
// From a FileConfiguration:
FileConfiguration config = YamlConfiguration.loadConfiguration(file);
new ParsedGui(player, config, myPlugin).open(player);
```
2. Through a ready-made `Gui` object
```java
// From a pre-parsed Gui record (more efficient, recommended for big servers):
Gui gui = new Gui(
            config.getString("id"),
            applyPlaceholders(config.getString("title")),
            config.getInt("size"),
            config.getStringList("command"),
            ActionUtil.getExpressions(applyPlaceholders(config.getStringList("open_requirements"))),
            ActionUtil.getActionBlock(config, "on_open"),
            ActionUtil.getActionBlock(config, "on_close"),
            ParseUtil.getItems(config)
        ); // parsed once at startup
new ParsedGui(player, gui, myPlugin).open(player);
```
# Runtime placeholders
Use setReplace() to inject values into display names, lore, and action lines at runtime. Call it before open() — items are built on open.

1. Global placeholders
```java
ParsedGui gui = new ParsedGui(player, config, myPlugin);
gui.setReplace("{price}", "500")
   .setReplace("%item_name%", "Diamond Sword");
gui.open(player);
```

In YAML:
```yaml

display_name: "<white>Price: <green>${price}"
lore:
  - " <gray>Item: <white>%item_name%"
```
PlaceholderAPI placeholders (%papi_placeholder%) are applied automatically — no extra setup needed.

2. Individual placeholders
```java
public class MyGui extends ParsedGui {

    public MyGui(@NotNull Player viewer, @NotNull Gui guiDefinition, JavaPlugin plugin) {
        super(viewer, guiDefinition, plugin);

        setReplace("{material_name}", item -> {
            return item.material().name();
        });
    }
}
```

3. Per-item placeholders
```java
public class MyGui extends ParsedGui {

    public MyGui(@NotNull Player viewer, @NotNull Gui guiDefinition, JavaPlugin plugin) {
        super(viewer, guiDefinition, plugin);

        List<Item> itemList = getBySectionOption("");
        itemList.forEach(item -> {
            setReplace(item, "{amount}", String.valueOf(item.amount()));
        });
    }

    @Override
    public void buildItems(List<Item> items) {
        for (Item item : items) {
            setReplace(item, "{amount}", String.valueOf(item.amount()));
        }
        super.buildItems(items);
    }
}
```

# Click handlers from code
Register Java-side click logic for items by their YAML section key. Runs in **addition** to whatever `on_click` is defined in YAML.
```java
ParsedGui gui = new ParsedGui(player, config, myPlugin);

gui.addClickHandler("my_item", event -> {
    Player clicker = (Player) event.getWhoClicked();
    clicker.sendMessage("You clicked my_item!");
    gui.refresh();
});

gui.open(player);
```

# Extending ParsedGui
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

> If you extend the `ParsedGui` class, the `[refresh]` action won't work out of the box.
To fix that, override `[refresh]` yourself:
```java
ActionRegistry.override("your_plugin_name", "refresh", (ctx, input) -> {
    MyGui gui = ctx.get(MyGui.class);
    if (gui == null) return;
    gui.refresh();
});
```