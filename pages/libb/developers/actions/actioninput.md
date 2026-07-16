---
priority: 996
name: ActionInput
---

ActionInput is simply the text that follows the action.

Say we have the command `[message] Hello World!`
- `[message]` — this is the Action
- `Hello World!` — this is the Input

To get the text `Hello World!` inside the action, use `input.rawText()`:
```java
public class MessageImpl implements Action {

    @Override
    public void execute(@NotNull ActionContext ctx, @NotNull ActionInput input) {
        Player player = ctx.getPlayer();
        if (player == null) return;
        
        player.sendMessage(input.rawText());
    }
}
```

> `input.rawText()` also includes any changes already applied by `.replace()`


By the way, if you specify a serializer in the ActionContext, then you'll get a ready-made, fully assembled component with the right colors as output. To get it, use `input.serialized()` — if you don't specify a serializer, it will return null.
To be sure that `input.serialized()` isn't null, use `getOrSerialize(Serializer serializer)`, for example:
```java
@Override
public void execute(@NotNull ActionContext ctx, @NotNull ActionInput input) {
    Player player = ctx.getPlayer();
    if (player == null) return;
    
    player.sendMessage(input.getOrSerialize(Serializer.UNIFIED));
}
```