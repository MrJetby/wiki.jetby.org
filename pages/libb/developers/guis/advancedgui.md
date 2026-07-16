---
priority: 999
name: Advanced Gui
---

AdvancedGui is an improved InventoryHolder that makes it easier for beginners to get into creating GUIs in Minecraft, and for more advanced users it's a way to save some nerves.

Start by creating a class:
```java
public class ShopGui extends AdvancedGui {

    public ShopGui() {
        super("Simple shop", 54);
    }
}
```

Before creating your first item, you need to know what an `ItemWrapper` is.
ItemWrapper is the input data that gets assembled into a regular ItemStack on output — basically a compact way to create ItemStack objects.

To create an item with just a custom name using ItemStack, you'd have to do this:
```java
ItemStack itemStack = new ItemStack(Material.DIAMOND);
ItemMeta itemMeta = itemStack.getItemMeta();
itemMeta.setDisplayName("Magic diamond");
itemStack.setItemMeta(itemMeta);
```
But with ItemWrapper, that pain goes away.
```java
ItemWrapper wrapper = new ItemWrapper(Material.DIAMOND);
wrapper.setDisplayName("Magic diamond");
```
Or like this:
```java
ItemWrapper wrapper = ItemWrapper.builder(Material.DIAMOND)
                .setDisplayName("Magic diamond")
                .build();
```

In the example I showed `setDisplayName()`, but if you don't hook up a serializer, there won't be any colors.
So either use a built-in serializer, create your own, or set an already-built component.

But adding a serializer every single time isn't very convenient, so you can set it once when creating the GUI, like this:
```java
public class ShopGui extends AdvancedGui {

    public ShopGui() {
        super("Simple shop", 54);

        defaultSerializer = Serializer.UNIFIED;

    }
}
```

And that's it — now colors will be applied to all your items automatically.

## Creating an item
Okay, say you've created an item — now how do you actually put it into the GUI? For that, use the `setItem()` method — yeah, it's that simple.

Here's what the full piece of code would look like:
```java

public class ShopGui extends AdvancedGui {

    public ShopGui() {
        super("Simple shop", 54);

        defaultSerializer = Serializer.UNIFIED;

        setItem("magic_diamond", ItemWrapper.builder(Material.DIAMOND)
                .slots(13)
                .setDisplayName("&cMagic diamond")
                .build());

    }
}

```

It's important to specify `slots()`, otherwise the item won't show up in the GUI.

Right now you have a completely ordinary item in the GUI, which a viewer could even steal into their own inventory.

Let's fix that stealing problem first — for this, use `lockEmptySlots()`.
For example:
```java
    public ShopGui() {
        super("Simple shop", 54);

        defaultSerializer = Serializer.UNIFIED;

        lockEmptySlots(true);

        // etc...
    }
```
Now all slots will be locked by default.

## Now let's implement the purchase logic:
```java
setItem("magic_diamond", ItemWrapper.builder(Material.DIAMOND)
    .slots(13)
    .setDisplayName("&cMagic diamond")
    .onClick(event -> {
        Player player = (Player) event.getWhoClicked();
        if (!player.getInventory().contains(Material.GOLD_INGOT, 10)) {
            player.sendMessage(defaultSerializer.deserialize("&c&lYou need at least 10 golden ingots to shop"));
            return;
        }
        player.getInventory().remove(new ItemStack(Material.GOLD_INGOT, 10));
        ItemStack item = new ItemStack(Material.DIAMOND);
        ItemMeta meta = item.getItemMeta();
        meta.displayName(defaultSerializer.deserialize("&b&lMagic diamond"));
        meta.addEnchant(Enchantment.KNOCKBACK, 1, false);
        meta.addItemFlags(ItemFlag.HIDE_ENCHANTS);
        item.setItemMeta(meta);
        player.getInventory().addItem(item);

    }).build());
```

Congratulations, you just created your first GUI and the first item in it!

# Opening the menu

First you need to create the GUI object itself, and then you can open it for a player using `open(player)`.

Like this:
```java
new ShopGui().open(player);
```

And that's it — the user will see the GUI.


# Useful features

Now that you've learned how to create GUIs, let's talk about some potentially useful features.

1. `getItem(key)` — Remember earlier when we set a `key` in `setItem(key, wrapper)`? That key is a unique identifier you can later use to get that item and tell it apart from others.
2. `getItemBySlot(slot)` — Say you know the slot an item is in, but you don't know exactly which ItemWrapper was clicked — that's where this method comes in handy.
3. `onClick()` — Get any click in the inventory (InventoryClickEvent).
4. `onDrag()` — Get any drag click in the inventory (InventoryDragEvent).
5. `onOpen()` — Fires when the GUI is opened (InventoryOpenEvent).
6. `onClose()` — Fires when the GUI is closed (InventoryCloseEvent).
7. `updateItem(key)` — Say you want to change a wrapper's name, but you're confused why it's not applying — this method is exactly what helps here. Example:
```java
setItem("magic_diamond", ItemWrapper.builder(Material.DIAMOND)
    .slots(1, 5, 7)
    .setDisplayName("&cMagic diamond")
    .onClick(event -> {
        event.setCancelled(true);
        ItemWrapper item = getItem("magic_diamond");
        item.setDisplayName("Super duper magic Diamond");
        updateItem("magic_diamond");
    }).build());
```