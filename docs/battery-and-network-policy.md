# Battery and Network Policy

| Mode          | Accuracy | Distance |  Time | Background | Relative impact |
| ------------- | -------- | -------: | ----: | ---------- | --------------- |
| Guide Only    | None     |        — |     — | Off        | Lowest          |
| Battery Saver | Balanced |    100 m | 120 s | Off        | Low             |
| Balanced      | High     |     40 m |  60 s | Off        | Moderate        |
| High Accuracy | Highest  |     10 m |  15 s | Off        | High            |

Values are conservative centralized defaults pending field testing. Location permission is requested only when starting a hike.

Manual Only is the sole enabled sync policy. Future policies are visible but disabled. There is no polling, heartbeat, presence reporting, automatic upload loop, or silent network resume.
