/* ==========================================================
   (917): SCRIPT

   CONTENTS
   1.  Helpers
   2.  Poems (content + rendering)
   3.  Intro
   4.  Menu numbers + page switching
   5.  Page 2: flyer tabs
   6.  Page 7: collage + comments
   7.  Page 2: comment dots
   8.  Page 2: flyer map
   9.  Page 2: dialer
   10. "+" button, cursor + dwell-to-enter
   11. Hand gestures + WebSocket
   12. Page 7: camera + photo archive
   13. Page 1: draggable image + dragging
   ========================================================== */


/* ==========================================================
   1. HELPERS
   ========================================================== */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const body = document.body;

/*
 * IMAGES ARE LISTED IN index.html, under each page.
 * (Look for the "IMAGE" comments.)
 */


/* ==========================================================
   2. CONTENT / POEMS
   ========================================================== */

const POEMS = {

  1: [

    {
      t: "Passing",
      by: "",
      text: `A person crosses the street.
A flyer lifts behind them.
Neither one knowing where the other goes.

The city keeps both directions.`,
    },

    {
      t: "Afterimage",
      by: "",
      text: `Someone was here before the paper was torn.
Someone will arrive after the last tab is gone.

Between them, a small piece of color
waits on the wall.`,
    },

    {
      t: "Public Notice",
      by: "",
      text: `I leave a sentence where strangers pass.
You take it without taking my name.

For a moment, our lives share
the same piece of paper.`,
    },

    {
      t: "Parallel",
      by: "",
      text: `We move beside one another,
close enough to disappear together.

Then one of us turns,
and the distance becomes visible.`,
    },

  ],

  2: { t: "Contact", by: "", text: `` },

  7: { t: "Leaving a Trace", by: "", text: `` },

};


/* POEM RENDERING */

function renderPoem(k, variant = 0) {

  const p = Array.isArray(POEMS[k])
    ? POEMS[k][variant % POEMS[k].length]
    : POEMS[k];

  const el = $("#poem" + k);

  if (!el || !p) {
    return;
  }

  el.innerHTML =
    `<strong>${p.t}</strong>` +
    (p.by ? `<br>${p.by}` : ``) +
    `<br><br>` +
    (p.text.trim() ? p.text.replace(/</g, "&lt;") : "");

}

renderPoem(2);
renderPoem(7);


/* ==========================================================
   3. INTRO
   ========================================================== */

const row = $("#row");

const hint = $("#hint");


/* Four +1s are fixed and bold, each in a different weight.
   They are the only ones you can hover, and each one shows a
   different paragraph from the book. All the others keep moving
   and cannot be hovered. */

const ANCHORS = [1, 4, 7, 10];

const ANCHOR_WEIGHTS = [500, 700, 700, 700];

const HINTS = [

  `A telephone flyer is easy to overlook. Pinned to a telephone pole, taped to a wall, layered beneath other advertisements, it becomes part of the visual noise of the city. A name, a short message, a phone number. Along the bottom, a row of tabs waits to be torn away. But every missing tab marks an absence.`,

  `The flyer exists in a strange space between public and private. A private need is placed into public space and left to an unknown person. The person who posts it cannot know who will read it, and the person who takes it cannot know where the message will lead. The exchange begins before the two people ever meet.`,

  `In New York City, millions of people move through the same streets while inhabiting entirely separate lives. We pass one another constantly, often without recognition. Yet the city is filled with small traces of these unseen lives: a note on a pole, a name on a mailbox, a number written on a piece of paper, a tab missing from a flyer. These traces suggest relationships that exist without ever becoming visible.`,

  `The tear-off flyer is therefore more than an advertisement. It is a point of possibility, a small structure built around the chance that two otherwise unrelated lives might intersect. Its meaning changes depending on who encounters it.`,

];


for (let i = 0; i < 12; i++) {

  const b = document.createElement("button");

  b.className = "p1";

  b.textContent = "+1";

  row.append(b);

  const a = ANCHORS.indexOf(i);


  /* moving +1: no hover, no focus */

  if (a === -1) {

    b.classList.add("drift");

    b.tabIndex = -1;

    b.setAttribute("aria-hidden", "true");

    continue;

  }


  /* fixed bold +1: hover shows its own paragraph */

  b.classList.add("anchor");

  b.setAttribute("aria-label", "Enter");

  b.style.fontWeight = ANCHOR_WEIGHTS[a];

  const showHint = () => {
    hint.textContent = HINTS[a];
    body.classList.add("hov");
  };

  const hideHint = () => {
    body.classList.remove("hov");
  };

  b.onmouseenter = showHint;
  b.onmouseleave = hideHint;
  b.onfocus = showHint;
  b.onblur = hideHint;

  b.onclick = (e) => {
    e.stopPropagation();
    go("menu");
  };

}


$("#intro").addEventListener("click", () => {

  if (body.dataset.v === "intro") {
    go("menu");
  }

});


/* Only the moving +1s change. They stay light (100 to 400) so the
   four bold ones are clearly the ones that react. */

