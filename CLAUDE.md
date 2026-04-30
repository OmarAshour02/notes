# Writing guide for this blog

This file tells Claude how to draft, edit, and review posts for this blog.
The author is **Omar Ashour**. English is his second language, around the
**B2** level. He likes the writing style of the **OSTEP** book (*Operating
Systems: Three Easy Pieces* by Remzi and Andrea Arpaci-Dusseau) and wants
posts on this blog to feel like that.

When the user asks you to **draft, edit, polish, or rephrase** anything for
a post, follow the rules below.

---

First of all, never ever include em dashes. 

## The voice we are aiming for

OSTEP is a textbook, but it does not sound like one. It sounds like a
smart friend explaining a hard idea at a kitchen table. The two things
that make it feel that way:

1. **It talks to the reader.** Not "the reader will see," but **"you will
   see."** Not "one might wonder," but **"you may be wondering."**
2. **It is happy to be reading.** It uses small jokes, asides, surprised
   questions, and short sentences with a wink. It never sneers. It never
   tries to sound clever for its own sake.

Concrete moves to copy:

- **Ask a question, then answer it.**
  > But what happens when the memtable gets full? Good question. The
  > database flushes it to disk.
- **Use "we" and "let us" freely.**
  > Now let us see what happens on a read.
- **Name the hard part out loud.**
  > This is the tricky bit, so read it twice.
- **Use everyday analogies.** Sandwich makers, kitchens, libraries,
  filing cabinets. Things from real life, not other systems.
- **End sections with a small punch line** when one is there. Do not
  force it.
- **The Crux.** OSTEP often opens a section with *"The crux of the
  problem"* — one line stating the question the section answers. Use
  this when it fits.
- **Tip / Aside boxes.** OSTEP uses sidebars for "Tip:", "Aside:", and
  small historical notes. On this blog, use the existing
  `<Sidenote>` component for those.

---

## Writing for a B2 English speaker (the author)

The author writes drafts and you help polish them. He understands more
English than he comfortably writes. So:

- **Prefer short sentences.** Aim for under 20 words. If a sentence is
  longer, check that it earns its length. Split it if not.
- **Use common verbs.** Write *use* instead of *utilize*, *show* instead
  of *demonstrate*, *help* instead of *facilitate*, *start* instead of
  *commence*.
- **Avoid hard idioms.** Phrases like *bite the bullet*, *cut to the
  chase*, *in a nutshell*, or *it goes without saying* often confuse
  non-native readers. Drop them or rewrite.
- **Avoid heavy phrasal verbs** when one verb works. *Look into it* →
  *check it*. *Bring about* → *cause*. *Carry out* → *do*.
- **Avoid sarcasm and irony.** They do not travel well. Light, warm
  humor is fine. Dry humor that depends on tone of voice is not.
- **Be careful with negatives.** Double negatives (*not unlikely*) and
  buried negatives (*fails to not return*) are confusing. Say what is,
  not what is not.
- **One idea per paragraph.** If a paragraph has two ideas, split it.
- **Active voice by default.** "The database writes the file" beats
  "the file is written by the database."

When the author writes something a little off — a missing article, a
wrong preposition, a non-idiomatic phrase — fix it quietly. Do not
mention the fix unless he asks. The goal is that the final post reads
like a native-English author wrote it, while keeping his ideas, his
choices, and his voice.

---

## Structure of a post

A typical post on this blog has this shape:

1. **Hook.** One or two short paragraphs. Set the problem. Why should
   the reader care?
2. **The crux.** One sentence that names the question the post answers.
3. **Sections (H2).** Each section answers one piece of the question.
   The H2 is a short, plain-English label, not a clever pun.
4. **Interactive demo, if one fits.** Drop in a React island and tell
   the reader what to try with it.
5. **A "why this matters" closing.** One short section that connects
   the idea back to a real system or a real choice.
6. **A pointer forward** if there is a next post coming.

Keep paragraphs short (3–5 sentences). White space is your friend.

---

## Components you can use inside MDX

```mdx
import Sidenote from "~/components/Sidenote.astro";
import SSTableDemo from "~/components/demos/SSTableDemo.tsx";

<Sidenote>
  Short aside here. Good for a fact, a citation, or a small joke.
</Sidenote>

<SSTableDemo client:load />
```

Other notes:

- The frontmatter field `titleAccent` picks one letter of the title to
  color in red and italic. Pick a letter the eye will land on (often
  the first letter of the first word).
- The frontmatter field `noteId` shows up as `Note № NNNN` in the
  top-right of the article header. Use it like a chapter number.
- H2 sections are auto-numbered with roman numerals (`I.`, `II.`, …)
  and the rule above each H2 cycles through the palette. So do not
  number sections by hand.

---

## Quick examples — before and after

**Before (textbook-y, abstract, B1 mistakes):**

> The utilization of an SSTable file format facilitates rapid write
> operations through the avoidance of in-place modifications which is
> a known cause of write amplification.

**After (OSTEP voice, B2 friendly, native English):**

> An SSTable is fast to write because nothing in it is ever changed.
> Once the file is on disk, it is frozen. New writes go to a new
> file. This sounds wasteful, and it is — but only for a moment, until
> compaction cleans up. We will see how soon.

---

**Before (too formal, no warmth):**

> One must consider the implications of tombstones with respect to
> read latency.

**After:**

> So what does a tombstone cost us? Every time we read a key, we may
> have to walk past tombstones in older files before we find the
> answer — or before we are sure the answer is "not found." That is
> not free.

---

## Things to avoid

- **Marketing voice.** "Unlock the power of." "Blazingly fast."
  "Industry-leading." None of that.
- **Empty hedging.** "It could be argued that, in some sense, perhaps."
  Just say it.
- **Long lists of bullet points** as a substitute for prose. Bullets
  should be short and parallel. If your bullets are paragraphs, write
  paragraphs.
- **Citing sources mid-sentence** with parenthetical years like
  *(Smith et al., 2014)*. This is a blog, not a paper. Put references
  in a sidenote or at the end.
- **Code without context.** Always say what the code shows before the
  code block, not after.

---

## When in doubt

When in doubt, imagine you are explaining the idea out loud to a
friend who is smart and curious but has never seen this topic. Read
the sentence aloud. If it would feel strange to say, rewrite it.
