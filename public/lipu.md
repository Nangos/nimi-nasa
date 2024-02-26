## How does this work?

This fun demo is built upon a widely-used technique known as **word embedding**, a key factor in enabling computers to comprehend natural languages and contributing to impressive applications like ChatGPT.

Simply put, word-embedding models try to convert a word into a *vector* that consists of hundreds of numbers. These vectors are special in a way that words with similar meanings (like "big" and "large") are mapped to vectors that are "close to" each other, while words with irrelevant meanings (like "star" and "start") are mapped to vectors "far far away".

Finding such a word-to-vector mapping is absolutely not an easy job. Nevertheless, there are open-source mappings readily available *(at least for English)*, so that I could directly build this demo upon one of them, namely *(a subset of)* the *GoogleNews-vectors-negative300* model.

**The idea is to simply "inject" Toki Pona words into a model that originally maps English words onto vectors.** The Naive way is to identify several English "representives" for each Toki Pona word (for example, *green* and *blue* for *laso*), and simply take the **average** of their vectors as the vector of the Toki Pona word. *Hopefully*, such an averaged vector might mean, for the same example, "something between green and blue", which is *laso*, were it an English word!

Now, with vectors of all Toki Pona words (a.k.a. "nimi"s) in the hand (excluding structural words like *li* and *e*), we can continue on the following subtasks.

### Subtask 1: Finding the "nearest nimi" for any English word

For each nimi, we calculate the *cosine similarity* between the vectors of the nimi and of the English word. Nimis achieving the highest cosine similarity are then listed out.

### Subtask 2: Finding the "nearest nimi pair" for any English word

What if we could use two nimis, instead of one, to represent an English word? We naively hope that, if we somehow add two vectors together, the sum vector would mean their combined meaning.

Slightly I took a step further: instead of just adding two vectors together, let's consider all *linear combinations* of them. To find the linear combination that *best approximates* the targeted English word, the *least-square* method is the standard way. Again, all possible nimi pairs are enumerated, and the best of them are listed out.

### Subtask 3: Approximating any English word with all 100+ nimis

What if we take *all* the nimis, instead of just two, to approximate the given English word? This is also fun to experiment. In some sense, we may hope to somehow "extract" the concept out of the English word and "break it down" into the "more elementary" concepts in Toki Pona.

The result is also shown on this webpage. How does that "play out"?

### Technological Side

To run this demo, we need to store somewhere these hundreds of thousands of vectors for all English words, or many millions of numbers! *That is huge, so instead of letting your computer download all of them at once, I store these vectors on a server.* The server also does all the calculations under the hood.

In other words, the browser on your computer sends messages to that server and receives the "raw results", and then organizes them, paints them out, and delivers them to you.

**Tip:** in case you haven't find out yet, the official definition of a nimi will appear on the top once your mouse/finger touches it.

## How does this *not* work?

Firstly, many assumptions are just a mere wish of mine. For example, is the word-embedding model sufficiently accurate for its own sake, to begin with? Then does an averaged vector lead to an averaged "meaning"? Does linear combination of vectors lead to a "blend" of meanings? If no, my calculations will be ineffective. How can we improve that?

Secondly, some English words themselves have multiple irrivalent meanings. Does *"like"* mean similarity or affection? Is *"watch"* an observation or a time keeper? Using such words as representatives will certainly bring error, and I doubt every English word could more-or-less bring such kind of error!

Moreover, maybe a Toki Pona word itself needs multiple vectors, even if there just seems to be one single meaning. For example, **part of speech** may be an important factor for the embedding, therefore *pona* and *telo* should be embedded differently depending on whether it is used as a noun, a verb, an adjective or otherwise. Consider this:
- When *telo* is used as an adjective (e.g. "wet, watery"), it merely means *the noun it modifies shares some characteristics* with water. In other words, its meaning may be somehow "weakened".
- In contrast, when used as a noun, *telo* is almost just "water" in its entirety.
- On the other side, when used as a verb (e.g. "wash, shower"), *telo* actually involves more than "water"! For example, it may also share meanings with *pona* (for the "goodness" of cleaning) and *tawa* (for the use of "running" water). This sounds like its meaning is "strengthened".

Many other problems may exist! That's why these *like* and *unlike* buttons exist. With just a simple click, your **anonymous** feedback will be sent to the server (and the *me* curiously waiting behind)!

Nevertheless, *this webpage can be seen as **inspiring** you to view a word from a new perspective, instead of providing some sort of "standard answer".* Have fun playing around!

## Contact

I am *jan pi nimi ala* on [Reddit](https://www.reddit.com/user/daniel_nango). Feel free to share your suggestions and ideas!

The project's source code will be released on GitHub soon. For specific issues and feedbacks, it would be best to visit the GitHub repository.
