**SUBTEXT**

*The AI That Reads Between the Lines*

Comprehensive Product, Strategy & Technical Document

Version 1.0 — Confidential

2025

# **EXECUTIVE SUMMARY**

Subtext is an AI-powered conversational assistant embedded inside a smartphone keyboard that helps people navigate text-based conversations in real time. When someone receives a message they do not know how to interpret or respond to, Subtext provides instant analysis of the subtext, tone, and intent behind the message, and suggests replies calibrated to the user's goal — whether that goal is romantic, social, or professional.

The product targets a generation that grew up communicating primarily through screens but paradoxically finds text-based communication one of the most anxiety-inducing activities in their daily lives. Unlike existing solutions, Subtext works directly inside messaging apps with no context switching, no screenshots, and no copy-paste workflow. The AI lives in the keyboard itself.

The company generates revenue through a freemium subscription model. Core analysis features are free. Advanced features — relationship pattern tracking stored locally on the device, tone coaching, and scenario-specific modes for dating, interviews, and networking — are available through a monthly subscription.

|  |
| --- |
| **The One-Line Pitch**  Subtext is Grammarly for social intelligence — an AI assistant that lives in your keyboard and tells you what a message actually means and what to say back. |

# **PART ONE: THE PROBLEM**

## **1.1 The Loneliness Epidemic Is Real and Measurable**

Generation Z — people born between 1997 and 2012 — is the loneliest, most socially anxious generation in recorded history. This is not an opinion or a generational cliche. It is a measurable, documented public health crisis with hard numbers behind it.

* The American Psychological Association reports that Gen Z has the highest rates of clinical social anxiety disorder of any living generation, with over 31% of young adults experiencing an anxiety disorder at some point in their lives.
* A 2023 Gallup survey found that 22% of people worldwide often or always feel lonely — a figure that rises sharply among young adults aged 19 to 29.
* The US Surgeon General issued an advisory in 2023 specifically on the epidemic of loneliness, calling it a public health crisis comparable to smoking, with social isolation linked to a 29% increased risk of heart disease and a 32% increased risk of stroke.
* A Harvard Making Caring Common Project study found that 36% of all Americans — including 61% of young adults — report feeling lonely frequently or almost all the time.

These are not soft statistics about feelings. They are clinical, economic, and behavioral data points describing a generation that is structurally struggling to form and maintain human connections.

## **1.2 Why Gen Z Specifically**

Every generation faces social challenges. What makes Gen Z uniquely vulnerable is the specific developmental timeline they experienced. They are the first generation to go through adolescence — the critical period for developing social skills — with smartphones and social media as the dominant communication medium.

The social skills that previous generations built through face-to-face interaction — reading facial expressions, interpreting tone of voice, managing awkward silences, learning to recover from conversational mistakes — were not practiced at the same rate. Instead, adolescent social life moved to screens, where communication is asynchronous, stripped of nonverbal cues, and mediated through carefully curated self-presentation.

The result is a generation that is simultaneously over-connected and under-skilled. They have hundreds of followers. They struggle to make friends. They can craft a perfect Instagram caption. They freeze when they receive a text from someone they like.

## **1.3 The Specific Pain Point: Text Anxiety**

Within the broader social anxiety landscape, text-based communication is a uniquely acute pain point — and counterintuitively, it is harder for many people than face-to-face conversation, not easier.

This seems paradoxical. Texting gives you time to think. There is no real-time pressure. You can edit before sending. But these apparent advantages create their own problems.

* The absence of tone, facial expression, and body language means every message is radically ambiguous. 'Ok.' can mean anything from genuine agreement to barely suppressed rage depending on who sent it.
* The asynchronous nature means gaps in response time become loaded with meaning. A reply in 30 seconds means one thing. A reply in four hours means something else entirely. The problem is that the anxious person cannot tell which interpretation is accurate and which is the anxiety talking.
* The permanence of text creates performance pressure. A spoken conversation disappears. A text can be screenshotted, shared, and judged. This creates a chilling effect on authentic expression.
* The edit-before-sending feature paradoxically increases overthinking. When you can revise endlessly, many people do — and in doing so, strip all personality from their message until it reads like a legal document.

|  |
| --- |
| **The Core Pain in One Scenario**  You receive a message from someone you like. It says: 'Hey, I might not be able to make it Saturday.' That is nine words. It tells you almost nothing. Is this a soft cancel? Are they testing whether you care? Are they genuinely busy? Is this the beginning of being ghosted? Your brain spins on this for two hours. You draft and delete seventeen responses. You screenshot it and send it to your group chat. They give you five different interpretations, none of which resolve the ambiguity. You eventually send a reply that is safe to the point of being characterless, and wonder why the conversation feels dead. |

That experience — the nine-word message that consumes two hours of mental energy — is what Subtext is built to solve.

## **1.4 The Existing Workarounds Are Broken**

People experiencing text anxiety are not passive about it. They have developed workarounds. The problem is that every existing workaround is either too slow, too socially costly, or too generic to be consistently useful.

|  |  |  |
| --- | --- | --- |
| **Workaround** | **What It Does Well** | **Where It Fails** |
| Screenshot to group chat | Free, socially normal | Slow, opinions conflict, requires you to have friends available, not private |
| Paste into ChatGPT | Fast, private, surprisingly useful | Requires leaving the app, breaking flow, pasting manually — 5+ steps |
| Ask a trusted friend | Personalised, emotionally supportive | Only useful if friend is available, creates social debt, not scalable |
| Rizz App / Keys AI | Purpose-built, app-store available | Screenshot upload workflow, no contextual memory, generic suggestions |
| Just send something | No friction | High anxiety during and after, often results in regretted message |
| Do nothing / ghost back | No anxiety in the moment | Kills the connection entirely, increases shame and avoidance |

