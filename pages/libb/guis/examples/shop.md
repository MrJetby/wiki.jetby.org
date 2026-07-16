---
name: shop.yml
---

# Showcase
<p align="center">
<img src="/assets/shop-yaml-example.png" width="100%"></p>

# Config
```yaml
id: shop
title: "&0&lShop"
size: 27
command:
  - shop

Items:

  test:
    material: diamond
    lore:
      - ''
      - '&7● &fPrice: &b$150'
      - '&7● &fYour balance: &e$%vault_eco_balance_fixed%'
      - ''
      - '&7< &6Left click &7> &fBuy &6&lx1'
      - '&7< &6Right click &7> &fBuy &6&lx16'
      - '&7< &6Shift left click &7> &fBuy &6&lx32'
      - '&7< &6Shift right click &7> &fBuy &6&lx64'
      - ''
      - '&aClick to buy'
    slot: 13
    amount: 1
    on_click:
      left:
        - buy_check:
            if: "%vault_eco_balance_fixed% >= 150"
            then:
            - "[console] money take %player_name% 150 -s"
            - "[console] minecraft:give %player_name% diamond 1"
            - "[message] &aYou bought &7{material} x1"
            - '[refresh]'
            else:
            - '[message] &cInsufficient funds'
      right:
        - buy_check:
            if: "%vault_eco_balance_fixed% >= 2400"
            then:
            - "[console] money take %player_name% 2400 -s"
            - "[console] minecraft:give %player_name% diamond 16"
            - "[message] &aYou bought &7{material} x16"
            - '[refresh]'
            else:
            - '[message] &cInsufficient funds'
      shift_left:
        - buy_check:
            if: "%vault_eco_balance_fixed% >= 4800"
            then:
            - "[console] money take %player_name% 4800 -s"
            - "[console] minecraft:give %player_name% diamond 32"
            - "[message] &aYou bought &7{material} x32"
            - '[refresh]'
            else:
            - '[message] &cInsufficient funds'
      shift_right:
        - buy_check:
            if: "%vault_eco_balance_fixed% >= 9600"
            then:
            - "[console] money take %player_name% 9600 -s"
            - "[console] minecraft:give %player_name% diamond 64"
            - "[message] &aYou bought &7{material} x64"
            - '[refresh]'
            else:
            - '[message] &cInsufficient funds'

```