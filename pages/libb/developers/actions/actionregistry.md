---
priority: 998
name: ActionRegistry
---


## Registering custom actions
Now that you've seen this, a question comes up: how do you register a custom action?
It's pretty simple — there's a static method for that, which you can use from anywhere in your code.

Say you want to register a command for giving out diamonds, something like the command `[give_diamond] 10`, which gives out 10 diamonds.

You have two ways to register it.

First:
```java
ActionRegistry.register("myplugin", "give_diamond", (ctx, input) -> {
    Player player = ctx.getPlayer();
    if (player == null) return;

    int amount = Integer.parseInt(input.rawText());
    player.getInventory().addItem(new ItemStack(Material.DIAMOND, amount));
    player.sendMessage("You got " + amount + " diamonds!");
});
```

Second (a separate class):
```java
public class GiveDiamond implements Action {

    @Override
    public void execute(@NotNull ActionContext ctx, @NotNull ActionInput input) {
        Player player = ctx.getPlayer();
        if (player == null) return;

        int amount = Integer.parseInt(input.rawText());
        player.getInventory().addItem(new ItemStack(Material.DIAMOND, amount));
        player.sendMessage("You got " + amount + " diamonds!");
    }
}
```

**IMPORTANT**: Always call `ActionRegistry.unregister()` or `ActionRegistry.unregisterAll()` when disabling the plugin.
For example:
```java
    @Override
    public void onDisable() {
        ActionRegistry.unregisterAll("myplugin"); // where myplugin is the actual name of your plugin
    }
```

Now, to execute this command, you do the following:

```java
 ActionExecute.run(ActionContext.of(player), "[myplugin:give_diamond] 10");
```
By the way, the funniest thing is that you can use this command in other plugins that utilize Libb Actions as well.

### How to remove `myplugin` from the action
You’re probably getting annoyed at the thought of having to add `myplugin` every single time—especially since it’s your own plugin. So, what can you do about it?

It’s as easy as spreading butter on bread.

Simply add your `JavaPlugin` instance after `player`.

Example:
```java
ActionExecute.run(ActionContext.of(player, plugin), "[give_diamond] 10");
```
Here, `plugin` refers to your main `JavaPlugin` class.

## What if I want to rewrite the logic of an existing action?
In that case, use `ActionRegistry.override`. It uses the same registration code, but you use `override` instead of `register`.
Example:
```java
ActionRegistry.override("myplugin", "give_diamond", (ctx, input) -> {

});
```

