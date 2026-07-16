---
priority: 998
name: Paginated Gui
---

PaginatedGui is the same AdvancedGui, just with pagination built in. So if you've got, say, a shop with 100 items but only 21 slots available for them, PaginatedGui will split those 100 items into pages for you and give you methods to flip through them.

You start the same way as with a regular AdvancedGui, just extending `PaginatedGui` instead:
```java
public class ShopGui extends PaginatedGui {

    public ShopGui() {
        super("Shop", 54);
    }
}
```

## Setting up content slots

First, you need to tell the GUI which slots are reserved for page items — use `contentSlots()` for that:
```java
public ShopGui() {
    super("Shop", 54);

    contentSlots(10, 11, 12, 13, 14, 15, 16);
}
```
These are the slots where page items will appear. Any other slots (like next/prev buttons, a border, etc.) are handled as usual through `setItem()`.

## Adding items to the pagination

Don't mix these up: `setItem()` is for static items (buttons, border), while items that should be paginated are added through `addItem()`:
```java
public ShopGui() {
    super("Shop", 54);

    contentSlots(10, 11, 12, 13, 14, 15, 16);

    for (int i = 0; i < 50; i++) {
        addItem(ItemWrapper.builder(Material.DIAMOND)
                .setDisplayName("Diamond #" + i)
                .build());
    }
}
```
Notice that you don't need to set `.slots()` on the ItemWrapper here — the GUI places them into `contentSlots` on its own, based on the current page.

## Page-flipping buttons

To let the player switch pages, attach `onClick()` to any button and call `nextPage()`/`prevPage()`:
```java
setItem("next_page", ItemWrapper.builder(Material.ARROW)
        .slots(53)
        .setDisplayName("Next page ->")
        .onClick(event -> nextPage())
        .build());

setItem("prev_page", ItemWrapper.builder(Material.ARROW)
        .slots(45)
        .setDisplayName("<- Prev page")
        .onClick(event -> prevPage())
        .build());
```
`nextPage()` checks on its own whether there's a next page, and switches to it if there is. Same goes for `prevPage()`, just in the other direction. If there's no more pages, nothing happens.

## everyPageLogic() — what it's for and how to use it

Here's the problem: buttons like "next page" and "prev page" are usually set once through `setItem()` in the constructor. But what if, when switching pages, you need to hide the "next page" button once you've reached the last page? Or update text like "Page 2 / 5"?

That's exactly what `everyPageLogic()` is for — it's a method that gets called automatically **every time a page opens or switches** (i.e., inside `openPage()`). Override it with `@Override` and put any logic there that should apply on every page.

For example, let's update a page-number indicator:
```java
public class ShopGui extends PaginatedGui {

    public ShopGui() {
        super("Shop", 54);

        contentSlots(10, 11, 12, 13, 14, 15, 16);

        for (int i = 0; i < 50; i++) {
            addItem(ItemWrapper.builder(Material.DIAMOND)
                    .setDisplayName("Diamond #" + i)
                    .build());
        }

        setItem("next_page", ItemWrapper.builder(Material.ARROW)
                .slots(53)
                .setDisplayName("Next page ->")
                .onClick(event -> nextPage())
                .build());

        setItem("prev_page", ItemWrapper.builder(Material.ARROW)
                .slots(45)
                .setDisplayName("<- Prev page")
                .onClick(event -> prevPage())
                .build());
    }

    @Override
    public void everyPageLogic() {
        // this code runs every time the page opens or changes
        ItemWrapper pageIndicator = ItemWrapper.builder(Material.PAPER)
                .slots(49)
                .setDisplayName("Page " + (getCurrentPage() + 1))
                .build();

        setItem("page_indicator", pageIndicator);
    }
}
```
So every time `nextPage()`, `prevPage()`, or `openPage(index)` gets called, the GUI first lays out the page items, and then automatically calls your `everyPageLogic()` — and there you can update absolutely anything: the page indicator, button visibility, or any other dynamic elements.

## Main methods

1. `contentSlots(slots...)` — specify which slots are reserved for page items
2. `addItem(wrapper)` — add an item to the pagination (unlike `setItem()`, you don't need to set the slot manually)
3. `nextPage()` — open the next page
4. `prevPage()` — open the previous page
5. `openPage(index)` — open a specific page by index
6. `everyPageLogic()` — an overridable method (`@Override`) that gets called every time a page opens or changes — handy for dynamic elements like a page indicator or conditionally showing/hiding buttons