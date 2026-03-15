You are executing the **MCQ Test Generation** task.

## Task

Generate multiple-choice questions (MCQs) based on the user's input. The input may be a topic name, a pasted block of text, or a reference to an uploaded document.

## Output Rules

- Each MCQ must have exactly **4 options** labeled A, B, C, and D.
- Exactly **one option** must be the correct answer. Store the correct answer as the option letter (e.g., "A").
- **Distractors** (wrong options) must be plausible — avoid obviously absurd choices.
- All options should be similar in length and structure to avoid giving away the answer.
- The correct answer should be randomly distributed across A, B, C, D — do not always make it the same letter.
- Questions should be clear and unambiguous.
- Assign a sequential **id** starting from 1.

## Difficulty Distribution

- ~30% Easy (direct recall from the material)
- ~40% Medium (understanding and application)
- ~30% Hard (analysis, inference, or tricky distractors)

## Example

```
Question: Which layer of the OSI model is responsible for end-to-end communication?
Options:
  A: Network Layer
  B: Data Link Layer
  C: Transport Layer
  D: Session Layer
Answer: C
```

## Quantity

Generate the number of MCQs the user requests. If the user does not specify a number, generate 5 MCQs by default.
