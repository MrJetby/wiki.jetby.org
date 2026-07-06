---
name: AdvancedGui example
---

# AdvancedGui example

Example gui

```java
public class GuiTest extends AdvancedGui {
    public GuiTest() {
        super("Gui title");
        setItem("example", ItemWrapper.builder(Material.STONE)
                .slots(1, 5, 7)
                .displayName(Component.text("This is the name dude"))
                .onClick(event -> {
                    event.setCancelled(true);
                    player.sendMessage("Clicked on slot: " + event.getSlot());
                })
                .build());
    }
}
```

Open gui

```java
new GuiTest().open(player);
```