The gap in the market is not a better ChatGPT wrapper. It is a purpose-built tool with zero context switching and enough contextual awareness to give advice that accounts for who the other person is — not just what they said.

# **PART TWO: THE SOLUTION**

## **2.1 What Subtext Is**

Subtext is a custom keyboard application for Android and iOS. It installs as a third-party keyboard — the same way Gboard or SwiftKey installs — and becomes available inside any messaging app the user chooses to use it in. This includes WhatsApp, Instagram DMs, iMessage, Snapchat, Telegram, and any other messaging platform.

Inside the keyboard, there is a persistent panel above the typing area. This panel is the Subtext interface. It serves two functions: it accepts incoming message context, and it delivers AI-generated analysis and reply suggestions.

The core user flow looks like this.

1. User receives a message they are unsure about.
2. User long-presses the message and copies it. One tap.
3. User opens their Subtext keyboard. The copied text appears in the context panel automatically.
4. Subtext instantly shows: what this message likely means, the emotional tone behind it, and two or three suggested replies calibrated to different goals.
5. User picks a suggestion, edits it to their own voice, or uses it as a launching pad and types their own response.
6. The context panel remembers the exchange, building understanding of that conversation as the session continues.

No screenshots. No leaving the app. No copy-pasting into a separate browser tab. The analysis is in the keyboard itself, visible exactly when and where the user needs it.

## **2.2 The Keyboard Architecture Advantage**

The decision to build as a keyboard is not an aesthetic choice. It is the central engineering and product decision that makes Subtext's user experience fundamentally different from every competitor.

Every existing AI texting assistant — Rizz App, Keys AI, Wingman — uses the same workflow: take a screenshot, upload it, wait for analysis, switch back to the conversation. This is typically a five-to-seven-step process involving at minimum two app switches. By the time the user has the suggestion in hand, the conversational moment has often passed or the other person has sent another message.

A keyboard extension eliminates all of those steps. It is always present. It requires no navigation. The user never leaves the conversation. The psychological impact of this is significant: it means the tool feels like an extension of the user's own thinking rather than a separate consultation step.

|  |
| --- |
| **The Zomato Principle**  When Zomato launched, restaurants were already doing delivery. The food existed. The demand existed. What Zomato built was not a new product category — it was a friction elimination system that made an existing behavior so easy that vastly more people did it. Subtext operates on the same principle. AI texting advice already exists. People are already doing it manually through ChatGPT. Subtext's moat is the elimination of friction between the moment of anxiety and the moment of relief. |

## **2.3 What Makes Subtext Different From Generic AI**

The most important objection to Subtext is: why not just use ChatGPT? The honest answer is that for a person with zero context and no relationship with a specific AI tool, ChatGPT is a reasonably good substitute. But Subtext is better in three specific ways that compound over time.

### **2.3.1 Context Persistence Within a Conversation**

When a user opens ChatGPT and pastes a message, ChatGPT has no knowledge of what has been said before in that conversation. Every query is cold. The user must re-explain context every single time. Subtext maintains the full conversation thread in its context panel during the session, meaning every new suggestion is informed by everything that has been said before. The quality of advice improves as the conversation progresses.

### **2.3.2 Person-Specific Profiles Stored Locally**

Over time, as users interact with Subtext on conversations with specific people, Subtext builds a communication profile for that person — their typical response patterns, the language they use, whether they are typically direct or indirect. Critically, this profile is stored entirely on the user's device. It never leaves the phone. It is never accessible to the company. The AI uses it locally to give better calibrated advice.

This transforms the quality of analysis over time. Instead of evaluating a message in isolation, Subtext can say: 'This reply is shorter than usual for them. That shift is worth noting.' That is not something ChatGPT can do because ChatGPT does not remember previous conversations.

### **2.3.3 Goal-Oriented Reply Framing**

ChatGPT will write a reply if asked. It will not tell you which reply is most likely to achieve your specific goal in this specific relationship. Subtext asks the user to specify their objective — do they want to keep things warm, create a date, de-escalate tension, or express interest without seeming desperate — and generates suggestions specifically optimized for that outcome. This goal-setting framework is built into the product architecture, not bolted on as an afterthought.

## **2.4 Modes of Use**

Subtext is designed to serve users across a range of contexts, not just romantic messaging. The AI's tone, framing, and suggestions adapt based on the mode the user has selected.

|  |  |
| --- | --- |
| **Mode** | **Description** |
| Dating Mode | Analysing messages from romantic interests. Calibrated for warmth, attraction, pacing, and avoiding common mistakes like over-eagerness or seeming disinterested. |
| Friendship Mode | Managing the dynamics of platonic friendships. Particularly useful for people who find it hard to read whether a friend is genuinely busy or pulling away. |
| Interview Mode | Real-time assistance with written interview communications — follow-up emails, responses to recruiter messages, thank-you notes. Calibrated for professionalism and strategic positioning. |
| Networking Mode | Cold outreach, response to LinkedIn messages, follow-ups after events. Calibrated for clarity and relationship building without desperation. |
| Conflict Mode | De-escalation assistance for conversations that are going sideways. Helps users respond to passive-aggressive or aggressive messages without escalating or capitulating. |
| General Mode | Catch-all mode for everyday messaging where the user just wants a sense check on tone and meaning. |

## **2.5 The Help Level System**