setInterval(() => {

  $$(".p1.drift").forEach((b) => {

    const w = [100, 200, 300, 400][(Math.random() * 4) | 0];

    b.style.fontWeight = 400;

    b.style.fontStyle = Math.random() < 0.5 ? "italic" : "normal";

    b.style.opacity = w < 300 ? 0.35 : 1;

  });

}, 900);


/* ==========================================================
   4. MENU NUMBERS + PAGE SWITCHING
   ========================================================== */

/* [page, x%, y%, classes, hover flyer]
   The poem numbers (1) show the flyer that sits on their page, in black
   and white. Every other number shows the colour flyer listed here. */

const N = [

  [9, 11, 14, "red audio chain917 chain-start", "flyer1"],

  [1, 19, 55, "red chain917 chain-middle"],

  [7, 31, 74, "red fade chain917 chain-end", "flyer10"],

  [9, 78, 49, "chain917b archive-page", "flyer3"],

  [1, 87, 83, "chain917b"],

  [7, 52, 42, "chain917b camera-page", "flyer4"],

  [2, 85, 20, "blue chain212a", "flyer5"],

  [1, 56, 15, "chain212a"],

  [2, 63, 76, "chain212a cross-page", "flyer6"],

  [2, 11, 89, "chain212b tabs-page", "flyer7"],

  [1, 31, 28, "blue chain212b"],

  [2, 52, 89, "chain212b dial-page", "flyer8"],

];

const FLYER_DIR = "../photos/";

const FLYER_W = 150;

/* load the colour flyers once so they appear instantly on hover */

N.forEach(([, , , , f]) => {

  if (f) {
    new Image().src = FLYER_DIR + f + ".png";
  }

});


/* places a hover preview beside a menu number,
   on whichever side has room, kept inside the screen */

function placeNear(el, b, w) {

  const r = b.getBoundingClientRect();

  const h = el.offsetHeight || 120;

  const left =
    r.left > window.innerWidth / 2
      ? Math.max(8, r.left - w - 20)
      : Math.min(r.right + 20, window.innerWidth - w - 8);

  el.style.left = left + "px";

  el.style.top =
    Math.min(
      Math.max(8, r.top - h / 2 + r.height / 2),
      window.innerHeight - h - 8
    ) + "px";

}

const nums = $("#nums");

let oneVariant = 0;


N.forEach(([n, x, y, c, flyer]) => {

  const b = document.createElement("button");

  b.className = "num " + c;

  b.dataset.n = n;

  if (n === 1) {
    b.dataset.variant = String(oneVariant);
    oneVariant++;
  }

  b.textContent = n;

  b.style.left = x + "%";

  b.style.top = y + "%";

  b.setAttribute("aria-label", "Page " + n);

  nums.append(b);


  /* AUDIO */

  if (c.includes("audio")) {

    b.onmouseenter = () => {
      $("#talk").play().catch(() => {});
    };

    b.onmouseleave = () => {
      $("#talk").pause();
    };

  }


  /* HOVER FLYER
     (1) = the poem page's own image, black and white.
     Every other number = its colour flyer. */

  {

    const hi = $("#hoverimg");

    const poemImg = n === 1
      ? document.querySelector("#p1 .poem-image-" + (b.dataset.variant || 0))
      : null;

    const src = n === 1
      ? (poemImg && poemImg.getAttribute("src"))
      : FLYER_DIR + flyer + ".png";

    const showFlyer = () => {

      if (!src) return;

      hi.classList.toggle("bw", n === 1);

      /* place and show only once the image is loaded, so the flyer
         never jumps or flashes the previous image */

      const reveal = () => {
        hi.onload = null;
        placeNear(hi, b, FLYER_W);
        hi.classList.add("show");
      };

      hi.classList.remove("show");

      if (hi.getAttribute("src") === src && hi.complete) {
        reveal();
      } else {
        hi.onload = reveal;
        hi.src = src;
        if (hi.complete) reveal();
      }

    };

    const hideFlyer = () => hi.classList.remove("show");

    b.addEventListener("mouseenter", showFlyer);
    b.addEventListener("focus", showFlyer);
    b.addEventListener("mouseleave", hideFlyer);
    b.addEventListener("blur", hideFlyer);
    b.addEventListener("click", hideFlyer);

  }


  /* CLICK */

  b.onclick = () => {
    b.classList.contains("on") ? stage() : open(b);
  };

});


const R = [0, 1, 2].map((i) => nums.children[i]);

const NEXT = {
  9: R[1],
  1: R[2],
};

let cur = null;

/* true while the red (9) video page is open */
let redNineOn = false;


/* ==========================================================
   GO
   ========================================================== */

let snapTimer = null;

function go(v) {

  /* Leaving a page: cut it away at once. Otherwise the dark page
     (brown poem pages, green page 7) fades out over the white menu
     and passes through a muddy grey. */

  if (body.dataset.v === "page" && v !== "page") {

    body.classList.add("snap");

    clearTimeout(snapTimer);

    snapTimer = setTimeout(() => {
      body.classList.remove("snap");
    }, 1000);

  }

  body.dataset.v = v;

  if (v !== "page") {

    body.removeAttribute("data-p");

    body.classList.remove("s1", "flyers");

    crossOn = false;

    $$(".page").forEach((p) => {
      p.classList.remove("on");
    });

    $$(".num").forEach((b) => {
      b.classList.remove("on", "chain-next");
      b.textContent = b.dataset.n;
    });

    cur = null;

    redNineOn = false;

    const vid = $("#vid");

    if (vid) {
      vid.pause();
    }

  }

}


