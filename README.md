<img width="1437" alt="Screen Shot 2024-03-07 at 2 58 02 PM" src="https://github.com/ZackeryRSmith/acoin/assets/72983221/07610b44-861c-46f6-bb2e-bc37a63bc451">

---

<p align="center">
This nifty tool is designed for annotating data for the COINS Named Entity Recognition <i>(NER)</i> model. <b>Acoin</b> keeps things simple. Its purpose is to serve as a <i>straightforward annotation tool</i>, given that other options are either paid or far too complex for my needs.
</p>

---

**Acoin** has it's own annotation syntax. There are 5 labels to use: `COMMAND`, `OPTION`, `INPUT`, `NUMBER`, `STRING`. The syntax for labeling word(s) is as follows: `[WORD](LABEL)`. Each annotation is seperated by a newline character (`\n`).

Just like headers in markdown, you can section off your annotations using `#`. You may also write comments that won't effect **Acoin** by starting your line with `//`.


A few example annotations:
```md

// this comment won't effect Acoin at all, so feel free to write whatever!

# open an app
[Open](COMMAND) up [Google Chrome](STRING) for me.
Please [open](COMMAND) up [firefox](STRING).
## open an app on a device
[Open](COMMAND) [Hulu](STRING) on my [television](INPUT)
[Open](COMMAND) [VLC](STRING) on my [desktop](INPUT)

# setting a timer
Could you [set](COMMAND) a [timer](OPTION) for [120](NUMBER) [seconds](INPUT)?
[Turn](COMMAND) [on](INPUT) the [lights](OPTION) in the [living room](STRING)
```
