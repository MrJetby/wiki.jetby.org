---
priority: 999
name: Get started
---



Run a single command:
```java
ActionExecute.run(ActionContext.of(player), "[message] Hello!");
```
`player` is the target, but in some actions `player` can be null, for example:
```java
ActionExecute.run("[broadcast_message] Hello!");
```

Run a list of commands:
```java
ActionExecute.run(ActionContext.of(player), List.of(
    "[message] Hello!", 
    "[message] How are you?"
));
```

But why does the `[message]` action work? Ever wondered?
It's all thanks to our built-in actions — [here's a list](/libb/actions/builtin-actions) of all the current built-in actions


To use the `[delay] ticks` command, you must specify your JavaPlugin in the ActionContext.
For example:
```java
ActionExecute.run(ActionContext.of(player, plugin), List.of(
    "[message] Hello!", 
    "[delay] 60", 
    "[message] How are you?"
));