/* ==========================================================
   OPEN PAGE
   ========================================================== */

function open(b) {

  const n = b.dataset.n;

  cur = n;

  body.dataset.p = n;

  body.classList.remove("s1");

  body.dataset.p1variant = b.dataset.variant || "0";


  $$(".num").forEach((x) => {
    x.classList.remove("on", "chain-next");
    x.textContent = x.dataset.n;
  });


  b.classList.add("on");

  b.textContent = "(" + n + ")";


  const kind =
    b.classList.contains("tabs-page")
      ? "tabs"
      : b.classList.contains("cross-page")
        ? "cross"
        : b.classList.contains("dial-page")
          ? "dial"
          : b.classList.contains("camera-page")
            ? "camera"
            : b.classList.contains("archive-page")
              ? "archive"
              : "comments";

  crossOn = false;


  $$(".page").forEach((p) => {

    p.classList.toggle(
      "on",
      p.dataset.n === n &&
        (!p.dataset.kind || p.dataset.kind === kind)
    );

  });


  /* PAGE 1 POEMS */

  if (n === "1") {

    const variant = Number(b.dataset.variant || 0);

    $$("#p1 .poem-1").forEach((p) => {
      p.classList.toggle("on", Number(p.dataset.variant) === variant);
    });

  }


  body.dataset.v = "page";

  body.classList.toggle("flyers", kind === "tabs" && n === "2");


  if (n === "7" && kind === "comments") {
    initPage7();
  }

  if (n === "7" && kind === "camera") {
    initCameraPage();
  }

  if (n === "9" && kind === "archive") {
    initArchivePage();
  }

  if (n === "2") {
    initTabs(b);
  }


  const nx = b.classList.contains("chain917") ? NEXT[n] : null;

  if (nx && nx !== b) {
    nx.classList.add("chain-next");
    nx.textContent = "(" + nx.dataset.n + ")";
  }


  $("#talk").pause();


  /* RED (9): background video WITH sound */

  redNineOn = n === "9" && kind === "comments";

  playRedNineVideo(redNineOn);


  const v = Number(b.dataset.variant || 0);

  if (
    (n === "9" && !redNineOn) ||
    (n === "1" && (v === 0 || v === 2))
  ) {
    $("#talk").play().catch(() => {});
  }

}


function playRedNineVideo(on) {

  const vid = $("#vid");

  if (!vid) {
    return;
  }

  if (!on) {
    vid.pause();
    return;
  }

  vid.muted = false;

  vid.currentTime = 0;

  vid.play().catch(() => {

    /* browser blocked sound: play silently instead */

    vid.muted = true;

    vid.play().catch(() => {});

  });

}


/* ==========================================================
   STAGE
   ========================================================== */

function stage() {

  if (cur === "9") {

    body.classList.toggle("s1");

    if (redNineOn) {

      const v = $("#vid");

      if (v) {
        v.muted = false;
        v.play().catch(() => {});
      }

    } else {

      $("#talk").play().catch(() => {});

    }

  }

}


/* ==========================================================
   5. FLYER TABS
   ========================================================== */

function initTabs(button) {

  if (!button.classList.contains("tabs-page")) {
    return;
  }

  const field = $("#tabsField");

  const cities = $("#cities");

  field.innerHTML = "";

  /* back to the tabs: hide the Invisible Cities spreads */

  cities.classList.remove("show");

  cities.scrollTop = 0;


  [
    "APARTMENT WANTED",
    "ROOMMATE WANTED",
    "LOST CAT",
    "SE BUSCA HABITACIÓN",
    "找室友",
    "BABYSITTER WANTED",
    "VÉLO À VENDRE",
    "ROOM FOR RENT",
    "COURS DE LANGUE",
    "GUITAR LESSONS",
    "找房子",
    "ENCONTRADO — LLAVES",
  ].forEach((label) => {

    const tab = document.createElement("button");

    tab.type = "button";

    tab.className = "flyer-tab";

    tab.textContent = label;

    tab.setAttribute("aria-label", label + " tab");

    tab.style.setProperty("--r", Math.random() * 50 - 25 + "deg");


    const drop = () => {

      if (tab.classList.contains("falling")) {
        return;
      }

      tab.classList.add("falling");

      setTimeout(() => {

        tab.classList.add("gone");

        /* last tab gone: the Invisible Cities spreads fade in */

        if (!field.querySelector(".flyer-tab:not(.gone)")) {

          setTimeout(() => cities.classList.add("show"), 600);

        }

      }, 1650);

    };

    tab.addEventListener("pointerenter", drop);

    tab.addEventListener("click", drop);

    field.appendChild(tab);

  });

}


