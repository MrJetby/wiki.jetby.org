---
icon: <svg viewBox="0 0 448 512" fill="currentColor" class="gb-icon size-[1em] text-tint-subtle shrink-0" style="overflow: visible;"><path fill="currentColor" d="M88 0C39.4 0 0 39.4 0 88L0 432c0 44.2 35.8 80 80 80l344 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-8 0 0-76.1C435.3 375 448 353 448 328l0-256c0-39.8-32.2-72-72-72L88 0zM368 400l0 64-288 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l288 0zM80 352c-11.4 0-22.2 2.4-32 6.7L48 88c0-22.1 17.9-40 40-40l288 0c13.3 0 24 10.7 24 24l0 256c0 13.3-10.7 24-24 24L80 352zm48-200c0 13.3 10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0c-13.3 0-24 10.7-24 24zm24 72c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0z"></path></svg>
name: Libb
---

# Libb

#### Source code: [https://github.com/MrJetby/Libb](https://github.com/MrJetby/Libb)

#### Requirements:

* Java: 21 and higher
* Minecraft version: 1.20 and higher

{% tabs %}
{% tab title="Gradle" %}


```java
repositories {
    maven {
        url "https://api.jetby.org/"
        name "jetby-repo"
    }
}
```

```java
dependencies {
    compileOnly "org.jetby.libb:api:VERSION"
}
```

{% endtab %}

{% tab title="Maven" %}


```xml
<repository>
  <id>JetbyMC</id>
  <url>https://api.jetby.org/</url>
</repository>
```

```xml
<dependency>
  <groupId>org.jetby.libb</groupId>
  <artifactId>api</artifactId>
  <version>1.2</version>
  <scope>provided</scope>
</dependency>
```

{% endtab %}
{% endtabs %}