Not every user needs the same level of assistance. A severely socially anxious introvert who freezes completely when they receive a message from someone they like needs different support than a confident extrovert who just wants a second opinion occasionally. Subtext uses a Help Level system from one to five.

|  |  |  |
| --- | --- | --- |
| **Level** | **Name** | **Description** |
| Level 1 | Analysis only | Subtext tells the user what the incoming message likely means. No reply suggestions. Just interpretation. |
| Level 2 | Analysis + one suggestion | Subtext provides interpretation and one recommended reply, with a brief explanation of why. |
| Level 3 | Analysis + three options | Full analysis plus three reply options calibrated to different goals or tones. |
| Level 4 | Full coaching | Analysis, suggestions, and a brief coaching note on patterns the user should be aware of in how they are coming across. |
| Level 5 | Ghost-write mode | Subtext writes the reply in full. User reviews, edits to their voice, and sends. Maximum assistance for maximum anxiety situations. |

Users can change their help level at any time, and can set different default levels for different contacts or modes. A user might run at Level 2 for most messaging but switch to Level 5 when texting someone they are very anxious about.

The help level system also doubles as a self-improvement track for users who explicitly want to develop their own skills over time. They can use the app heavily at Level 5 initially, and consciously reduce their level as they become more confident. This is entirely optional and user-directed.

## **2.6 The Second Brain — Paid Feature**

The Second Brain is Subtext's most powerful paid-tier feature. It transforms the app from a reactive tool — one that helps you respond to messages — into a proactive relationship intelligence system that builds and maintains a detailed, living knowledge base about the specific people who matter most to the user.

The analogy is exact. A person who is naturally gifted at relationships already does this instinctively — they remember that their friend hates surprises, that their romantic interest lights up when someone mentions obscure cinema, that their manager's mood shifts on Monday mornings after a bad weekend. They carry this knowledge in their head and use it constantly, without thinking about it. Most people cannot do this at scale. The Second Brain does it for them.

|  |
| --- |
| **The Obsidian Principle**  Power users already build relationship knowledge bases manually — in Obsidian notes, Notion pages, Apple Notes folders, or just in their heads. Subtext automates this for people who would benefit from it but would never build it themselves. It is not a new behaviour. It is the same behaviour with the friction removed. |

### **2.6.1 What the Second Brain Captures**

For any contact the user designates as a Second Brain contact, Subtext analyses their shared conversations — either through the import flow or accumulated session history — and builds a structured personal profile. This profile is divided into the following categories.

* Interests and passions: topics the contact talks about frequently or with elevated energy — music, films, sports, food, specific subjects, hobbies. The AI infers enthusiasm not just from explicit statements but from how much they write and how fast they respond when a topic comes up.
* Dislikes and sensitivities: things the contact reacts negatively to, topics they shut down, people they have expressed frustration about, types of humour that land badly. This category is as valuable as the interests category and is frequently overlooked.
* Important dates: birthdays, anniversaries, exams, job interviews, travel dates, any specific event the contact has mentioned. The app surfaces these proactively with a reminder in the keyboard panel when the date approaches — 'Her exam is in three days. She mentioned she has been stressed about it.'
* Communication preferences: whether this person likes long messages or short ones, whether they prefer voice notes (flagged from mentions), what time of day they are most responsive, how they signal that they want to end a conversation.
* Significant people in their life: family members mentioned by name, close friends, colleagues, anyone who appears repeatedly in the contact's messages. The app builds a social map so the user understands the cast of characters without having to remember every mention.
* Ongoing situations: the job hunt they mentioned two months ago, the difficult family situation they hinted at, the project they have been working on. The Second Brain tracks open threads so the user can ask about them naturally rather than forgetting they were ever mentioned.
* User-added notes: the user can manually add anything to a contact's profile that the AI has not captured — a physical detail, something a mutual friend mentioned, something they noticed in person. The AI profile and the manual notes exist in the same view.

### **2.6.2 How It Appears in the Keyboard**

The Second Brain does not require the user to open a separate app or navigate away from the conversation. It surfaces inside the keyboard panel automatically when it has something relevant to contribute.

When the user opens Subtext while texting a Second Brain contact, the panel shows a small persistent card at the top with the most contextually relevant piece of profile information. If the contact's birthday is in four days, that card surfaces. If the contact mentioned a stressful event recently that the current conversation touches on, the card surfaces. If the user is about to send a message on a topic the contact has previously reacted badly to, the panel flags it.

The user can also swipe open a full profile view from within the keyboard — a quick-access summary of everything Subtext knows about that contact, organised by category. This is the Second Brain dashboard: a clean, readable profile that the user can scan in ten seconds before or during a conversation to ground themselves in relevant context.

### **2.6.3 Storage Architecture**

Second Brain profile data is stored using the same privacy-first architecture as the core profile system, with one additional option for paid users.

* On-device storage (default): all Second Brain data lives in the app's sandboxed local storage on the user's phone. It does not leave the device. It is not accessible to the company. It is backed up only through the user's own device backup system (iCloud or Google Drive) in an encrypted format.
* Protected cloud sync (optional, paid): for users who want their Second Brain available across multiple devices or who are concerned about data loss when changing phones, Subtext offers an encrypted cloud sync option. The encryption key is held by the user, not by the company. The company's servers store only encrypted blobs that they cannot read. This is architecturally similar to how a password manager like Bitwarden operates — the company provides the storage infrastructure but is cryptographically incapable of reading the contents.

The legal framing here is important. The Second Brain is built from data the user has imported or accumulated through their own conversations. It is their knowledge about a person they have a relationship with. People have always maintained this kind of knowledge — in diaries, in contact notes, in their own memory. Subtext is a structured tool for doing the same thing. The legal exposure is no greater than writing notes about a friend in a private journal.