/* "Put the tabs back" at the end of the Invisible Cities scroll */

$("#citiesAgain").addEventListener("click", () => {
  initTabs($(".num.tabs-page"));
});


/* ==========================================================
   6. PAGE 7 — DRAGGABLE FLYER COLLAGE
   ========================================================== */

const messageInput = $("#messageInput");

const savedNote = $("#savedNote");


/*
 * The collage images are written in index.html.
 * Here we only make them draggable.
 */

function initPage7() {}

$$("#p7 .drag-img").forEach(makeDraggable);


/* ==========================================================
   COMMENTS
   ========================================================== */

let db = null;

let isOwner = false;

let dbReady = false;

let shared = [];

const LOCAL_MESSAGES_KEY = "studio-messages";


function getLocalMessages() {

  try {

    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);

    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter((m) => m && typeof m.text === "string" && m.text.trim())
      : [];

  } catch (e) {

    return [];

  }

}


function saveLocalMessages(messages) {

  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
  } catch (e) {}

}


function allMsgs() {

  return dbReady ? shared : getLocalMessages();

}


/* SUBMIT COMMENT */

$("#messageSend").onclick = async () => {

  const v = messageInput.value.trim().slice(0, 400);

  if (!v) {
    return;
  }

  if (dbReady) {

    try {

      await db.collection("messages").add({
        text: v,
        ts: Date.now(),
      });

    } catch (e) {

      messageInput.placeholder = "couldn't save your message";

      return;

    }

  } else {

    const messages = getLocalMessages();

    messages.push({
      id:
        "local-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2),
      text: v,
      ts: Date.now(),
    });

    saveLocalMessages(messages);

    renderMessageDots();

  }

  messageInput.value = "";

};


$("#messageReset").onclick = async () => {

  if (!confirm("Reset all messages?")) {
    return;
  }

  if (dbReady) {

    try {

      const snap = await db.collection("messages").get();

      const batch = db.batch();

      snap.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

    } catch (e) {

      console.error("Could not reset messages:", e);

      return;

    }

  }

  try {
    localStorage.removeItem("studio-messages");
  } catch (e) {}

  renderMessageDots();

  messageInput.value = "";

};


/* ==========================================================
   7. COMMENT DOTS
   ========================================================== */

function renderMessageDots() {

  const p2 = $("#p2");

  if (!p2) {
    return;
  }

  p2.querySelectorAll(".message-dot").forEach((el) => el.remove());


  allMsgs().forEach((m, index) => {

    const dot = document.createElement("span");

    dot.className = "message-dot";

    dot.style.left = 8 + ((index * 31) % 84) + "%";

    dot.style.top = 14 + ((index * 47) % 72) + "%";


    const label = document.createElement("span");

    label.className = "dot-message";

    label.textContent = "";

    dot.appendChild(label);

    p2.appendChild(dot);


    let typingTimer = null;


    const showMessage = () => {

      clearInterval(typingTimer);

      p2.querySelectorAll(".message-dot").forEach((d) => {

        if (d !== dot) {
          d.classList.add("dim");
          d.classList.remove("show", "active");
        }

      });

      dot.classList.add("active", "show");

      label.textContent = "";

      let i = 0;

      typingTimer = setInterval(() => {

        label.textContent = m.text.slice(0, ++i);

        if (i >= m.text.length) {
          clearInterval(typingTimer);
        }

      }, 35);

    };


    const hideMessage = () => {

      clearInterval(typingTimer);

      dot.classList.remove("active", "show");

      p2.querySelectorAll(".message-dot").forEach((d) => d.classList.remove("dim"));

      label.textContent = "";

    };


    dot.addEventListener("mouseenter", showMessage);
    dot.addEventListener("mouseleave", hideMessage);
    dot.addEventListener("focus", showMessage);
    dot.addEventListener("blur", hideMessage);

  });

}

renderMessageDots();


/* DATABASE */

(async () => {

  try {

    if (typeof claude === "undefined") {
      return;
    }

    const [d, u] = await Promise.all([
      claude.use("db"),
      claude.use("user"),
    ]);

    if (!d || !u) {
      return;
    }

    db = d;

    isOwner = u.isOwner();

    dbReady = true;

    db.collection("messages").onSnapshot(

      (s) => {

        shared = s.docs
          .map((x) => ({
            id: x.id,
            text: String((x.data() || {}).text || ""),
            ts: Number((x.data() || {}).ts || 0),
          }))
          .filter((m) => m.text.trim());

        shared.sort((a, b) => a.ts - b.ts);

        renderMessageDots();

      },

      () => {}

    );

  } catch (e) {}

})();


/* SHIFT + C
   DELETE ALL COMMENTS */

addEventListener("keydown", async (e) => {

  if (
    e.target.tagName === "TEXTAREA" ||
    !e.shiftKey ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    e.key.toUpperCase() !== "C" ||
    !isOwner ||
    !dbReady
  ) {
    return;
  }

  if (!confirm("Delete all comments?")) {
    return;
  }

  for (const m of shared) {

    try {
      await db.collection("messages").doc(m.id).delete();
    } catch (_) {}

  }

});


