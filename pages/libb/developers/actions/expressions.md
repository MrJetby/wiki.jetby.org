---
priority: 900
name: Expressions
---

To use Expressions, you first need to understand what an ActionBlock is.

**ActionBlock** is a container that holds the list of actions from your config, but splits them into two types:
- regular commands (plain text, no conditions)
- conditional blocks — Expressions (the `if/then/else` ones)

Here's what it looks like on the inside:
```java
public record ActionBlock(
    List<String> staticActions,
    List<Expression> expressions
) {
}
```
- `staticActions` — these are regular commands that always run, no conditions attached.
- `expressions` — this is a list of conditional checks (if/then/else).

And here's what an **Expression** itself looks like:
```java
public record Expression(
        String input,
        List<String> success,
        List<String> fail
) {
}
```
- `input` — the condition that needs to be checked (what you write under `if:`)
- `success` — the list of commands that run if the condition is `true` (this is your `then:`)
- `fail` — the list of commands that run if the condition is `false` (this is your `else:`)

In other words, every `if/then/else` block in your config gets turned into a single `Expression` object when it's parsed.

Say we have this list of commands in the config:
```yaml
actions:
- '[message] Hey %player_name%, checking your status:'
- example_check:
    if: "%has_vip% == true"
    then:
        - '[message] You are a VIP player, enjoy your perks!'
    else:
        - '[message] You are not a VIP yet.'
- '[message] Need more info? Visit our wiki:'
- '[message] https://example.com/wiki'
```

If you break this config down, you'd get:
- `staticActions` — three regular strings: `[message] Hey %player_name%...`, `[message] Need more info?...`, `[message] https://example.com/wiki`
- `expressions` — one element: an `Expression` where `input = "%has_vip% == true"`, `success = ["[message] You are a VIP player..."]`, `fail = ["[message] You are not a VIP yet."]`

So ActionBlock basically "sorts" your whole list of actions into two separate piles: what always runs, and what runs conditionally.

### How to use this in code

So you don't have to parse all of this by hand, I've made ready-to-use methods:
- `ActionUtil.getActionBlock(List<?> list)` — turns a `List<?>` from your config straight into a ready `ActionBlock` (both static actions and expressions at once)
- `ActionUtil.getExpressions(List<?> list)` — if you only need the conditions, without the static commands, you can get a `List<Expression>` directly

After that, it's simple: you get an `ActionBlock` (or `List<Expression>`) and pass it into `ActionExecute.run()`, which figures out on its own what to run right away and what to run only after checking a condition.

For example:
```java
FileConfiguration configuration;
ActionBlock actions = ActionUtil.getActionBlock(configuration.getList("actions"));
ActionExecute.run(ActionContext.of(player), actions);
```

And that's it — `ActionExecute` goes through `staticActions` and `expressions` on its own, runs the regular commands, and for each Expression checks the `input` and runs either `success` or `fail` depending on the result. You don't need to write any `if`-checks in Java yourself — all the logic is already built into `ActionExecute.run()`.