### **2.6.4 What This Is Not**

The Second Brain is explicitly not a surveillance tool. It does not run in the background monitoring anything. It does not access contacts the user has not designated. It does not share information between users. One user's Second Brain profile of a contact is completely invisible to any other user, even if both users have added the same person as a contact.

It is also not a manipulation tool in the negative sense. The framing throughout the product is contextual awareness, not psychological exploitation. The goal is helping the user be a more attentive, more thoughtful communicator — to remember the things they already cared about but could not hold in their head simultaneously. The product copy, the onboarding, and the feature naming all reinforce this framing.

|  |
| --- |
| **The Right Analogy to Use**  When explaining the Second Brain to users, the right analogy is not 'we build a profile on your contacts.' The right analogy is: 'You know how your best friend remembers everything about the people they care about — their favourite things, what they are going through, what matters to them? We help you be that person.' That is what this feature does. That is how it should be described. |

# **PART THREE: TECHNICAL ARCHITECTURE**

## **3.1 Overview**

The Subtext technical stack is designed around three non-negotiable requirements: speed, privacy, and cross-platform availability. Every architectural decision is evaluated against these three criteria.

|  |
| --- |
| **Core Technical Principle**  No conversational data belonging to a third party — meaning the person the user is texting — ever touches company servers. All behavioral profile data is stored on-device. The company's servers process only the anonymised, session-specific query text submitted by the user, and that data is not retained after the session ends. |

## **3.2 Keyboard Extension Technology**

### **3.2.1 Android**

Android's Input Method Framework (IMF) provides full support for custom keyboard applications. Third-party keyboards on Android can access notification content with explicit user permission through the NotificationListenerService API. This allows Subtext to optionally receive incoming message text passively, without requiring the user to copy and paste manually. The user grants this permission explicitly during onboarding and can revoke it at any time.

NotificationListenerService is a documented, officially supported Android API. It is used by hundreds of popular applications including Gmail, Outlook, and various accessibility tools. It does not constitute malware behavior when disclosed in the app's permission request and privacy policy.

Android also supports the copy-paste panel interaction model — the same expandable context panel available on iOS. This gives Android users two input paths: passive capture via the notification listener (zero friction, requires permission), or manual copy-paste into the panel (one tap, requires no special permission). Users who are uncomfortable granting notification access can use the copy-paste panel exclusively with no loss of core functionality. The notification listener is an upgrade to convenience, not a requirement.

### **3.2.2 iOS**

iOS keyboard extensions are more restricted than Android. The primary limitation is memory — iOS allocates significantly less memory to keyboard extensions than to full applications. The keyboard extension approach is nonetheless viable on iOS with the following constraints understood.

* Heavy ML inference cannot run inside the keyboard extension itself on iOS due to memory limits.
* Network requests from keyboard extensions require the Full Access permission, which must be explicitly granted by the user.
* The copy-paste model — user copies incoming message, it auto-populates in the Subtext keyboard panel — is the primary interaction model for iOS. This adds one step compared to Android's passive notification capture but remains significantly faster than the screenshot workflow used by competitors.

On iOS, the AI inference happens via an API call to the cloud (or optionally to a local on-device model when available). The keyboard extension handles UI and data capture; the heavy processing happens in a companion app or cloud endpoint.

## **3.3 AI Inference Architecture**

### **3.3.1 Prototype Phase**

In the prototype and early MVP phase, Subtext uses cloud-based AI inference. The specific model used is determined by a combination of quality, latency, and cost.

* Primary recommendation: Google Gemini Flash. Extremely fast inference, low cost per token, strong performance on conversational analysis tasks. Available via free tier for development and low-volume production.
* Alternative: Anthropic Claude Haiku. Strong at nuanced language tasks, fast, cost-effective.
* Alternative: OpenAI GPT-4o mini. Widely used, good performance, competitive pricing.

For the prototype, the specific model matters less than shipping something users can test. Pick one, build around it, and iterate. Model-switching is easy to implement once the infrastructure exists.

### **3.3.2 Production Phase**

Post-funding, Subtext moves toward a hybrid inference architecture.

* A lightweight on-device model handles pattern recognition, profile management, and low-stakes analysis tasks. Candidates include Google's Gemma 3 (1B or 2B parameter versions), which are specifically optimised for mobile deployment and publicly available.
* Complex analysis tasks, multi-turn coaching, and novel situations route to the cloud model via encrypted API calls.
* The routing decision is made automatically based on task complexity, device capability, and network availability. On a high-end Android device with a good connection, most tasks run on-device. On a low-end device or offline, the app degrades gracefully to basic local analysis.

### **3.3.3 Long-Term Vision**

The company's long-term technical moat is a purpose-trained model fine-tuned specifically on conversational pattern recognition and social dynamics — not a general-purpose LLM. General models are good at this task. A purpose-trained model, fine-tuned on the specific patterns of how people communicate anxiety, interest, disengagement, and deception through text, would be significantly better. This requires a large dataset of annotated conversational exchanges, which the company can begin accumulating (with consent and anonymisation) from day one.

## **3.4 Local Profile Architecture**

The local profile system is one of Subtext's primary competitive differentiators. It is also the component that requires the most careful design to execute correctly.

### **3.4.1 What Gets Stored**

For each contact a user interacts with through Subtext, the app builds a local profile containing the following data.

