---
priority: 997
name: ActionContext
---

`ctx`, and its full name `ActionContext`, is a really useful feature — the name already tells you it's the entire context of the action. Here's what you can do with it:
- Add objects using `.with()`
- Create placeholders using `.replace()`
- Use the colorization you need for messages with `.setSerializer()`, and get it with `ctx.getSerializer()`

### Using `.with`
```java
// Put objects in
ActionContext ctx = ActionContext.of(player)
        .with(entity)       // store by entity.getClass()
        .with(myGui);       // store by myGui.getClass()

// Get objects out (inside a handler)
Entity entity = ctx.get(Entity.class);      // null if not provided
Entity entity = ctx.require(Entity.class);  // throws if not provided
```

Where can this be used?
Let me just show you an example: say we make a command in your plugin for bosses, and you need a single action to teleport you to the boss. Let's call the action `[boss_tp]`, and now the question comes up: how does the plugin know exactly which mob to teleport to?
This is where the `with()` method comes to the rescue. Let's practice:

First, let's create our action:
```java
public class BossTpAction implements Action {

    @Override
    public void execute(@NotNull ActionContext ctx, @NotNull ActionInput input) {
        Player player = ctx.getPlayer();
        if (player == null) return;

        // You can use any class, for this example I'll take a Minecraft entity
        Entity boss = ctx.get(Entity.class);

        // It's important to ALWAYS check your custom objects for null
        if (boss==null) return;

        // the teleport itself
        player.teleport(boss);

    }
}
```

Great, now register the command, and call `ActionExecute` wherever you have `with(boss)`, for example:
```java
 ActionExecute.run(ActionContext.of(player)
    .with(boss), "[boss_tp]");
```
Don't forget that you can use `with()` as many times as you want, for example:
```java
 ActionExecute.run(ActionContext.of(player)
    .with(class1)
    .with(class2)
    .with(class3)
    .with(class4), "[my_command]");
```

### Using `.replace()`
- This is more about convenience — it's just a regular `String.replace`.
You can also call it as many times as you like, for example:
```java
 ActionExecute.run(ActionContext.of(player)
    .replace("{price}", "120")
    .replace("{time}", "10PM")
    .replaceFromMap(your_hashmap), "[my_command]");
```

### Using `.setSerializer()`/`ctx.getSerializer()`

If you don't know what colored serializers are, then [check this out](/serializers).

When calling the command:
```java
 ActionExecute.run(ActionContext.of(player)
    .setSerializer(Serializer.UNIFIED /*e.g. UNIFIED*/), "[boss_tp]");
```

And now use it however you want:
```java
public class Test implements Action {

    @Override
    public void execute(@NotNull ActionContext ctx, @NotNull ActionInput input) {
        Player player = ctx.getPlayer();
        if (player == null) return;

        player.sendMessage(ctx.getSerializer().deserialize(input.rawText()));

        // or

        player.sendMessage(input.getOrSerialize(ctx.getSerializer()));

    }
}
```