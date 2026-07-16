---
name: Serializers
priority: 1
---

# Serializers

The `org.jetby.libb.color` module handles turning a plain string (with color codes, MiniMessage tags, legacy formatting, etc.) into an Adventure `Component`. The whole module is built around a single contract — `Serializer` — and seven ready-made implementations for different text formats.

## Why this exists

In the Minecraft plugin ecosystem, messages come in different formats:

- legacy codes via `&` or `§` (`&cHello`)
- MiniMessage (`<red>Hello</red>`)
- raw Gson JSON from the Vanilla/Bukkit API
- a hybrid format mixing legacy + hex + gradients
- plain text with no formatting at all

Instead of writing a custom parser in every plugin, Libb provides a single interface — `Serializer.deserialize(String) -> Component` — and you pick the concrete implementation via `SerializerType`.

## Architecture

```
Serializer (interface)
 ├─ GsonSerializer
 ├─ LegacySerializer      (parameterized by & or § character)
 ├─ MiniMessageSerializer
 ├─ MinimalSerializer     (custom hand-written parser)
 ├─ PlainTextSerializer
 └─ UnifiedSerializer     (legacy + hex + gradients → MiniMessage)

SerializerType (enum)     — factory for concrete Serializers via Supplier
HashedSerializer          — wrapper adding optional LRU caching on top of any Serializer
Serializer.get(type)      — entry point, returns a ready HashedSerializer
```

Three layers:

1. **`Serializer`** — the minimal contract: one method, `deserialize(String) -> Component`.
2. **Concrete implementations** in the `serializers/*` package — the actual parsing logic.
3. **`HashedSerializer`** — a decorator that adds caching on top of any implementation and holds the associated `SerializerType`.

`SerializerType` is an enum factory: each enum constant knows how to build the corresponding `Serializer` via a `Supplier<Serializer>`. `SerializerType` is the public-facing API — the concrete serializer classes (`GsonSerializer`, `MinimalSerializer`, etc.) usually aren't used directly.

## Entry point: `Serializer.get(type)`

```java
Component result = Serializer.get(SerializerType.MINI_MESSAGE).deserialize("<red>Hello, world!</red>");
```

The `Serializer` interface holds seven **static ready-made instances** — one per `SerializerType`:

```java
HashedSerializer PLAIN_TEXT       = new HashedSerializer(SerializerType.PLAIN_TEXT);
HashedSerializer GSON             = new HashedSerializer(SerializerType.GSON, true);
HashedSerializer LEGACY_SECTION   = new HashedSerializer(SerializerType.LEGACY_SECTION, true);
HashedSerializer LEGACY_AMPERSAND = new HashedSerializer(SerializerType.LEGACY_AMPERSAND, true);
HashedSerializer UNIFIED          = new HashedSerializer(SerializerType.UNIFIED, true);
HashedSerializer MINIMAL          = new HashedSerializer(SerializerType.MINIMAL, true);
HashedSerializer MINI_MESSAGE     = new HashedSerializer(SerializerType.MINI_MESSAGE, true);
```

This means: **you shouldn't create new instances manually** in 99% of cases. Just reach for the static field or `Serializer.get(type)` — both return the same singleton:

```java
Serializer.MINI_MESSAGE.deserialize(text);
// equivalent to:
Serializer.get(SerializerType.MINI_MESSAGE).deserialize(text);
```

Note: `PLAIN_TEXT` has caching disabled (`isCache = false`, since the second constructor argument defaults to `false` when omitted). All the other six have caching enabled with a 500-entry limit.

## Serializer types