/* SHIFT + R
   REARRANGE COMMENT DOTS */

addEventListener("keydown", (e) => {

  if (
    e.target.tagName === "TEXTAREA" ||
    !e.shiftKey ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    e.key.toUpperCase() !== "R" ||
    body.dataset.p !== "2"
  ) {
    return;
  }

  e.preventDefault();

  document.querySelectorAll("#p2 .message-dot").forEach((dot) => {

    dot.style.left = 5 + Math.random() * 90 + "%";

    dot.style.top = 8 + Math.random() * 84 + "%";

  });

});


/* ==========================================================
   8. FLYER MAP
   ========================================================== */

let crossOn = false;

let typeTimer = null;


function typeInto(el, text) {

  clearInterval(typeTimer);

  el.textContent = "";

  el.classList.add("typing");

  let i = 0;

  typeTimer = setInterval(() => {

    el.textContent = text.slice(0, ++i);

    if (i >= text.length) {
      clearInterval(typeTimer);
    }

  }, 45);

}


(function buildMap() {

  const map = $("#flyerMap");

  if (!map) return;

  $$("#flyerMap .spot").forEach((s) => {

    const place = s.dataset.place || "";
    const img = s.querySelector("img");
    const cap = s.querySelector(".cap");

    if (!img || !cap) return;


    /* random scatter (new offsets on every load) */

    const rnd = (a, b) => (Math.random() * (b - a) + a).toFixed(2);

    s.style.setProperty("--sx", rnd(-3, 3) + "vw");
    s.style.setProperty("--sy", rnd(-5, 6) + "vh");


    /* TURN ON
       Keep the flyer in its original position.
       The CSS handles the enlargement. */

    const on = () => {

      s.style.setProperty("--tx", "0px");
      s.style.setProperty("--ty", "0px");

      map.classList.add("focus");

      s.classList.add("active");

      typeInto(cap, place);

    };


    /* TURN OFF */

    const off = () => {

      clearInterval(typeTimer);

      map.classList.remove("focus");

      s.classList.remove("active");

      cap.textContent = "";

      cap.classList.remove("typing");

    };


    /* DESKTOP HOVER */

    s.addEventListener("pointerenter", on);

    s.addEventListener("pointerleave", off);


    /* CLICK / TOUCH */

    s.addEventListener("click", () => {

      if (s.classList.contains("active")) {
        off();
      } else {
        on();
      }

    });

  });

})();


/* ==========================================================
   9. DIAL
   ========================================================== */

let actx = null;

const DTMF = {

  1: [697, 1209],
  2: [697, 1336],
  3: [697, 1477],

  4: [770, 1209],
  5: [770, 1336],
  6: [770, 1477],

  7: [852, 1209],
  8: [852, 1336],
  9: [852, 1477],

  "*": [941, 1209],
  0: [941, 1336],
  "#": [941, 1477],

};


function tone(freqs, dur = 0.14, when = 0, vol = 0.06) {

  try {

    actx =
      actx ||
      new (window.AudioContext || window.webkitAudioContext)();

    freqs.forEach((f) => {

      const o = actx.createOscillator();

      const g = actx.createGain();

      o.frequency.value = f;

      g.gain.value = vol;

      const t = actx.currentTime + when;

      o.connect(g);

      g.connect(actx.destination);

      o.start(t);

      g.gain.setValueAtTime(vol, t + dur - 0.02);

      g.gain.linearRampToValueAtTime(0, t + dur);

      o.stop(t + dur);

    });

  } catch (e) {}

}


const dialAnswers = [

  "sorry — the wall painter has picked up a job across town.",

  "the person you're looking for moved out last week.",

  "sorry, wrong number. the flyer is still up though.",

  "the room has already been taken.",

  "sorry — the dog walker is booked until thursday.",

  "the piano teacher is not taking new students.",

  "someone answers, then asks if you're calling about the room.",

  "sorry — the keys were found this morning.",

  "the person who posted this number no longer lives here.",

  "the bike has already been sold.",

  "sorry — the babysitter is working tonight.",

  "the number belongs to a different flyer now.",

  "the landlord says the apartment is gone.",

  "someone picks up. you hear traffic, then a bus pulling away.",

  "sorry — the person who posted this has left the city.",

  "the cat came home. no longer missing.",

  "the room is still available, but only until friday.",

  'someone answers and says, "you must have the old flyer."',

  "sorry — the guitar lessons are full.",

  "the person answering says they never put their number on a flyer.",

  "the number works, but nobody seems to know why.",

  "sorry. the job was filled yesterday.",

  "someone answers and asks where you found the number.",

];


let dialDigits = "";

let dialBusy = false;

const screen = $("#dialScreen");

const dmsg = $("#dialMsg");

const pad = $("#dialPad");


function updateDialScreen() {

  let formatted = "+1 (917)";

  if (dialDigits.length > 0) {
    formatted += " " + dialDigits.slice(0, 3);
  }

  if (dialDigits.length > 3) {
    formatted += "-" + dialDigits.slice(3, 7);
  }

  screen.textContent = formatted;

}


