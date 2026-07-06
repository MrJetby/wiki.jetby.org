---
icon: <svg viewBox="0 0 512 512" fill="currentColor" class="gb-icon size-[1em] text-tint-subtle shrink-0" style="overflow: visible;"><path fill="currentColor" d="M48 76.1L48 48 76.1 48 390.1 361.9 361.9 390.1 48 76.1zM256 352l72 72-21.1 21.1c-10.4 10.4-10.4 27.4 0 37.8 7.9 7.9 19.8 10 30 5.4L408 456 441.4 489.4c12.5 12.5 32.8 12.5 45.3 0l2.7-2.7c12.5-12.5 12.5-32.8 0-45.3L456 408 488.3 336.9c4.6-10.1 2.4-22.1-5.4-30-10.4-10.4-27.4-10.4-37.8 0L424 328 105.4 9.4C99.4 3.4 91.2 0 82.7 0L16 0C7.2 0 0 7.2 0 16L0 82.7c0 8.5 3.4 16.6 9.4 22.6L160 256 88 328 66.9 306.9c-10.4-10.4-27.4-10.4-37.8 0-7.9 7.9-10 19.8-5.4 30L56 408 22.6 441.4c-12.5 12.5-12.5 32.8 0 45.3l2.7 2.7c12.5 12.5 32.8 12.5 45.3 0L104 456 175.1 488.3c10.1 4.6 22.1 2.4 30-5.4 10.4-10.4 10.4-27.4 0-37.8L184 424 256 352zm-33.9-33.9l-72 72-28.1-28.1 72-72 28.1 28.1zm161.1-93.2L502.6 105.4c6-6 9.4-14.1 9.4-22.6L512 16c0-8.8-7.2-16-16-16L429.3 0c-8.5 0-16.6 3.4-22.6 9.4l-119.5 119.5 33.9 33.9 114.8-114.8 28.1 0 0 28.1-114.8 114.8 33.9 33.9z"></path></svg>
name: TreexClans
---

# TreexClans

**Clan System Plugin** – Advanced clans plugin for Minecraft servers with clan wars, rankings, clan homes, shared storage, PvP battles, invites, leaderboards, economy support, and customizable settings. Perfect for SMP, PvP, Factions, and survival servers. Lightweight, optimized, easy to set up, and fully configurable for modern Minecraft networks.

## Why TreexClans?

- Flexible API
- Separate folder for add-ons
- Customizable — fully configurable with custom functionality support.
- GUIs — create unlimited custom interfaces.
- Technology — uses modern solutions such as MiniMessage and Libby.
- Support — active bug fixing and community-driven improvements.
- Economy — includes a clan bank system for deposits and upgrades.
- Clan Coins — earn and spend coins on perks and rewards.
- Levels — level up clans to unlock more members, storage, and bank capacity.

### &#x20;What addons do you have?

- [Leaderboard](https://modrinth.com/plugin/clanleaderboard)
- [Quests](https://modrinth.com/plugin/clanquest)
- [Glow](https://modrinth.com/plugin/clanglow)
- [Events](https://modrinth.com/plugin/clanevents)
- War(soon, paid)
- Aliances(soon, free)
- Discord Integration (soon, free)

### You have to know about GUIs:

- We use guis system by [Libb](https://modrinth.com/plugin/libb), it's our own library/factory for guis.\
  It means, our yaml syntax is exactly the same as Libb

So, because of our flexible gui factory, you can simply make any type of gui you want, as much as you want.\
Let me give you an example what you can build with our gui system, to show you how customizable is TreexClans:\
\
**As an example I will make Shop.** \
Make sure your guis inside the `Menu/custom` folder, you can make any folder you want inside the folder. Just please put it inside custom.\
\
Now we make the yaml file:

```yaml
id: shop # unique identification name
title: "&0&lClan Shop"
size: 54

# Args helps you make the command part of TreexClans
open_args:
  - "shop" # it means /clan shop - easy right?

# A model is something that completely changes the behavior of the gui.
# CLAN_ONLY means that only players who's in clan can open the gui.
model: clan_only

# You can make any item, as much as you want
Items:
  diamond: # unique name (never uses, it could be anything)
    slot: 9
    material: DIAMOND
    lore:
      - ""
      - "&6• Cost &610 coins"
      - "&6• Your balance &6%clan_coin% coins"
      - ""
      - "&7▶ Click to buy"

    # This can be the part that you, never seen before, it's simple actions section, with custom features called checks
    on_click:
      any:
        # make sure that the spaces for checks is important
        - check1: # unique name
            if: "%clan_coin% >= 10" # expression
            # actions, also support other checks
            then:
              - "[console] minecraft:give %player_name% diamond 1"
              - "[coin_take] 10"
              - "[open] shop"
            else:
              - "[message] &cYou do not have enough coins."
  ### Decoration
  orange:
    material: ORANGE_STAINED_GLASS_PANE
    slots:
      - 0-2
      - 6-8
      - 45-47
      - 51-53
    display_name: " "
  black:
    material: BLACK_STAINED_GLASS_PANE
    slots:
      - 3
      - 5
      - 48
      - 50
    display_name: " "
  gray:
    material: GRAY_STAINED_GLASS_PANE
    slots:
      - 4
      - 49
    display_name: " "
```
