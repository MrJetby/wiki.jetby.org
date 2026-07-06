---
name: Gui configuration
priority: 999
---

# Gui configuration

```java

id: main # the unique gui name
title: "&0&lExample"
size: 54

command:
  - test
  - example
  
on_open:
  - '[message] msg'
  - example_check:
      if: "10 > 15"
      then:
        - '[message] nice'
      else:
        - '[message] not nice'

on_close: []

Items:

  example:
    material: STONE
    amount: 1
    slot: 11
    priority: 1
    display_name: "Name"
    lore:
      - "Line1"
    flags:
      - HIDE_ATTRIBUTES
    view_requirements:
      - "5 > 10"
    on_click:
      any:
        - '[message] clicked'
        - example_check:
            if: "10 > 15"
            then:
              - '[message] nice'
            else:
              - '[message] not nice'
      left:
        - '[message] clicked left'


```