["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].forEach((k) => {

  const b = document.createElement("button");

  b.type = "button";

  b.textContent = k;

  b.onclick = () => {

    if (dialBusy) {
      return;
    }

    if (!/^\d$/.test(k)) {
      return;
    }

    if (dialDigits.length >= 7) {
      return;
    }

    dialDigits += k;

    updateDialScreen();

    tone(DTMF[k]);

  };

  pad.appendChild(b);

});


const callB = document.createElement("button");

callB.type = "button";

callB.className = "call";

callB.textContent = "call";

callB.onclick = () => {

  if (dialBusy) {
    return;
  }

  if (dialDigits.length !== 7) {
    dmsg.textContent = "enter all seven digits.";
    return;
  }

  dialBusy = true;

  dmsg.textContent = "calling…";

  updateDialScreen();

  [0, 1.4].forEach((w) => {
    tone([440, 480], 0.9, w, 0.05);
  });

  setTimeout(() => {

    const answer =
      dialAnswers[Math.floor(Math.random() * dialAnswers.length)];

    dmsg.textContent = answer;

    setTimeout(() => {

      dialDigits = "";

      updateDialScreen();

      dmsg.textContent = "Call the number on the tab.";

      dialBusy = false;

    }, 3200);

  }, 3000);

};

pad.appendChild(callB);


const clrB = document.createElement("button");

clrB.type = "button";

clrB.textContent = "←";

clrB.onclick = () => {

  if (dialBusy) {
    return;
  }

  dialDigits = dialDigits.slice(0, -1);

  updateDialScreen();

};

pad.appendChild(clrB);

updateDialScreen();


/* ==========================================================
   10. "+" BUTTON
   ========================================================== */

$("#plus").onclick = () => {

  $("#talk").pause();

  $("#walk").classList.remove("show");

  go(body.dataset.v === "menu" ? "intro" : "menu");

};


/* CUSTOM CURSOR — INTERACTION STATES */

const customCursor = document.querySelector("#cursor");

const cursorTargets = [
  "a",
  "button",
  ".p1",
  ".num",
  ".flyer-tab",
  ".drag-img",
  ".spot",
  "[role='button']",
  "input",
  "textarea",
  "select",
  "[draggable='true']",
].join(",");

if (customCursor) {

  /* Track the pointer position */
  document.addEventListener("pointermove", (event) => {

    customCursor.style.left = `${event.clientX}px`;
    customCursor.style.top = `${event.clientY}px`;

    document.body.classList.add("cursor-active");

  });

  /* Reflect hover */
  document.addEventListener("pointerover", (event) => {

    if (event.target.closest?.(cursorTargets)) {
      document.body.classList.add("cursor-hover");
    }

  });

  document.addEventListener("pointerout", (event) => {

    const nextTarget = event.relatedTarget;

    if (!nextTarget || !nextTarget.closest?.(cursorTargets)) {
      document.body.classList.remove("cursor-hover");
    }

  });

  /* Reflect click / press */
  document.addEventListener("pointerdown", (event) => {

    document.body.classList.add("cursor-click");

    const grabTarget = event.target.closest?.(
      ".drag-img, .flyer-tab, [draggable='true']"
    );

    if (grabTarget) {
      document.body.classList.add("cursor-grab");
    }

  });

  /* Release the cursor after interaction */
  document.addEventListener("pointerup", () => {
    document.body.classList.remove("cursor-click", "cursor-grab");
  });

  document.addEventListener("pointercancel", () => {
    document.body.classList.remove("cursor-click", "cursor-grab");
  });

  /* Reset states when the pointer leaves the window */
  document.addEventListener("pointerleave", (event) => {

    if (!event.relatedTarget) {
      document.body.classList.remove(
        "cursor-hover",
        "cursor-click",
        "cursor-grab",
        "cursor-active"
      );
    }

  });

}


/* LEGACY CAMERA */

$("#camBtn").onclick = async (e) => {

  try {

    $("#camv").srcObject = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    $("#camv").play();

    e.target.remove();

  } catch (_) {

    e.target.textContent = "Camera blocked.";

  }

};


/* ==========================================================
   11. HAND GESTURES
   ========================================================== */

function gesture(g) {

  const v = $("#vid");

  const a = $("#talk");

  if (g === "fist") {

    if (v) {
      v.pause();
    }

    a.pause();

  } else if (g === "open") {

    if (v && redNineOn) {
      v.play().catch(() => {});
    }

    if (cur === "9" && !redNineOn) {
      a.play().catch(() => {});
    }

  } else if (g === "swipe_left" || g === "swipe_right") {

    go("menu");

  } else if (g === "point" && cur) {

    stage();

  }

}


/* WEBSOCKET */

function connect() {

  try {

    const ws = new WebSocket("ws://localhost:9980");

    ws.onmessage = (e) => {

      try {

        const d = JSON.parse(e.data);

        if (typeof d.x === "number" && typeof d.y === "number") {

          point(
            (d.mirrored === false ? d.x : 1 - d.x) * innerWidth,
            d.y * innerHeight,
            true
          );

        }

        if (d.gesture) {
          gesture(d.gesture);
        }

      } catch (_) {

        gesture(String(e.data).trim());

      }

    };

    ws.onclose = () => setTimeout(connect, 4000);

  } catch (_) {}

}