* Average response time distribution by time of day and day of week.
* Typical message length and vocabulary complexity.
* Frequency of emoji use, punctuation patterns, and capitalisation habits.
* Common opening and closing phrases.
* Significant deviations from established patterns — when something is different from normal, this is flagged.
* User-defined tags: the user can label a contact as 'tends to be brief when stressed' or 'always uses punctuation when being formal' to help the AI contextualise anomalies.

None of this data includes the actual content of messages in raw form. It is statistical and behavioural pattern data. The raw messages are processed, the patterns are extracted, and only the patterns are stored. This further reduces the sensitivity of the stored data.

### **3.4.2 Where It Lives**

All local profile data is stored in the app's sandboxed local storage on the user's device. On iOS, this means the app's Documents directory, which is excluded from iCloud backup by default in Subtext's configuration. On Android, it is stored in the app's private internal storage. Neither platform allows other apps to access this data without root access.

The company's servers never receive this data. The AI model that uses it runs either on-device or receives a sanitised, anonymised summary sufficient to generate advice — not the raw profile.

### **3.4.3 Historical Data Import**

For existing relationships where the user has years of conversational history, Subtext provides an optional import flow.

Meta (Facebook and Instagram) is legally required under GDPR and its own terms of service to provide users with a downloadable copy of their own data, including DM history. The user can request this export from Instagram's settings, receive a JSON file, and import it into Subtext. Subtext processes this file entirely on-device, extracts the behavioural pattern data, builds the profile, and deletes the raw JSON. The entire process happens locally. No raw message content is ever uploaded.

This is not a legally grey area. The user is importing their own data from a platform they use, processing it in an app they have installed, on their own device. There is no violation of any party's rights.

Similar export functionality exists for WhatsApp (which supports chat export as a text file) and Telegram.

## **3.5 System Prompt Architecture**

The quality of Subtext's analysis depends heavily on the system prompt engineering — the instructions given to the underlying AI model that shape how it interprets messages and generates suggestions. This is a significant and underappreciated technical asset.

Most ChatGPT wrappers use naive prompting: 'Help me reply to this message.' Subtext's system prompts are substantially more sophisticated, encoding the following.

* A framework for identifying the most likely interpretations of an ambiguous message, ordered by probability.
* A taxonomy of common conversational anxiety patterns and the cognitive distortions associated with each.
* Mode-specific context: the system prompt for Dating Mode is substantively different from Interview Mode.
* Goal-oriented reply generation: the prompt instructs the model to generate suggestions that optimise for the user's stated goal, not just for surface-level politeness.
* Calibration for authenticity: suggestions are designed to sound like a real person, not like a corporate email.

The system prompt library is a proprietary technical asset that compounds in value as it is refined. Early competitors who simply wrap a general model will produce inferior results on the nuanced, high-stakes social scenarios where Subtext's users need the most help.

# **PART FOUR: MARKET ANALYSIS**

## **4.1 Total Addressable Market**

The market for Subtext is defined at multiple levels of specificity, each nested inside the other.

### **4.1.1 Broadest Definition: Social Anxiety and Loneliness Management**

The global mental health app market was valued at approximately USD 6.2 billion in 2023 and is projected to grow at a compound annual growth rate of over 16% through 2030. Social anxiety disorder affects an estimated 12% of the global population at clinical levels, with significantly higher rates of subclinical social discomfort. This is a large, growing, and underserved market.

### **4.1.2 Mid-Level Definition: AI Communication Assistance**

The AI writing and communication assistant market — which includes products like Grammarly, Jasper, and Copy.ai — was valued at approximately USD 1.9 billion in 2023 and is growing at similar rates. Subtext is not strictly a writing assistant, but it competes in the same attention space and addresses the same fundamental question: how do I communicate better?

### **4.1.3 Specific Definition: AI Texting and Social Coaching Apps**

This is the most relevant competitive market. It is also the most nascent. Rizz App, Keys AI, and Wingman have collectively demonstrated that users will download, use, and pay for AI assistance with personal text messaging. The market is not hypothetical. It exists. It is growing. It is not yet captured by any product with a genuinely superior experience.

## **4.2 Primary User Segments**

|  |  |
| --- | --- |
| **Segment** | **Description** |
| Young men navigating romantic texting | The largest and most motivated segment. Men aged 16 to 28 who experience high anxiety around texting people they are romantically interested in. This segment has the strongest willingness to pay, the highest engagement frequency, and the most acute pain. They will tell their friends when it works. |
| Young women navigating ambiguous social signals | Women in the same age range who experience anxiety primarily around reading social signals — is this friend pulling away? — rather than initiation. Different use patterns, same acute pain. |
| Job seekers managing professional communication | People in active job search who need help with recruiter communication, follow-up emails, and navigating professional social dynamics. Distinct use case with its own mode. |
| Neurodivergent users | People with ADHD, autism spectrum, or other conditions that affect social communication pattern recognition. A smaller but extremely motivated segment for whom this tool is not a convenience but a genuine accessibility aid. |
| Social anxiety sufferers in recovery | People who are actively working on their social anxiety and want a structured, self-aware tool that helps them build skill rather than just dependency. |

## **4.3 Geographic Strategy**

The initial launch market is India, specifically targeting young urban users on Android. This decision is strategic, not arbitrary.

* India has the largest number of WhatsApp users of any country in the world — over 500 million monthly active users. WhatsApp is the dominant messaging platform for social and romantic communication, particularly among young adults.
* The Android market share in India is approximately 95%, meaning the more capable notification-based integration is available to virtually the entire target market.
* The regulatory environment for data startups is developing rather than entrenched, creating more operational flexibility for an early-stage company still iterating on its privacy architecture.
* The acute social anxiety pain point is culturally amplified in India by specific factors: family pressure around relationships, the prevalence of semi-arranged or family-introduced romantic connections, and strong stigma around being seen as socially inexperienced.
* A successful India launch creates the foundation for expansion into Southeast Asia, the Middle East, and eventually Western markets.