### `PLAIN_TEXT` — `PlainTextSerializer`
Simply wraps the string in `Component.text(input)` with no formatting processing at all. Use this when you need to guarantee the text is rendered exactly as-is, with no risk of user input being accidentally interpreted as markup (protection against formatting injection via a player's nickname or chat message).

### `GSON` — `GsonSerializer`
Deserializes raw JSON of an Adventure component via `AdventureReflect.gson(input)`. Needed when text already arrives in the component JSON format (e.g. from vanilla commands or NBT).

### `LEGACY_AMPERSAND` / `LEGACY_SECTION` — `LegacySerializer`
One class, two modes — set via the delimiter character passed to the constructor:

```java
new LegacySerializer('&')   // &c, &l, &r...
new LegacySerializer('§')   // §c, §l, §r...
```

Delegates to `AdventureReflect.legacyAmpersand(input)` or `AdventureReflect.legacySection(input)` — meaning the actual parsing is done by Adventure's own `LegacyComponentSerializer`, not custom code. This is the classic Bukkit-style color code format.

### `MINI_MESSAGE` — `MiniMessageSerializer`
A direct pass through Adventure's official MiniMessage parser (`AdventureReflect.miniMessage(input)`). Supports the full tag syntax: `<red>`, `<bold>`, `<gradient:...>`, `<hover:...>`, `<click:...>`, etc.

### `MINIMAL` — `MinimalSerializer`
The only serializer with a **fully hand-written** parser (no Adventure legacy/mini-parser underneath). Written character-by-character and supports:

- legacy color codes `&0`-`&f` via `fromLegacyCode()`
- style modifiers `&l` (bold), `&o` (italic), `&n` (underline), `&m` (strikethrough), `&k` (obfuscated)
- reset via `&r`
- both `§` and `&` as prefixes simultaneously
- hex colors `#RRGGBB` (six characters immediately following `#`)
- gradients in the format `<#FF0000>text</#00FF00>` — interpolates RGB per-character between the start and end color (see `buildGradient`)

The logic works as a state machine: it accumulates text in a `StringBuilder`, and on hitting a control code, it flushes the accumulated chunk as a `Component` with the current style state, resets/updates the state, and continues. Everything is finally assembled into `Component.empty().children(components)`.

Use this if, for whatever reason, you don't want to pull in a full MiniMessage parser dependency, or you need maximum control over parsing behavior.

### `UNIFIED` — `UnifiedSerializer`
The "smartest" serializer — designed as a single entry point for **any legacy format**, converting everything into a MiniMessage-compatible string and running it through `AdventureReflect.miniMessage(...)` exactly once. The pipeline, in `toMiniCompatible()`:

1. `§` → `&` (unify the prefix)
2. Convert the old gradient format `<#FF0000>text</#00FF00>` → `<gradient:#FF0000:#00FF00>text</gradient>` (regex `GRADIENT_PATTERN`)
3. Bare hex codes `#FF5500` (no angle brackets, not already inside a tag) → `<#FF5500>` (regex `HEX_PATTERN` with negative lookbehind/lookahead, to avoid touching what's already inside tags)
4. Legacy codes `&0`-`&f`, `&A`-`&F`, `&l/&n/&o/&m/&k/&r` → corresponding MiniMessage tags via manual replacement using the `LEGACY_FROM`/`LEGACY_TO` arrays

The final string is wrapped in `<!i>` (forcibly disables default italics — otherwise some clients/Adventure versions render text as italic by default for certain colors) and passed to `AdventureReflect.miniMessage(...)`.

**This is the default choice** if messages in your config/database mix old `&`-codes with new MiniMessage tags and you want to support both without writing two separate parsing passes yourself.

## `HashedSerializer` — the caching wrapper

Any `Serializer` can be wrapped in a `HashedSerializer`, which adds an LRU cache on top of `deserialize()`:

```java
public HashedSerializer(SerializerType type)                      // no cache
public HashedSerializer(SerializerType type, boolean cache)       // cache on/off, limit 500
public HashedSerializer(SerializerType type, boolean cache, int maxSize) // custom limit
```

The cache is implemented via `LinkedHashMap` with `accessOrder = true` and an overridden `removeEldestEntry` — the classic fixed-size LRU cache pattern, wrapped in `Collections.synchronizedMap` for thread safety.

```java
public Component deserialize(String input) {
    if (isCache) {
        return cache.computeIfAbsent(input, serializer::deserialize);
    }
    return serializer.deserialize(input);
}
```

Why caching matters: parsing MiniMessage/regex chains in `UnifiedSerializer` isn't free. If the same message (e.g. from a `messages.yml` config) gets deserialized on every single call (every kill, every chat event), caching saves a significant chunk of CPU, especially under high event throughput.

### Cache warm-up (`cacheAll`)

```java
List<String> messages = config.getStringList("messages");
Serializer.UNIFIED.cacheAll(messages);
```

If you know in advance which messages will be used (e.g. all strings from a config on plugin startup), it's worth warming up the cache ahead of time — that way the first real `deserialize()` call for a player already hits the cache instead of causing a runtime lag spike.

**Important:** `cacheAll` doesn't check `isCache` — calling it on a serializer without caching enabled will throw a `NullPointerException` (the `cache` field is `null`). Only use it on instances constructed with `cache = true`.

## `SerializerType` — adding your own format

```java
public enum SerializerType {
    MINI_MESSAGE(MiniMessageSerializer::new),
    MINIMAL(MinimalSerializer::new),
    UNIFIED(UnifiedSerializer::new),
    LEGACY_AMPERSAND(() -> new LegacySerializer('&')),
    LEGACY_SECTION(() -> new LegacySerializer('§')),
    GSON(GsonSerializer::new),
    PLAIN_TEXT(PlainTextSerializer::new);

    private final Supplier<Serializer> factory;
    ...
    public Serializer create() { return factory.get(); }
}
```

Each constant is a `Supplier<Serializer>` — a **factory**, not a ready instance. The actual parser instance is created once inside `HashedSerializer` (in the constructor: `this.serializer = type.create();`) and lives there as a private field.

To add a new format (say, a `TomlSerializer` or another custom one):

1. Create a class in `org.jetby.libb.color.serializers` implementing `Serializer`
2. Add a constant to `SerializerType` pointing to its constructor/lambda
3. Add a `case` to the `Serializer.get(type)` switch
4. (Optional) Add a static singleton `HashedSerializer` field to the `Serializer` interface if the format will be used frequently

## Practical recommendations

| Situation | What to use |
|---|---|
| Config mixes `&c` and MiniMessage tags | `Serializer.UNIFIED` |
| Pure MiniMessage, no legacy | `Serializer.MINI_MESSAGE` |
| Player nickname/message — formatting can't be trusted | `Serializer.PLAIN_TEXT` |
| JSON component from the vanilla API | `Serializer.GSON` |
| Legacy plugin with pure `&`-codes, max speed and predictability without depending on the MiniMessage parser | `Serializer.LEGACY_AMPERSAND` |
| Need full control over parsing without the AdventureReflect wrapper | `Serializer.MINIMAL` |

General rule: **always use the static fields from `Serializer`** (`Serializer.UNIFIED`, `Serializer.MINI_MESSAGE`, etc.) instead of manually creating `new HashedSerializer(...)` — otherwise every such call spins up its own cache, and you lose the whole point of caching (different parts of the codebase would end up duplicating the same entries across separate LRU maps instead of sharing one).

## Real-world usage example

```java
// In config: messages.deny-permission: "<red>You don't have permission!</red> &7(&c{permission}&7)"
String raw = config.getString("messages.deny-permission")
        .replace("{permission}", perm);

Component message = Serializer.UNIFIED.deserialize(raw);
player.sendMessage(message);
```

`UNIFIED` correctly handles both the MiniMessage tag `<red>` and legacy `&7`/`&c` in the same message — and thanks to caching, repeated calls with the same string (after `{permission}` substitution) won't be re-parsed from scratch.