connect();


addEventListener("keydown", (e) => {

  if (e.target.tagName === "TEXTAREA") {
    return;
  }

  const m = {
    o: "open",
    f: "fist",
    s: "swipe_left",
    p: "point",
  };

  if (m[e.key]) {
    gesture(m[e.key]);
  }

  if (e.key === "Escape") {
    go("menu");
  }

});


/* ==========================================================
   12. CAMERA + PHOTO ARCHIVE
   ========================================================== */

const PHOTO_KEY = "studio-photo-archive";

const OLD_PHOTO_KEY = "studio-captured-photo";

const ARCHIVE_SQUARES = 20;

let cameraStream = null;


/* PHOTO STORAGE */

function getPhotoArchive() {

  try {

    const raw = localStorage.getItem(PHOTO_KEY);

    if (raw) {

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {

        return parsed.filter(
          (item) => item && typeof item.photo === "string"
        );

      }

    }

  } catch (e) {}


  try {

    const oldPhoto = localStorage.getItem(OLD_PHOTO_KEY);

    if (oldPhoto) {

      const migrated = [
        {
          id: "migrated-" + Date.now(),
          photo: oldPhoto,
          message: "",
        },
      ];

      localStorage.setItem(PHOTO_KEY, JSON.stringify(migrated));

      return migrated;

    }

  } catch (e) {}


  return [];

}


function savePhotoArchive(photos) {

  try {

    localStorage.setItem(PHOTO_KEY, JSON.stringify(photos));

  } catch (e) {

    console.error("Could not save photo archive.", e);

  }

}


/* RESET PHOTOS */

function resetPhotoArchive() {

  if (!confirm("RESET ALL SUBMITTED PHOTOS?")) {
    return;
  }

  try {

    localStorage.removeItem(PHOTO_KEY);

    localStorage.removeItem(OLD_PHOTO_KEY);

  } catch (e) {

    console.error("Could not reset photos.", e);

  }

  const preview = $("#capturePreview");

  if (preview) {
    preview.removeAttribute("src");
    preview.classList.remove("has-photo");
  }

  const status = $("#cameraStatus");

  if (status) {
    status.textContent = "CAMERA OFF";
  }

  const message = $("#photoMessage");

  if (message) {
    message.value = "";
  }

  initArchivePage();

}

const photoReset = $("#photoReset");

if (photoReset) {

  photoReset.onclick = () => {
    resetPhotoArchive();
  };

}


/* CAMERA PAGE */

function initCameraPage() {

  const video = $("#captureVideo");

  const preview = $("#capturePreview");

  const status = $("#cameraStatus");

  if (!video || !preview || !status) {
    return;
  }

  const photos = getPhotoArchive();

  const latest = photos.length ? photos[photos.length - 1] : null;

  if (latest) {

    preview.src = latest.photo;

    preview.classList.add("has-photo");

    status.textContent = "PHOTO SAVED";

  } else {

    preview.removeAttribute("src");

    preview.classList.remove("has-photo");

    status.textContent = "CAMERA OFF";

  }

}


/* START CAMERA */

async function startCamera() {

  const video = $("#captureVideo");

  const status = $("#cameraStatus");

  if (!video || !status) {
    return;
  }

  try {

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });

    video.srcObject = cameraStream;

    await video.play();

    status.textContent = "CAMERA ON";

  } catch (error) {

    console.error(error);

    status.textContent = "CAMERA UNAVAILABLE";

  }

}


/* TAKE PHOTO */

function capturePhoto() {

  const video = $("#captureVideo");

  const canvas = $("#captureCanvas");

  const preview = $("#capturePreview");

  const status = $("#cameraStatus");

  const message = $("#photoMessage");

  if (!video || !canvas || !preview || !video.videoWidth) {

    if (status) {
      status.textContent = "TURN ON CAMERA FIRST";
    }

    return;

  }

  const maxWidth = 1400;

  const scale = Math.min(1, maxWidth / video.videoWidth);

  const width = Math.round(video.videoWidth * scale);

  const height = Math.round(video.videoHeight * scale);

  canvas.width = width;

  canvas.height = height;

  const ctx = canvas.getContext("2d");

  /* Mirror the camera photo. */

  ctx.save();

  ctx.translate(width, 0);

  ctx.scale(-1, 1);

  ctx.drawImage(video, 0, 0, width, height);

  ctx.restore();

  const photo = canvas.toDataURL("image/jpeg", 0.88);

  const text = message ? message.value.trim().slice(0, 240) : "";

  const photos = getPhotoArchive();

  photos.push({
    id:
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2),
    photo: photo,
    message: text,
  });

  savePhotoArchive(photos);

  preview.src = photo;

  preview.classList.add("has-photo");

  status.textContent = "PHOTO SAVED";

  if (message) {
    message.value = "";
  }

  initArchivePage();

}