# **PART FIVE: COMPETITIVE ANALYSIS**

## **5.1 Current Competitors**

The AI texting assistant space currently has several players. None of them have built the keyboard-native experience that Subtext is targeting. This is either because they have not thought of it, or because they found the technical constraints too difficult. Subtext's job is to find out which one it is and execute before they do.

### **5.1.1 Rizz App**

Rizz App was one of the first purpose-built AI texting assistants to gain significant consumer traction. Its core experience is screenshot-based: take a screenshot of the conversation, upload it to the app, receive reply suggestions. It has a clean interface and decent AI quality. Its fatal product flaw is the screenshot workflow — multiple steps, slow, breaks conversational flow. It has not shipped a keyboard integration. Revenue model is subscription-based.

### **5.1.2 Keys AI**

Keys AI appeared on Shark Tank and received significant media attention. It functions as a keyboard application but its AI suggestions are primarily grammar and tone improvements rather than deep conversational analysis and subtext decoding. The product is closer to a smart autocorrect than a social intelligence tool. It does not do relationship-specific context or goal-oriented reply generation.

### **5.1.3 Wingman**

Wingman focuses on the dating use case specifically, primarily targeting men. Its experience is also screenshot-based. It has the same fundamental friction problem as Rizz App, and its narrow focus on dating means it cannot expand to the broader social communication market without rebuilding its product positioning.

### **5.1.4 ChatGPT / Gemini**

These are not direct competitors but they are the primary indirect alternative. The free workaround — pasting a message into ChatGPT and asking for help — is fast and reasonably effective. Subtext's job is to be better than this free alternative in a specific, narrow way: frictionlessness, contextual memory, and goal-oriented framing. It does not need to be better at everything. It needs to be decisively better at the specific use case.

## **5.2 Competitive Positioning**

|  |  |  |
| --- | --- | --- |
| **Product** | **Interaction Model** | **Core Feature** |
| Rizz App | Screenshot upload | Dating-focused AI suggestions |
| Keys AI | Keyboard | Grammar and tone improvement only |
| Wingman | Screenshot upload | Dating-focused, men only |
| ChatGPT | Browser or app switch | General purpose, no context memory |
| Subtext | Native keyboard, zero switch | Subtext analysis + local profiles + goal-oriented suggestions + multi-mode |

# **PART SIX: LEGAL FRAMEWORK AND RISK MANAGEMENT**

Privacy and data law is the highest-stakes legal domain for Subtext. Getting this wrong is a company-ending error. Getting it right is a competitive advantage. This section addresses every significant legal consideration with specific guidance on how to handle each one.

## **6.1 The Core Legal Principle**

Subtext's legal position is built on one foundational principle: the company never possesses conversational data about third parties who have not consented to be in the system. This is not just a legal strategy. It is the product architecture. The local profile system, the on-device storage, and the session-only cloud processing model all exist in service of this principle.

|  |
| --- |
| **Why This Matters**  The most common privacy enforcement action against consumer apps comes not from regulators finding a breach but from a journalist running a network inspection tool and discovering that an app claiming to be private is sending personal data to servers. Subtext's architecture makes that story impossible to write, because the data genuinely does not leave the device. That is not a legal disclaimer. It is a technical fact. |

## **6.2 Third-Party Data and Consent**

When a user pastes their girlfriend's message into Subtext, the girlfriend has not consented to having her words processed by an AI system. This creates a legal consideration that must be addressed directly.

The honest legal analysis is as follows. Under GDPR, processing personal data requires a lawful basis. For data submitted by one individual about another, the most defensible basis is legitimate interest — specifically, the user's legitimate interest in understanding the communication they have received and composing an appropriate reply. This is the same basis under which email clients process the content of received emails, under which spell-checkers process typed content, and under which read-receipts reveal to the sender that their message has been seen.

This is a defensible but not ironclad position. The stronger protection is the architecture itself: if the third-party message content is processed ephemerally, session-only, never stored, and never sent to company servers, the practical exposure is minimal. The regulatory target for enforcement is systematically built databases of third-party personal data. A keyboard that processes a message for a few seconds to generate a reply is categorically different from that.

For the Indian market at initial launch, GDPR is not directly applicable. India's Digital Personal Data Protection Act (DPDPA) 2023 is the relevant framework. It requires consent for processing personal data, but the consent and disclosure requirements can be satisfied through the user's explicit agreement to Terms of Service at onboarding.

## **6.3 Data Minimisation by Architecture**

The best legal protection against data privacy claims is not a terms of service document. It is an architecture that does not create the data to be claimed against. Subtext is designed around the principle of data minimisation.

* Session data: Messages submitted for analysis within a session are processed and then discarded. They are not logged to persistent storage on company servers.
* Profile data: Stored locally on device only. Company servers never hold individual user profiles.
* Import data: The Instagram JSON import is processed on-device, patterns are extracted, raw data is deleted. The company never receives the import file.
* Analytics: Only anonymised, aggregated usage metrics are sent to company servers — number of sessions, mode usage frequency, subscription events. No message content, no individual behavioral data.

## **6.4 App Store Compliance**

Both Apple App Store and Google Play Store have specific rules around keyboard extensions and data handling that Subtext must comply with to ship and remain available.

### **6.4.1 Apple App Store**

