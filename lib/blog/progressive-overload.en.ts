import type { BlogPost } from "./types";

export const post: BlogPost = {
  slug: "progressive-overload",
  title: "Progressive Overload: The Real Engine of Muscle Growth",
  date: "2026-10-12",
  tags: ["fitness", "muscle growth", "training", "python"],
  cover: "/blog/progressive-overload/cover.en.svg",
  coverAlt: "A retro CRT window showing the words 'Progressive Overload', rising pixel columns and a pixel-art barbell",
  summary:
    "What is progressive overload, why does it build muscle, and how do you apply it week after week? Double progression, RIR, deloads, logging your training and a small Python script for estimating your 1RM.",
  blocks: [
    {
      type: "p",
      text: "Going to the gym regularly and lifting the same weights for the same reps for months is one of the most common traps in building muscle. The body is smart: once it has adapted to a load, it has no reason to adapt any further. **Progressive overload** is all about giving it that reason. Since my own focus right now is gaining muscle, in this post I've tried to pull together the logic I use in my training, along with the science behind it.",
    },
    {
      type: "note",
      text: "This post is for general information only and is not medical or personalised training advice. If you have a health problem, an injury or any special circumstances, talk to a doctor or a qualified coach.",
    },
    { type: "h", text: "What is progressive overload?" },
    {
      type: "p",
      text: "Put simply: presenting your muscles with a **gradually increasing challenge** over time. Hypertrophy (muscle growth) is triggered when a muscle is exposed to sufficiently challenging mechanical tension. Training sends the signal, muscle protein synthesis rises during recovery, and the muscle fibres adapt so they are better prepared next time. As that adaptation happens, the same load becomes relatively easier, so to keep the signal alive you have to raise the total challenge little by little.",
    },
    {
      type: "p",
      text: "The key point: progressive overload does not mean \"lift heavier every session\". There is more than one way to make training harder, and while beginners progress quickly for weeks, experienced lifters move forward in small steps spread over months.",
    },
    { type: "h", text: "The seven levers of overload" },
    {
      type: "img",
      src: "/blog/progressive-overload/yuklenme-kollari.en.svg",
      alt: "A 'Progressive Overload' box in the centre, surrounded by boxes for load, reps, sets/volume, tempo, frequency, range of motion and rest",
      caption: "Adding weight is not the only way to increase the challenge.",
    },
    {
      type: "list",
      items: [
        "**Load:** More weight for the same number of reps. The most measurable method; steps of 2.5 kg on big lifts and 1–2 kg on small ones are plenty.",
        "**Reps:** Doing one or two more reps with the same weight. This is the first step of double progression.",
        "**Sets / volume:** Increasing the number of weekly sets per muscle group. Research points to roughly 10–20 hard sets per muscle per week as a good range for hypertrophy, but increasing volume forever will wreck your recovery.",
        "**Tempo / time under tension:** Controlling the eccentric (lowering) phase makes a movement harder. Just don't use it as an excuse to drop the weight.",
        "**Frequency:** Training a muscle group twice a week instead of once lets you split the same volume into higher-quality sets.",
        "**Range of motion (ROM):** Going from a half squat to full depth is also an increase in overload. Evidence that training a muscle in its lengthened position contributes to hypertrophy keeps growing.",
        "**Rest:** Doing the same work with shorter breaks increases density. For hypertrophy, though, resting too little between sets can hurt performance; 2–3 minutes on big lifts usually makes more sense.",
      ],
    },
    { type: "h", text: "Double progression" },
    {
      type: "p",
      text: "This is the method I use most, because it is both simple and self-regulating. You pick a **rep range**, for example 3 sets × 8–12. First you add reps at the same weight; once you hit the top of the range on every set, you bump the weight up by a small step and drop back to the bottom of the range.",
    },
    {
      type: "img",
      src: "/blog/progressive-overload/cift-asamali-ilerleme.en.svg",
      alt: "A five-step staircase: in weeks 1-4 reps at 40 kg rise from 8/8/8 to 12/12/12, and in week 5 it's back to 8/8/8 at 42.5 kg",
      caption: "Reps first, then weight: once you reach 40 kg × 12/12/12, go back to 42.5 kg × 8.",
    },
    { type: "h", text: "RPE and RIR: how hard should it be?" },
    {
      type: "p",
      text: "For progressive overload to work, your sets need to be **hard enough**. The practical way to measure that is **RIR** (Reps in Reserve) or its mirror image, **RPE** (Rate of Perceived Exertion, 1–10). RPE 8 roughly means \"I could have done 2 more reps\", i.e. RIR 2. For hypertrophy-focused training, ending most sets 0–3 reps short of failure is a good target. Taking every set to complete failure can pile on fatigue without extra benefit; I mostly save that for the last set of isolation exercises.",
    },
    { type: "h", text: "Deloads and plateaus" },
    {
      type: "p",
      text: "Constant overload also means accumulated fatigue. A **deload** means deliberately lowering volume and/or intensity for a week: usually the same exercises, with roughly half the sets and a higher RIR. For most people it makes sense every 4–8 weeks, or whenever signs of fatigue start to pile up. In the sample data below, week 6 is a deload week; afterwards volume picks up where it left off.",
    },
    {
      type: "img",
      src: "/blog/progressive-overload/hacim-grafigi.en.svg",
      alt: "Line chart of squat volume over nine weeks: rising from 4800 kg to 6000 kg, a deload drop to 3600 kg in week 6, then climbing to 6700 kg",
      caption: "Sample data: five weeks of steady increase, a deload in week 6 (~40% less volume), then a new peak.",
    },
    {
      type: "p",
      text: "Typical signs of a plateau: no increase (or a drop) in reps on the same exercise for three or four sessions in a row, warm-up sets feeling heavier than usual, poor sleep, achy joints and a lack of motivation to train. When that happens, look at sleep, nutrition and a deload first, and only then consider changing the programme (rep range, exercise selection, volume).",
    },
    { type: "h", text: "No tracking, no progress" },
    {
      type: "p",
      text: "Progressive overload is really a data problem: if you don't know what you did last week, you can't know what to beat this week. I keep a simple table:",
    },
    {
      type: "table",
      head: ["Date", "Exercise", "Weight", "Reps", "Last-set RIR"],
      rows: [
        ["07.09", "Squat", "80 kg", "8 / 8 / 7", "1"],
        ["14.09", "Squat", "80 kg", "8 / 8 / 8", "2"],
        ["21.09", "Squat", "82.5 kg", "8 / 7 / 7", "1"],
      ],
    },
    {
      type: "p",
      text: "As someone into data engineering, I couldn't resist turning this into code as well. The script below calculates total volume (weight × total reps) for each session, plus an estimated 1RM (one-rep max) using the **Epley formula**: `1RM ≈ weight × (1 + reps / 30)`. Epley becomes less reliable at high rep counts, but if you stick with the same formula it does a fine job of tracking the trend.",
    },
    {
      type: "code",
      lang: "python",
      code: `log = [
    ("07.09", "Squat", 80.0, [8, 8, 7]),
    ("14.09", "Squat", 80.0, [8, 8, 8]),
    ("21.09", "Squat", 82.5, [8, 7, 7]),
]

def epley(kg, reps):
    return kg * (1 + reps / 30)

for tarih, hareket, kg, setler in log:
    hacim = kg * sum(setler)
    e1rm = epley(kg, max(setler))
    print(f"{tarih} {hareket}: volume={hacim:.0f} kg, est. 1RM={e1rm:.1f} kg")

# 07.09 Squat: volume=1840 kg, est. 1RM=101.3 kg
# 14.09 Squat: volume=1920 kg, est. 1RM=101.3 kg
# 21.09 Squat: volume=1815 kg, est. 1RM=104.5 kg`,
    },
    {
      type: "p",
      text: "Notice: in the third session volume dipped slightly, but the estimated 1RM went up. Looking at a single metric can be misleading; tracking both together gives a healthier picture.",
    },
    { type: "h", text: "Nutrition, sleep and recovery" },
    {
      type: "p",
      text: "Training sends the signal, but recovery is what produces the growth. The main points the evidence points to:",
    },
    {
      type: "list",
      items: [
        "**Protein:** Around **1.6–2.2 g** of protein per kilogram of body weight per day is the widely accepted range for gaining muscle. Spreading it over 3–5 meals a day makes it easier for me in practice.",
        "**Calories:** A **slight calorie surplus** (roughly 5–10% above maintenance) is enough for gaining muscle. Anything beyond that mostly comes back as fat.",
        "**Sleep:** 7–9 hours a night. Short sleep directly hurts both performance and recovery.",
        "**Enough carbohydrates:** The fuel for high-volume training, especially in the meals before and after a session.",
      ],
    },
    { type: "h", text: "Common mistakes" },
    {
      type: "list",
      ordered: true,
      items: [
        "**Sacrificing form for weight:** If your range of motion is shrinking or your torso is swinging, that's not progress, it's cheating.",
        "**Increasing too fast:** Trying to add 5 kg every week will put you into a wall in no time. Small steps win in the long run.",
        "**Constantly changing the programme:** If your exercises change every week, you can't measure what is progressing. Keep the main lifts fixed for at least 6–8 weeks.",
        "**Not keeping a log:** Relying on memory ends with you repeating the previous session.",
        "**Skipping deloads and sleep:** As fatigue builds up, performance drops, and that gets mistaken for a \"plateau\".",
        "**Only looking at the weight:** More reps, more sets and better movement quality are progress too.",
      ],
    },
    {
      type: "quote",
      text: "Try to get a little better every session, but let that \"little\" be genuinely small.",
    },
    {
      type: "p",
      text: "In short, progressive overload isn't a magic programme; it's a loop of measure, push a little, recover, repeat. Just like in code, small and regular commits in training deliver sturdier results than one-off big changes.",
    },
  ],
};