/* CAMERA BUTTONS */

const cameraStart = $("#cameraStart");

const cameraCapture = $("#cameraCapture");

if (cameraStart) {
  cameraStart.onclick = startCamera;
}

if (cameraCapture) {
  cameraCapture.onclick = capturePhoto;
}


/* PHOTO ARCHIVE */

function initArchivePage() {

  const grid = $("#archiveGrid");

  const note = $("#archiveNote");

  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  if (note) {
    note.textContent = "";
  }

  const photos = getPhotoArchive();


  for (let i = 0; i < ARCHIVE_SQUARES; i++) {

    const square = document.createElement("button");

    square.type = "button";

    square.className = "archive-square";

    const item = photos[i];

    if (!item) {

      square.classList.add("empty");

      grid.appendChild(square);

      continue;

    }


    const img = document.createElement("img");

    img.src = item.photo;

    img.alt = "Photo left on 7";

    img.style.filter = "none";

    square.appendChild(img);


    /* caption typed under the photo; photo expands, others blur */

    const cap = document.createElement("div");

    cap.className = "cap";

    square.appendChild(cap);

    let lastPointer = "mouse";


    const on = () => {

      /* keep the enlarged photo inside the screen:
         work out the nudge from its untransformed layout box */

      const zoom =
        parseFloat(getComputedStyle(square).getPropertyValue("--zoom")) || 1.6;

      const g = grid.getBoundingClientRect();

      const w = square.offsetWidth;
      const h = square.offsetHeight;

      const cx = g.left + square.offsetLeft + w / 2;
      const cy = g.top + square.offsetTop + h / 2;

      const hw = (w * zoom) / 2;
      const hh = (h * zoom) / 2;

      const pad = 10;

      /* caption now sits on the photo, so no extra room is needed */
      const capRoom = 0;

      let dx = 0;
      let dy = 0;

      if (cx - hw < pad) dx = pad - (cx - hw);

      if (cx + hw > window.innerWidth - pad) {
        dx = window.innerWidth - pad - (cx + hw);
      }

      if (cy - hh < pad) dy = pad - (cy - hh);

      if (cy + hh + capRoom > window.innerHeight - pad) {
        dy = window.innerHeight - pad - (cy + hh + capRoom);
      }

      square.style.setProperty("--tx", dx / zoom + "px");
      square.style.setProperty("--ty", dy / zoom + "px");

      grid.classList.add("focus");

      square.classList.add("active");

      typeInto(cap, item.message || "");

    };


    const off = () => {

      clearInterval(typeTimer);

      grid.classList.remove("focus");

      square.classList.remove("active");

      cap.textContent = "";

      cap.classList.remove("typing");

    };


    square.addEventListener("pointerenter", (e) => {

      lastPointer = e.pointerType;

      if (e.pointerType !== "touch") on();

    });

    square.addEventListener("pointerleave", (e) => {

      if (e.pointerType !== "touch") off();

    });

    /* touch: tap to open, tap again to close */

    square.addEventListener("click", () => {

      if (lastPointer !== "touch") return;

      square.classList.contains("active") ? off() : on();

    });

    /* keyboard */

    square.addEventListener("focus", () => {

      if (lastPointer !== "touch" && !square.classList.contains("active")) {
        on();
      }

    });

    square.addEventListener("blur", off);


    grid.appendChild(square);

  }

}


/* ==========================================================
   13. PAGE 1 — DRAGGABLE IMAGE
   ========================================================== */

$$("#p1 .fill").forEach((img) => {

  img.draggable = false;

  makeDraggable(img);

});


/* DRAGGING
   (shared by the page 7 collage images and the page 1 poem images) */

function makeDraggable(el) {

  let down = false;

  let ox = 0;
  let oy = 0;

  let parent = null;


  el.addEventListener("pointerdown", (e) => {

    parent = el.offsetParent || el.parentElement;

    const r = el.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();

    /*
     * IMPORTANT:
     * Convert the image's current position to left/top BEFORE
     * removing right-based positioning. This prevents the jump.
     */

    const currentLeft = r.left - pr.left + parent.scrollLeft;

    const currentTop = r.top - pr.top + parent.scrollTop;

    el.style.left = currentLeft + "px";
    el.style.top = currentTop + "px";
    el.style.right = "auto";

    /*
     * Remember exactly where inside the image the user clicked.
     */

    ox = e.clientX - r.left;
    oy = e.clientY - r.top;

    down = true;

    el.setPointerCapture(e.pointerId);

    el.style.zIndex = 20;

    e.preventDefault();

  });


  el.addEventListener("pointermove", (e) => {

    if (!down || !parent) {
      return;
    }

    const pr = parent.getBoundingClientRect();

    const x = e.clientX - pr.left - ox + parent.scrollLeft;

    const y = e.clientY - pr.top - oy + parent.scrollTop;

    el.style.left = x + "px";
    el.style.top = y + "px";

  });


  const end = () => {

    down = false;

    el.style.zIndex = 10;

  };

  el.addEventListener("pointerup", end);

  el.addEventListener("pointercancel", end);

}