Apple requires that keyboard extensions requesting the Full Access permission — which is required to make network requests and therefore to call the cloud AI API — explicitly disclose in the App Store listing and in the app's permission request that network access is being used, and what it is used for. Subtext must clearly state that keyboard input is sent to its servers only when the user explicitly activates analysis, not continuously.

Apple's App Store Review Guidelines specifically prohibit keyboards that continuously capture user input without disclosure. Subtext's architecture, in which analysis is triggered by the user's explicit action (copying a message, tapping the analysis button) rather than continuous keystroke logging, is compliant with this requirement.

### **6.4.2 Google Play Store**

Google Play has similar requirements for apps using the NotificationListenerService permission, requiring explicit disclosure of what notifications are being read and why. The permission request UI must clearly explain the use case. Continuous notification access that is not directly tied to the app's advertised functionality is grounds for removal.

Subtext's notification access is specifically for receiving incoming messages in messaging apps when the user has enabled this feature. This is clearly within the scope of the app's stated purpose and will survive review.

## **6.5 Terms of Service and Privacy Policy Requirements**

Subtext must ship with a properly drafted Terms of Service and Privacy Policy before going live. These documents must address the following at minimum.

* Explicit description of what data is collected, where it is stored, and how long it is retained.
* Clear statement that third-party message content is processed ephemerally and not stored on company servers.
* Clear statement that local profile data never leaves the user's device.
* Description of the Instagram data import feature, specifying that import files are processed locally and deleted.
* User rights under applicable law including the right to delete their account and all associated data.
* Description of what anonymised analytics data is collected and for what purpose.
* Contact information for privacy-related enquiries.

These documents should be drafted by a lawyer familiar with privacy law in the target jurisdiction. This is a one-time cost of a few hundred to a few thousand dollars that dramatically reduces the risk of regulatory action and App Store rejection.

## **6.6 What Is Not a Legal Risk**

Several concerns that might seem legally risky are actually well-established and unproblematic.

* Building a profile of communication patterns from data a user imports from their own account is legally equivalent to a contacts app analysing communication frequency. It is not profiling in the regulated sense.
* Giving communication advice is not the practice of therapy or psychology. Subtext gives conversational suggestions, not mental health treatment. The distinction matters legally.
* Operating as a keyboard that sees what the user types is explicitly permitted under both iOS and Android platforms when the Full Access permission is properly disclosed.

# **PART SEVEN: BUSINESS MODEL AND MONETISATION**

## **7.1 Revenue Architecture**

Subtext operates on a freemium subscription model. The free tier is genuinely useful — not artificially crippled — because free users drive organic growth and serve as conversion pipeline for paid subscribers.

|  |  |
| --- | --- |
| **Feature** | **Tier** |
| Basic message analysis | Free |
| Three reply suggestions per analysis | Free |
| General Mode | Free |
| Five analyses per day | Free |
| Unlimited analyses | Paid |
| Local contact profiles | Paid |
| All conversation modes (Dating, Interview, etc.) | Paid |
| Conversation history within session | Free |
| Conversation history across sessions | Paid |
| Help Level 4 and 5 (coaching and ghost-write) | Paid |
| Instagram history import | Paid |
| Tone analysis and coaching feedback | Paid |
| Second Brain — contact knowledge profiles | Paid |
| Second Brain — important dates and proactive reminders | Paid |
| Second Brain — encrypted cloud sync across devices | Paid (Pro tier) |
| Second Brain — manual note-adding to contact profiles | Paid |

## **7.2 Pricing**

For the Indian market at launch, pricing must be calibrated to local purchasing power, not Western SaaS benchmarks.

* Free tier: unlimited with daily cap on analyses.
* Subtext Plus: INR 199 per month (approximately USD 2.40). Unlimited analyses, all modes, local profiles.
* Subtext Pro: INR 399 per month (approximately USD 4.80). Everything in Plus, plus history import, coaching features, and priority AI quality.

These price points are low enough that a motivated 19-year-old will pay without needing parental permission, high enough to build a sustainable revenue base, and competitive with other Indian consumer subscription apps.

## **7.3 Growth Model**

Subtext's growth strategy relies primarily on word of mouth from high-value success moments. The product is designed to create these moments.

When Subtext helps a user navigate a conversation that results in a date, a reply from someone who had gone quiet, or a job interview follow-up that gets a callback, that user tells people. Not in a forced referral mechanic way — organically, the way people share any tool that created an emotionally significant outcome.

The secondary growth channel is social media content. The dating and social anxiety anxiety space is one of the highest-engagement content categories on Instagram Reels, YouTube Shorts, and TikTok. Short-form content showing 'I used this app and here is what happened' is both organic and extremely shareable. Rizz App and Wingman both grew significantly through this channel. Subtext is a better product for the same audience, which means the same content flywheel applies.

# **PART EIGHT: PRODUCT ROADMAP**

## **Phase 1 — Prototype (Weeks 1 to 8)**

The goal of Phase 1 is not to build the finished product. It is to answer one question: will people use this enough to pay for it?

* Build a simple Android app with a basic keyboard that accepts pasted message text in a context panel.
* Integrate Gemini Flash API for analysis and reply generation.
* Implement three modes: General, Dating, Interview.
* Implement Help Levels 1 through 3.
* Ship to fifty users. Watch what they do. Talk to them.

Do not build local profiles. Do not build history import. Do not build iOS. Do not build anything that is not required to answer the core question.

## **Phase 2 — MVP (Weeks 9 to 20)**

If Phase 1 shows genuine usage and even modest willingness to pay, Phase 2 builds the differentiated version.

