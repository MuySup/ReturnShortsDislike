# Return YouTube Shorts Dislike

A Firefox extension that adds a working **Dislike** button next to the Like button on YouTube Shorts.

_****_⚠️ This project was created without much effort. It may not work properly._****_

## How it works


**1. A Dislike button is added next to Like**

![1.png](1.png)

On every Shorts page, the extension finds the real Like button (`like-button-view-model`) and inserts a  "Dislike" button.

**2. A background tab is opened silently**

![img_2.png](img_2.png)

The extension opens a new background tab.

**4. The Shorts URL is converted to a Watch URL**

https://www.youtube.com/shorts/Ajftf0dF0OU

https://www.youtube.com/watch?v=Ajftf0dF0OU

The video ID is extracted from the Shorts URL (`/shorts/<id>`) and turned into a normal watch URL (`/watch?v=<id>`), which is what the background tab navigates to.

**5. The real Dislike button gets clicked automatically**

In that background tab, a small script detects and clicks YouTube's real Dislike button.

---

I noticed this issue and built this project using an LLM. Because I didn't have time and don't know JavaScript, I didn't put much effort into it.