* Implement local contact profiles on Android.
* Add Instagram JSON import flow.
* Add notification listener for passive message capture on Android.
* Implement all five modes and all five Help Levels.
* Build Second Brain feature: contact knowledge profiles, important dates, proactive reminders, in-keyboard profile card.
* Build subscription infrastructure (free vs paid tier).
* Soft launch on Google Play Store in India.

## **Phase 3 — Growth (Month 6 onwards)**

Post-revenue-evidence, Phase 3 focuses on defensibility and scale.

* iOS keyboard extension launch.
* On-device model integration for core analysis tasks.
* Tone coaching feature.
* Second Brain encrypted cloud sync — user-held keys, zero-knowledge architecture.
* Expanded conversation history across sessions for paid users.
* Begin collecting anonymised, consented training data for proprietary model development.
* Raise seed funding or angel round to fund model development and growth.

# **PART NINE: RISKS AND MITIGATIONS**

|  |  |
| --- | --- |
| **Risk** | **Mitigation** |
| Platform risk: Apple or Google removes the app | Maintain strict compliance with App Store guidelines from day one. No grey-area permission usage. Clear disclosure in every permission request. Build iOS and Android in parallel so neither is a single point of failure. |
| Competition risk: Rizz App or Keys AI ships a keyboard integration | Speed is the primary mitigation. The keyboard architecture advantage is only a moat while you have it. Ship before they do. Second mitigation: local profiles are harder to copy than a keyboard UI. |
| User behaviour risk: people do not form the paste-and-analyse habit | Onboarding design is critical. First-session experience must create a success moment within two minutes. If the first analysis is genuinely good, the habit forms. If it is mediocre, it does not. |
| Anxiety amplification risk: the app makes users more anxious, not less | Build in deliberate friction for obsessive usage patterns. If a user has analysed the same message six times in an hour, the app should gently surface this. Design for outcome, not engagement. |
| AI quality risk: suggestions are generic or wrong | System prompt quality and ongoing refinement. Collect explicit feedback on suggestions. Build the feedback loop into the product from day one. |
| Regulatory risk at scale | Architecture is the mitigation. No company-held personal data means no personal data to be regulated against. Maintain this as a technical fact, not just a policy. |

# **PART TEN: FOUNDER-MARKET FIT**

## **10.1 Why This Problem, Why Now**

The strongest indicator of founder-market fit is when the founder understands the problem not from research but from lived experience. The description of the anxiety feedback loop that surrounds text communication — the overthinking, the seventeen drafted replies, the group chat screenshot spiral — is not the language of someone who read a product brief. It is the language of someone who has been there.

This matters because the product decisions that make the difference between a tool that actually helps anxious people and one that makes them worse are not obvious from the outside. They require an intuitive understanding of how anxiety works in real time — what feels like help and what feels like amplification, what creates relief and what creates new things to worry about.

## **10.2 What Needs to Be True About the Team**

The founder's understanding of the problem is necessary but not sufficient. The following capabilities need to be covered between the founder and any co-founder or early technical hire.

* Android development: keyboard extension construction, notification listener implementation, local storage architecture. This is the primary technical constraint. If you cannot build it yourself, your first hire must be able to.
* Prompt engineering and AI product design: the quality of the system prompt library is a primary product differentiator. This is a craft that requires iteration and genuine interest in the nuance of language.
* Product intuition for anxious users: understanding how to design for someone whose baseline state is hypervigilance. Every onboarding decision, every friction point, every piece of copy affects whether an anxious user feels helped or judged.

## **10.3 The One Honest Caution**

The risk in founder-market fit here is not whether you understand the problem. It is whether the closeness to the problem creates blind spots. Founders who have experienced the pain acutely sometimes over-engineer the solution for their specific version of the pain and miss how other users experience it differently.

The mitigation is aggressive early user research. Talk to fifty users before writing a single line of production code. The prototype is a research tool as much as a product.

# **PART ELEVEN: FINAL VERDICT**

## **11.1 What Makes This Worth Building**

After rigorous pressure testing across five iterations of the idea, the keyboard-native AI chat assistant — as specifically described in this document — is the first version that does not have a company-killing flaw baked into its foundation.

* The legal problem is manageable through architecture rather than legal maneuvering.
* The technical problem is hard but tractable, with a clear prototype-to-production path.
* The market problem is solved: comparable products have demonstrated real willingness to pay.
* The UX differentiation is real and specific: keyboard-native removes the primary friction that competitors have not solved.
* The moat is buildable: local profiles, proprietary prompt library, and eventually a purpose-trained model create compounding differentiation.

## **11.2 What Must Go Right**

For Subtext to succeed, the following must be true.

1. The keyboard interaction model must feel fast and natural. If it adds friction rather than removing it, the product fails its core premise.
2. The first analysis must be genuinely good. If a new user's first experience is a generic, unhelpful suggestion, they leave and never come back.
3. The product must not make anxious users more anxious. This requires careful design of how pattern information is surfaced, how frequently users can query, and how the app responds to obsessive usage.
4. The team must ship Phase 1 fast. The keyboard architecture advantage is a window, not a permanent wall.

## **11.3 The Bottom Line**

|  |
| --- |
| **Final Assessment**  Subtext is a buildable, defensible, market-validated idea with a specific technical insight at its core that competitors have not executed. The problem is real, the pain is acute, the user is motivated, and the existing market demonstrates willingness to pay. The architecture solves the primary legal and privacy risks. The keyboard integration solves the primary UX friction that competitors have failed to eliminate. This is worth building. Stop planning and start shipping the prototype. |

*— End of Document —*
